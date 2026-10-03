"""Synthesize every sound effect in the cue list (timeline.json -> `sfx`) and lay them on one stereo bus.

All effects are generated (noise/oscillators) — original and copyright-free. Each generator returns a
stereo or mono signal peaking around -6 dBFS; the cue's `gain` sets its level in the bus.
Writes public/audio/sfx.wav.
"""
from __future__ import annotations

import json

import numpy as np

import dsp
import synth as sy
from dsp import ROOT, SR

TL = json.loads((ROOT / "src" / "timeline" / "timeline.json").read_text(encoding="utf-8"))


def _norm(x: np.ndarray, peak_db: float = -6.0) -> np.ndarray:
    return x / (np.max(np.abs(x)) + 1e-12) * dsp.undb(peak_db)


def _bell(n: int, attack_frac: float = 0.45, power: float = 2.0) -> np.ndarray:
    t = np.linspace(0, 1, n)
    a = np.clip(t / attack_frac, 0, 1)
    d = np.clip((1 - t) / (1 - attack_frac), 0, 1)
    return (np.minimum(a, d)) ** power


def sweep_noise(dur: float, f0: float, f1: float, f2: float | None = None, q: float = 1.6) -> np.ndarray:
    """Noise through a resonant low-pass whose cutoff glides f0 -> f1 (-> f2)."""
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    if f2 is None:
        cut = f0 * (f1 / f0) ** t
    else:
        cut = np.where(t < 0.5, f0 * (f1 / f0) ** (t * 2), f1 * (f2 / f1) ** ((t - 0.5) * 2))
    return dsp.hp(sy.lowpass_tv(sy.noise(n), cut, q=q), 120)


def autopan(x: np.ndarray, p0: float, p1: float) -> np.ndarray:
    p = np.linspace(p0, p1, len(x))
    ang = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(ang), x * np.sin(ang)], axis=1)


def whoosh(pitch: float = 1.0) -> np.ndarray:
    x = sweep_noise(0.5, 350 * pitch, 3200 * pitch, 700 * pitch, q=1.8) * _bell(int(0.5 * SR), 0.55)
    return autopan(_norm(x), -0.6, 0.6)


def zoom(pitch: float = 1.0) -> np.ndarray:
    n = int(0.55 * SR)
    t = np.linspace(0, 1, n)
    air = sweep_noise(0.55, 300, 6000, q=2.2) * t ** 1.6
    tone = sy.sine(260 * 2 ** (t * 1.7), n) * 0.18 * t ** 2
    x = _norm(air + tone) * np.concatenate([np.ones(n - int(0.04 * SR)), np.linspace(1, 0, int(0.04 * SR))])
    return autopan(x, 0, 0)


def sliver(pitch: float = 1.0) -> np.ndarray:  # right-to-left (RTL) swish for the zig-zag wipe
    x = sweep_noise(0.28, 1500, 9000, 2500, q=2.0) * _bell(int(0.28 * SR), 0.4, 1.6)
    return autopan(_norm(x), 0.7, -0.7)


def swish(pitch: float = 1.0) -> np.ndarray:
    x = sweep_noise(0.3, 600, 4200, 1200, q=1.7) * _bell(int(0.3 * SR), 0.45, 1.8)
    return autopan(_norm(x, -7), 0.4, -0.4)


def swoosh(pitch: float = 1.0) -> np.ndarray:
    x = sweep_noise(0.6, 180, 1500, 300, q=2.4) * _bell(int(0.6 * SR), 0.7, 1.5)
    return autopan(_norm(x), -0.3, 0.3)


def pop(pitch: float = 1.0) -> np.ndarray:
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = (520 + 900 * np.exp(-t / 0.012)) * pitch
    body = sy.sine(f, n) * np.exp(-t / 0.035)
    click = dsp.hp(sy.noise(int(0.003 * SR)), 3000) * 0.3
    body[: len(click)] += click
    return _norm(body)


def blip(pitch: float = 1.0) -> np.ndarray:
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    x = sy.sine(880 * pitch * (1 + 0.25 * np.exp(-t / 0.01)), n) * np.exp(-t / 0.025)
    return _norm(x, -8)


def tick(pitch: float = 1.0) -> np.ndarray:
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    x = sy.sine(2400 * pitch, n) * np.exp(-t / 0.006) + dsp.hp(sy.noise(n), 5000) * np.exp(-t / 0.003) * 0.4
    return _norm(x)


def slam(pitch: float = 1.0) -> np.ndarray:
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    thud = sy.sine((48 + 110 * np.exp(-t / 0.03)) * pitch, n) * np.exp(-t / 0.16)
    crack = dsp.bp(sy.noise(n), 600, 5000) * np.exp(-t / 0.025) * 0.5
    x = sy.soft_clip((thud + crack) * 1.5, 1.4)
    return _norm(x, -5)


def snap(pitch: float = 1.0) -> np.ndarray:
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    a = sy.sine(1318.5, n) * np.exp(-t / 0.08) * (t < 0.09)
    b = np.zeros(n)
    s2 = int(0.07 * SR)
    b[s2:] = sy.sine(1975.5, n - s2) * np.exp(-np.arange(n - s2) / SR / 0.18)
    click = np.zeros(n)
    click[: int(0.004 * SR)] = dsp.hp(sy.noise(int(0.004 * SR)), 2500)
    thump = sy.sine(90 + 60 * np.exp(-t / 0.02), n) * np.exp(-t / 0.07) * 0.6
    return _norm(0.5 * a + 0.6 * b + 0.4 * click + thump)


def stamp(pitch: float = 1.0) -> np.ndarray:
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    thump = sy.sine(85 + 70 * np.exp(-t / 0.015), n) * np.exp(-t / 0.06)
    paper = dsp.bp(sy.noise(n), 700, 3500) * np.exp(-t / 0.03) * 0.6
    return _norm(sy.soft_clip((thump + paper) * 1.6, 1.3), -5)


def snip(pitch: float = 1.0) -> np.ndarray:
    n = int(0.22 * SR)
    x = np.zeros(n)
    for off in (0.0, 0.07):
        s = int(off * SR)
        m = int(0.012 * SR)
        x[s:s + m] += dsp.bp(sy.noise(m), 3000, 9000) * np.exp(-np.arange(m) / SR / 0.003)
    shh = dsp.bp(sy.noise(n), 2500, 7000) * _bell(n, 0.3, 2) * 0.25
    return _norm(x + shh)


def draw(pitch: float = 1.0) -> np.ndarray:
    n = int(0.55 * SR)
    t = np.arange(n) / SR
    scribble = dsp.bp(sy.noise(n), 1800, 6000) * (0.55 + 0.45 * np.sin(2 * np.pi * 11 * t)) ** 2
    return autopan(_norm(scribble * _bell(n, 0.2, 1.2), -9), -0.3, 0.3)


def sparkle(pitch: float = 1.0) -> np.ndarray:
    n = int(0.9 * SR)
    x = np.zeros(n)
    rng = np.random.default_rng(5)
    for k in range(9):
        s = int((0.035 * k + rng.uniform(0, 0.02)) * SR)
        m = int(0.25 * SR)
        f = rng.choice([2093, 2349, 2637, 3136, 3520, 4186])
        seg = sy.sine(f, m) * np.exp(-np.arange(m) / SR / 0.06) * (0.9 - 0.06 * k)
        x[s:s + m] += seg[: max(0, min(m, n - s))]
    wet = dsp.convolve(x, dsp.plate_ir(1.2, seed=9, damp_hz=9000))[:n] * 0.35
    return autopan(_norm(x + wet), -0.4, 0.5)


def boom(pitch: float = 1.0) -> np.ndarray:
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    body = sy.sine(40 + 90 * np.exp(-t / 0.05), n) * np.exp(-t / 0.28)
    rumble = dsp.lp(sy.noise(n), 900) * np.exp(-t / 0.12) * 0.6
    return _norm(sy.soft_clip((body + rumble) * 2.0, 1.8), -5)


def riser(pitch: float = 1.0) -> np.ndarray:
    n = int(0.5 * SR)
    t = np.linspace(0, 1, n)
    x = dsp.hp(sy.noise(n), 2500) * t ** 3
    return autopan(_norm(x, -8), 0, 0)


def ding(pitch: float = 1.0) -> np.ndarray:
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    tone = np.zeros(n)
    for f, a, tau in [(1318.5, 1.0, 0.32), (1975.5, 0.55, 0.22), (2637.0, 0.25, 0.12), (3951.0, 0.12, 0.06)]:
        tone += sy.sine(f * pitch, n) * a * np.exp(-t / tau)
    s2 = int(0.11 * SR)
    second = np.zeros(n)
    second[s2:] = (sy.sine(1760 * pitch, n - s2) * np.exp(-np.arange(n - s2) / SR / 0.35))[: n - s2] * 0.8
    return _norm(tone * np.minimum(t / 0.002, 1) + second)


def glitch(pitch: float = 1.0) -> np.ndarray:
    n = int(0.42 * SR)
    rng = np.random.default_rng(42)
    x = np.zeros(n)
    s = 0
    while s < n:
        m = int(rng.uniform(0.008, 0.04) * SR)
        kind = rng.integers(0, 3)
        if kind == 0:
            seg = np.sign(sy.sine(rng.uniform(200, 1600), m)) * 0.6
        elif kind == 1:
            seg = dsp.hp(sy.noise(m), rng.uniform(800, 4000)) * 0.8
        else:
            seg = np.zeros(m)
        x[s:s + m] = seg[: max(0, min(m, n - s))]
        s += m
    x = np.round(x * 6) / 6  # bit-crush
    return autopan(_norm(x * _bell(n, 0.1, 0.6), -7), -0.5, 0.5)


def shimmer(pitch: float = 1.0) -> np.ndarray:
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in (1760, 2217, 2637, 3520, 4434):
        x += sy.sine(f * (1 + 0.002 * np.sin(2 * np.pi * 5 * t)), n)
    x *= np.minimum(t / 0.25, 1) * np.exp(-t / 0.55)
    wet = dsp.convolve(x, dsp.plate_ir(2.0, seed=4, damp_hz=8000))[:n] * 0.5
    return autopan(_norm(x * 0.4 + wet, -8), -0.3, 0.3)


GEN = {f.__name__: f for f in [whoosh, zoom, sliver, swish, swoosh, pop, blip, tick, slam, snap, stamp, snip,
                               draw, sparkle, boom, riser, ding, glitch, shimmer]}


def main() -> None:
    n = int((TL["duration"] + 2.0) * SR)
    bus = np.zeros((n, 2))
    for cue in TL["sfx"]:
        sig = GEN[cue["type"]](cue.get("pitch", 1.0))
        if sig.ndim == 1:
            sig = np.stack([sig, sig], axis=1) * np.sqrt(0.5)
        s = int(round(cue["t"] * SR))
        e = min(n, s + len(sig))
        bus[s:e] += sig[: e - s] * dsp.undb(cue["gain"])
    bus = bus[: int((TL["duration"] + 0.05) * SR)]
    dsp.save(ROOT / "public" / "audio" / "sfx.wav", bus)
    print(f"sfx: {len(TL['sfx'])} cues, peak {dsp.db(np.max(np.abs(bus))):.1f} dBFS")


if __name__ == "__main__":
    main()
