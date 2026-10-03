"""Shared DSP helpers for the COREVIA reel audio pipeline (numpy/scipy + ffmpeg)."""
from __future__ import annotations

import json
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt, sosfiltfilt

SR = 48000
ROOT = Path(__file__).resolve().parent.parent


def load(path: str | Path, sr: int = SR) -> np.ndarray:
    """Decode any audio file to mono float32 at `sr` via ffmpeg."""
    cmd = ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def save(path: str | Path, x: np.ndarray, sr: int = SR, subtype: str = "PCM_24") -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), np.asarray(x, dtype=np.float64), sr, subtype=subtype)


def db(x: float | np.ndarray) -> float | np.ndarray:
    return 20 * np.log10(np.maximum(np.abs(x), 1e-12))


def undb(g: float | np.ndarray) -> float | np.ndarray:
    return 10 ** (np.asarray(g) / 20)


def env_db(x: np.ndarray, sr: int = SR, hop_s: float = 0.005, win_s: float = 0.02) -> np.ndarray:
    """Short-time RMS level in dBFS (one value per hop)."""
    hop, win = int(hop_s * sr), int(win_s * sr)
    if len(x) < win:
        return np.array([db(np.sqrt(np.mean(x**2) + 1e-24))])
    frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop]
    return db(np.sqrt(np.mean(frames**2, axis=1) + 1e-24))


def active_rms_db(x: np.ndarray, sr: int = SR, below_peak: float = 30.0) -> float:
    """RMS of the frames that are actually speech (within `below_peak` dB of the peak frame)."""
    e = env_db(x, sr)
    act = e > e.max() - below_peak
    lin = undb(e[act])
    return float(db(np.sqrt(np.mean(lin**2))))


def fade(x: np.ndarray, fin: float, fout: float, sr: int = SR) -> np.ndarray:
    y = x.copy()
    ni, no = int(fin * sr), int(fout * sr)
    if ni > 0:
        y[:ni] *= np.sin(np.linspace(0, np.pi / 2, ni)) ** 2
    if no > 0:
        y[-no:] *= np.cos(np.linspace(0, np.pi / 2, no)) ** 2
    return y


def hp(x: np.ndarray, f: float, sr: int = SR, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, f, "highpass", fs=sr, output="sos"), x)


def lp(x: np.ndarray, f: float, sr: int = SR, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, f, "lowpass", fs=sr, output="sos"), x)


def bp(x: np.ndarray, lo: float, hi: float, sr: int = SR, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, [lo, hi], "bandpass", fs=sr, output="sos"), x)


def zp_lp(x: np.ndarray, f: float, sr: int = SR, order: int = 2) -> np.ndarray:
    """Zero-phase low-pass (for control envelopes)."""
    return sosfiltfilt(butter(order, f, "lowpass", fs=sr, output="sos"), x)


def plate_ir(seconds: float = 1.6, sr: int = SR, seed: int = 7, predelay: float = 0.012,
             damp_hz: float = 6500.0, stereo: bool = False) -> np.ndarray:
    """Synthetic plate-like impulse response: decorrelated noise with exponential decay + HF damping."""
    rng = np.random.default_rng(seed)
    n = int(seconds * sr)
    t = np.arange(n) / sr
    decay = np.exp(-6.9 * t / seconds)  # -60 dB at `seconds`
    chans = []
    for _ in range(2 if stereo else 1):
        noise = rng.standard_normal(n) * decay
        # progressively darker tail: blend a low-passed copy in over time
        dark = lp(noise, damp_hz * 0.35, sr)
        mix = np.clip(t / seconds * 1.6, 0, 1)
        ir = (1 - mix) * lp(noise, damp_hz, sr) + mix * dark
        ir = np.concatenate([np.zeros(int(predelay * sr)), ir])
        ir /= np.sqrt(np.sum(ir**2)) + 1e-12
        chans.append(ir)
    return np.stack(chans, axis=1) if stereo else chans[0]


def convolve(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    if ir.ndim == 1:
        return fftconvolve(x, ir)
    return np.stack([fftconvolve(x, ir[:, c]) for c in range(ir.shape[1])], axis=1)


def ffmpeg_filter(x: np.ndarray, chain: str, sr: int = SR, channels: int = 1) -> np.ndarray:
    """Run a numpy signal through an ffmpeg -af filter chain and return the result."""
    with tempfile.TemporaryDirectory() as td:
        src, dst = Path(td) / "in.wav", Path(td) / "out.wav"
        sf.write(str(src), x, sr, subtype="FLOAT")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", chain,
                        "-ar", str(sr), "-ac", str(channels), "-c:a", "pcm_f32le", str(dst)], check=True)
        y, _ = sf.read(str(dst), dtype="float64")
    return y


def loudness(x: np.ndarray, sr: int = SR) -> dict:
    """Integrated loudness (LUFS), LRA and true peak via ffmpeg ebur128."""
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / "in.wav"
        sf.write(str(src), x, sr, subtype="FLOAT")
        out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(src), "-af", "ebur128=peak=true",
                              "-f", "null", "-"], capture_output=True, text=True).stderr
    summ = out[out.rfind("Summary:"):]
    i = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1))
    lra = float(re.search(r"LRA:\s+(-?[\d.]+) LU", summ).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ).group(1))
    return {"lufs": i, "lra": lra, "true_peak": tp}


def normalize_lufs(x: np.ndarray, target: float, sr: int = SR) -> np.ndarray:
    return x * undb(target - loudness(x, sr)["lufs"])


def write_json(path: str | Path, obj) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(obj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
