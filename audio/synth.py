"""Tiny synthesis toolkit (numpy/scipy) used to compose the original music bed and sound effects.

Everything is generated from oscillators and noise — no samples — so the soundtrack is 100% original
and copyright-free.
"""
from __future__ import annotations

import numpy as np
from scipy.signal import lfilter

from dsp import SR, bp, convolve, hp, lp, plate_ir

RNG = np.random.default_rng(1946)


def note_hz(name: str) -> float:
    """'A4' -> 440.0 ; supports sharps ('C#4') and flats ('Bb3')."""
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    n = names[name[0]]
    rest = name[1:]
    if rest.startswith("#"):
        n += 1
        rest = rest[1:]
    elif rest.startswith("b"):
        n -= 1
        rest = rest[1:]
    midi = 12 * (int(rest) + 1) + n
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------------------------------------------------------------- oscillators
def saw(freq, n: int, phase0: float | None = None) -> np.ndarray:
    """Band-limited (PolyBLEP) sawtooth."""
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    dt = f / SR
    ph0 = RNG.random() if phase0 is None else phase0
    phase = (ph0 + np.cumsum(dt)) % 1.0
    y = 2 * phase - 1
    m1 = phase < dt
    x = phase[m1] / dt[m1]
    y[m1] -= x + x - x * x - 1
    m2 = phase > 1 - dt
    x = (phase[m2] - 1) / dt[m2]
    y[m2] -= x * x + x + x + 1
    return y


def sine(freq, n: int, phase0: float = 0.0) -> np.ndarray:
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    return np.sin(2 * np.pi * (phase0 + np.cumsum(f) / SR))


def tri(freq, n: int) -> np.ndarray:
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    ph = (np.cumsum(f) / SR) % 1.0
    return 4 * np.abs(ph - 0.5) - 1


def noise(n: int) -> np.ndarray:
    return RNG.standard_normal(n)


# ---------------------------------------------------------------- envelopes
def adsr(n: int, a: float, d: float, s: float, r: float, gate: float | None = None) -> np.ndarray:
    """ADSR with exponential-ish segments. `gate` = seconds until release starts (default: n - r)."""
    t = np.arange(n) / SR
    g = (n / SR - r) if gate is None else gate
    env = np.where(t < a, (t / max(a, 1e-4)) ** 0.9, 0.0)
    dec = (t >= a) & (t < g)
    env[dec] = s + (1 - s) * np.exp(-(t[dec] - a) / max(d, 1e-4) * 3)
    rel = t >= g
    lvl_at_gate = s + (1 - s) * np.exp(-(max(g - a, 0)) / max(d, 1e-4) * 3) if g > a else (g / max(a, 1e-4))
    env[rel] = lvl_at_gate * np.exp(-(t[rel] - g) / max(r, 1e-4) * 5)
    return env


def exp_decay(n: int, tau: float) -> np.ndarray:
    return np.exp(-np.arange(n) / SR / tau)


# ---------------------------------------------------------------- filters
def _biquad_lp(fc: float, q: float):
    w0 = 2 * np.pi * min(fc, SR * 0.45) / SR
    alpha = np.sin(w0) / (2 * q)
    cs = np.cos(w0)
    b = np.array([(1 - cs) / 2, 1 - cs, (1 - cs) / 2])
    a = np.array([1 + alpha, -2 * cs, 1 - alpha])
    return b / a[0], a / a[0]


def lowpass_tv(x: np.ndarray, cutoff, q: float = 0.8, block: int = 256) -> np.ndarray:
    """Time-varying resonant low-pass (block-wise biquad, state carried across blocks)."""
    cut = np.broadcast_to(np.asarray(cutoff, dtype=float), (len(x),))
    y = np.empty_like(x)
    zi = np.zeros(2)
    for s in range(0, len(x), block):
        e = min(len(x), s + block)
        b, a = _biquad_lp(float(cut[(s + e) // 2]), q)
        y[s:e], zi = lfilter(b, a, x[s:e], zi=zi)
    return y


def soft_clip(x: np.ndarray, drive: float = 1.0) -> np.ndarray:
    return np.tanh(x * drive) / np.tanh(drive)


# ---------------------------------------------------------------- effects
def delay_pingpong(x: np.ndarray, time: float, fb: float = 0.35, repeats: int = 5, tone: float = 4500) -> np.ndarray:
    """Mono in -> stereo ping-pong echoes (dark repeats)."""
    d = int(time * SR)
    out = np.zeros((len(x) + d * repeats, 2))
    sig = x.copy()
    for k in range(1, repeats + 1):
        sig = lp(sig, tone) * fb
        ch = (k - 1) % 2
        out[k * d:k * d + len(sig), ch] += sig
    return out


def reverb(x: np.ndarray, seconds: float = 2.2, seed: int = 11, damp: float = 6000) -> np.ndarray:
    """Stereo plate send (input mono or stereo -> stereo wet)."""
    ir = plate_ir(seconds, seed=seed, damp_hz=damp, stereo=True)
    if x.ndim == 2:
        x = x.mean(axis=1)
    return convolve(x, ir)


def pan(x: np.ndarray, p: float) -> np.ndarray:
    """Equal-power pan, p in [-1, 1]."""
    ang = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(ang), x * np.sin(ang)], axis=1)


# ---------------------------------------------------------------- instruments
def kick(punch: float = 1.0) -> np.ndarray:
    n = int(0.55 * SR)
    t = np.arange(n) / SR
    f = 46 + 120 * np.exp(-t / 0.035) + 30 * np.exp(-t / 0.006)
    body = sine(f, n) * np.exp(-t / 0.30)
    click = hp(noise(int(0.006 * SR)), 2500) * np.linspace(1, 0, int(0.006 * SR)) * 0.35
    body[: len(click)] += click * punch
    return soft_clip(body * 1.3, 1.6) * 0.95


def clap() -> np.ndarray:
    n = int(0.45 * SR)
    out = np.zeros(n)
    for k, off in enumerate([0.0, 0.011, 0.023, 0.034]):
        s = int(off * SR)
        burst = bp(noise(n - s), 900, 2600) * np.exp(-np.arange(n - s) / SR / (0.012 if k < 3 else 0.16))
        out[s:] += burst * (0.8 if k < 3 else 1.0)
    return out / np.max(np.abs(out)) * 0.8


def hat(open_: bool = False) -> np.ndarray:
    n = int((0.32 if open_ else 0.07) * SR)
    x = hp(noise(n), 7200, order=4) + 0.4 * bp(noise(n), 9000, 14000)
    return x * exp_decay(n, 0.11 if open_ else 0.018) * (0.5 if open_ else 0.45)


def shaker() -> np.ndarray:
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    env = np.minimum(t / 0.012, 1) * np.exp(-t / 0.03)
    return bp(noise(n), 5000, 11000) * env * 0.5


def snare_roll_hit() -> np.ndarray:
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    tone = sine(190 * np.exp(-t / 0.05) + 140, n) * np.exp(-t / 0.04)
    nz = bp(noise(n), 1500, 7000) * np.exp(-t / 0.05)
    return (0.5 * tone + 0.8 * nz) * 0.6


def supersaw(freq: float, n: int, voices: int = 5, detune_cents: float = 14) -> np.ndarray:
    """Stereo detuned saw stack."""
    out = np.zeros((n, 2))
    for v in range(voices):
        cents = (v - (voices - 1) / 2) / ((voices - 1) / 2 or 1) * detune_cents
        f = freq * 2 ** (cents / 1200)
        p = -0.8 + 1.6 * v / max(voices - 1, 1)
        out += pan(saw(f, n), p)
    return out / voices


def pluck(freq: float, dur: float = 0.32, bright: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    osc = 0.65 * saw(freq, n) + 0.35 * saw(freq * 2.0005, n) * 0.5 + 0.25 * sine(freq, n)
    cutoff = 600 + 5200 * bright * np.exp(-t / 0.07)
    y = lowpass_tv(osc, cutoff, q=1.1)
    return y * np.minimum(t / 0.003, 1) * np.exp(-t / (dur * 0.38))


def bass_note(freq: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    sub = sine(freq, n)
    grit = lowpass_tv(saw(freq, n), 260 + 900 * np.exp(-t / 0.06), q=1.0)
    env = np.minimum(t / 0.004, 1) * np.where(t < dur - 0.03, 1.0, np.maximum(0, (dur - t) / 0.03))
    return soft_clip((0.85 * sub + 0.35 * grit) * env, 1.4)
