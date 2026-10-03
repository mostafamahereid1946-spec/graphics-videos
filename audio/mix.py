"""Mix VO + music + SFX with voice-driven multiband ducking, then master for Meta (-14 LUFS, -1 dBTP).

Ducking: an envelope follower on the VO (15 ms attack / 280 ms release, 40 ms look-ahead) drives
per-band gain reduction on the music — lows -4 dB (keeps the kick), voice band -10 dB, highs -6 dB —
plus a static EQ pocket (-3 dB @ 350 Hz, -2.5 dB @ 2.5 kHz) so the voice always sits on top.
Writes public/audio/mix.wav (+ audio/build/duck.json for inspection).
"""
from __future__ import annotations

import json

import numpy as np
import soundfile as sf
from scipy.signal import lfilter

import dsp
from dsp import ROOT, SR

TL = json.loads((ROOT / "src" / "timeline" / "timeline.json").read_text(encoding="utf-8"))


def read(name: str) -> np.ndarray:
    x, sr = sf.read(str(ROOT / "public" / "audio" / name), dtype="float64")
    assert sr == SR, (name, sr)
    return x


def follower(x: np.ndarray, attack: float, release: float) -> np.ndarray:
    """Peak envelope follower with separate attack/release (block-vectorised one-pole)."""
    rect = np.abs(x)
    # decimate to 1 kHz control rate for speed, then interpolate back
    hop = SR // 1000
    ctrl = rect[: len(rect) // hop * hop].reshape(-1, hop).max(axis=1)
    ga, gr = np.exp(-1 / (attack * 1000)), np.exp(-1 / (release * 1000))
    env = np.zeros_like(ctrl)
    e = 0.0
    for i, v in enumerate(ctrl):
        g = ga if v > e else gr
        e = g * e + (1 - g) * v
        env[i] = e
    return np.interp(np.arange(len(x)) / hop, np.arange(len(env)), env)


def peaking(x: np.ndarray, f0: float, gain_db: float, q: float) -> np.ndarray:
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    alpha = np.sin(w0) / (2 * q)
    b = np.array([1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A])
    a = np.array([1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A])
    return lfilter(b / a[0], a / a[0], x, axis=0)


def main() -> None:
    vo = read("vo.wav")
    music = read("music.wav")
    sfx = read("sfx.wav")
    n = int(TL["duration"] * SR)
    vo, music, sfx = (np.pad(a, [(0, max(0, n - len(a)))] + [(0, 0)] * (a.ndim - 1))[:n] for a in (vo, music, sfx))

    # --- static pocket for the voice
    music = peaking(music, 350, -3.0, 1.0)
    music = peaking(music, 2500, -2.5, 0.8)

    # --- VO-driven duck amount (0..1), with look-ahead
    env = follower(vo, 0.015, 0.28)
    look = int(0.04 * SR)
    env = np.concatenate([env[look:], np.zeros(look)])
    env_db = dsp.db(env + 1e-9)
    amount = np.clip((env_db + 46) / 16, 0, 1)  # 0 below -46 dBFS, full duck above -30 dBFS
    amount = dsp.zp_lp(amount, 12)              # smooth gain moves (no zipper)
    amount = np.clip(amount, 0, 1)

    # --- multiband duck on the music (complementary split -> perfect reconstruction at 0 dB)
    low = dsp.lp(music, 200, order=4)
    high = dsp.hp(music, 5000, order=4)
    mid = music - low - high
    g_low, g_mid, g_high = (dsp.undb(-4.0 * amount), dsp.undb(-10.0 * amount), dsp.undb(-6.0 * amount))
    music_d = low * g_low[:, None] + mid * g_mid[:, None] + high * g_high[:, None]
    sfx_d = sfx * dsp.undb(-3.0 * amount)[:, None]

    # --- sum (VO centred) and master
    mix = np.stack([vo, vo], axis=1) * np.sqrt(0.5) * dsp.undb(3.0) + music_d * dsp.undb(-1.0) + sfx_d * dsp.undb(-2.0)
    mix = dsp.ffmpeg_filter(mix, "acompressor=threshold=-18dB:ratio=1.8:attack=12:release=180:knee=6", channels=2)
    # true-peak safe limiting: limit at 4x oversampling so inter-sample peaks are caught too
    tp_limiter = "aresample=192000,alimiter=limit=0.86:attack=3:release=50:asc=1:level=0,aresample=48000"
    for _ in range(3):
        mix = dsp.normalize_lufs(mix, -14.0)
        mix = dsp.ffmpeg_filter(mix, tp_limiter, channels=2)
    mix[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))[:, None]
    dsp.save(ROOT / "public" / "audio" / "mix.wav", mix)
    meas = dsp.loudness(mix)
    print("mix:", meas)

    # per-frame band levels of the final mix -> timeline.json (audio-reactive equaliser in the visuals)
    fps = TL["fps"]
    mono = mix.mean(axis=1)
    hop, win = SR // fps, 4096
    edges = np.geomspace(40, 12000, 13)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    frames = []
    for i in range(TL["durationInFrames"]):
        c = i * hop + hop // 2
        seg = mono[max(0, c - win // 2): c + win // 2]
        seg = np.pad(seg, (0, win - len(seg))) * np.hanning(win)
        mag = np.abs(np.fft.rfft(seg))
        frames.append([float(np.sqrt(np.mean(mag[(freqs >= lo) & (freqs < hi)] ** 2))) for lo, hi in zip(edges[:-1], edges[1:])])
    lv = np.array(frames)
    lv = np.clip(lv / (np.percentile(lv, 98, axis=0) + 1e-9), 0, 1) ** 0.8
    out = np.zeros_like(lv)
    for i in range(len(lv)):  # fast attack, ~150 ms release
        out[i] = np.maximum(lv[i], out[i - 1] * 0.8 if i else 0)
    TL["levels"] = np.round(out, 3).tolist()
    dsp.write_json(ROOT / "src" / "timeline" / "timeline.json", TL)

    # inspection data: duck depth on the voice band every 100 ms
    step = SR // 10
    dsp.write_json(ROOT / "audio" / "build" / "duck.json",
                   {"stepSeconds": 0.1, "midBandDuckDb": [round(-10.0 * float(a), 2) for a in amount[::step]],
                    "loudness": meas})


if __name__ == "__main__":
    main()
