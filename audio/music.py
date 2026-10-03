"""Compose and render the original music bed (D harmonic minor, 120 BPM) from the timeline sections.

Arrangement follows the voice-over: intro pulse -> verse groove under the problem -> riser/snare build under
"مع COREVIA…" -> drop exactly on the first service -> tape-stop + silence for "عايز إيه تاني؟!" -> lift ->
full final groove under the CTA -> resolving chord on the logo.
Writes public/audio/music.wav (stereo, un-ducked, ~-18 LUFS) and audio/build/kicks.json.
"""
from __future__ import annotations

import json

import numpy as np

import dsp
import synth as sy
from dsp import ROOT, SR
from synth import note_hz as N

TL = json.loads((ROOT / "src" / "timeline" / "timeline.json").read_text(encoding="utf-8"))
BEAT = TL["beat"]
TOTAL = TL["duration"]
SEC = {s["id"]: s for s in TL["sections"]}
EV = TL["events"]

CHORDS = {
    "Dm": {"pad": ["A3", "D4", "F4", "A4"], "bass": "D2", "arp": ["D4", "F4", "A4", "D5", "F5", "A5"]},
    "Bb": {"pad": ["Bb3", "D4", "F4", "Bb4"], "bass": "Bb1", "arp": ["Bb3", "D4", "F4", "Bb4", "D5", "F5"]},
    "Gm": {"pad": ["Bb3", "D4", "G4", "Bb4"], "bass": "G1", "arp": ["G3", "Bb3", "D4", "G4", "Bb4", "D5"]},
    "A": {"pad": ["A3", "C#4", "E4", "A4"], "bass": "A1", "arp": ["A3", "C#4", "E4", "A4", "C#5", "E5"]},
}
# D harmonic-minor hook over the dominant (augmented 2nd Bb->C# = the Middle-Eastern colour)
HIJAZ_RUN = ["A4", "Bb4", "C#5", "D5", "E5", "D5", "C#5", "Bb4", "A4", "Bb4", "C#5", "E5", "D5", "C#5", "Bb4", "A4"]

PROG = {
    "intro": [("Dm", 99)],
    "verse": [("Dm", 4), ("Bb", 4), ("Gm", 4), ("A", 99)],
    "build": [("Bb", 4), ("Gm", 4), ("A", 99)],
    "drop": [("Dm", 4), ("Bb", 4), ("Gm", 4), ("A", 4)] * 3,
    "lift": [("Bb", 4), ("A", 99)],
    "final": [("Dm", 4), ("Gm", 4), ("A", 99)],
}

n_total = int((TOTAL + 3.5) * SR)
drums = np.zeros((n_total, 2))
bass = np.zeros((n_total, 2))
pads = np.zeros((n_total, 2))
plucks = np.zeros((n_total, 2))
fx = np.zeros((n_total, 2))
verb_send = np.zeros(n_total)
delay_send = np.zeros(n_total)
kicks: list[float] = []


def put(buf: np.ndarray, sig: np.ndarray, t: float, gain_db: float = 0.0, pan: float = 0.0) -> None:
    s = int(round(t * SR))
    if s >= len(buf) or s < 0:
        return
    if buf.ndim == 2 and sig.ndim == 1:
        sig = sy.pan(sig, pan)
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[: e - s] * dsp.undb(gain_db)


def beats(sec: str) -> list[float]:
    s, e = SEC[sec]["start"], SEC[sec]["end"]
    k = 0
    out = []
    while s + k * BEAT < e - 1e-6:
        out.append(s + k * BEAT)
        k += 1
    return out


def chord_at(sec: str, t: float) -> str:
    """Chord sounding at time t inside a section (progression restarts at every section start)."""
    pos = (t - SEC[sec]["start"]) / BEAT
    acc = 0
    for name, length in PROG[sec]:
        if pos < acc + length - 1e-6:
            return name
        acc += length
    return PROG[sec][-1][0]


def chord_spans(sec: str) -> list[tuple[str, float, float]]:
    s, e = SEC[sec]["start"], SEC[sec]["end"]
    spans, t = [], s
    for name, length in PROG[sec]:
        end = min(e, t + length * BEAT)
        if end - t > 1e-6:
            spans.append((name, t, end))
        t = end
        if t >= e - 1e-6:
            break
    return spans


# ------------------------------------------------------------------------------------------- drums
K, CL, HC, HO, SH, SN = sy.kick(), sy.clap(), sy.hat(False), sy.hat(True), sy.shaker(), sy.snare_roll_hit()


def groove(sec: str, kick_pattern: str = "four", hats: str = "16", clap_on: tuple = (1, 3),
           kick_db: float = -2.0, hat_db: float = -6.0, open_hats: bool = True, shaker: bool = False) -> None:
    for i, t in enumerate(beats(sec)):
        b = i % 4
        if kick_pattern == "four" or (kick_pattern == "half" and b in (0, 2)) or (kick_pattern == "one" and b == 0):
            put(drums, K, t, kick_db)
            kicks.append(t)
        if b in clap_on:
            put(drums, CL, t, -9.0, 0.05)
            put(verb_send, CL * 0.25, t)
        if hats == "16":
            for q in range(4):
                if q == 2 and open_hats:
                    put(drums, HO, t + q * BEAT / 4, hat_db - 2, 0.25)
                else:
                    jitter = sy.RNG.normal(0, 0.002)
                    put(drums, HC, t + q * BEAT / 4 + jitter, hat_db + (0 if q == 0 else -3.5), 0.3)
        elif hats == "8":
            put(drums, HC, t + BEAT / 2, hat_db, 0.3)
            put(drums, HC, t, hat_db - 4, 0.3)
        if shaker:
            for q in range(4):
                put(drums, SH, t + q * BEAT / 4 + sy.RNG.normal(0, 0.003), -14 + (2 if q % 2 else 0), -0.35)


groove("intro", kick_pattern="half", hats="8", clap_on=(), kick_db=-7, hat_db=-14, shaker=True)
groove("verse", kick_pattern="four", hats="8", clap_on=(1, 3), kick_db=-3, hat_db=-9, shaker=True)
groove("drop", kick_pattern="four", hats="16", clap_on=(1, 3), kick_db=-1.5, hat_db=-6)
groove("lift", kick_pattern="half", hats="8", clap_on=(2,), kick_db=-3, hat_db=-9, shaker=True)
groove("final", kick_pattern="four", hats="16", clap_on=(1, 3), kick_db=-1.5, hat_db=-6)

# build: kick on the beat until the last beat, snare roll 8ths -> 16ths -> 32nds with crescendo
bs = beats("build")
for i, t in enumerate(bs[:-1]):
    put(drums, K, t, -3)
    kicks.append(t)
b0, b1 = SEC["build"]["start"], SEC["build"]["end"] - 0.12
t = b0
while t < b1:
    prog = (t - b0) / (b1 - b0)
    step = BEAT / 2 if prog < 0.4 else (BEAT / 4 if prog < 0.8 else BEAT / 8)
    put(drums, SN, t, -24 + 18 * prog ** 1.5, sy.RNG.uniform(-0.15, 0.15))
    put(verb_send, SN * 0.15 * prog, t)
    t += step

# ------------------------------------------------------------------------------------------- bass
for sec, style in [("verse", "8"), ("build", "8"), ("drop", "drive"), ("lift", "long"), ("final", "drive")]:
    for name, s, e in chord_spans(sec):
        root = N(CHORDS[name]["bass"])
        if style == "long":
            put(bass, sy.bass_note(root, e - s - 0.02), s, -7)
            continue
        steps = int(round((e - s) / (BEAT / 2)))
        for q in range(steps):
            tq = s + q * BEAT / 2
            if sec == "build" and tq >= SEC["build"]["end"] - BEAT:
                break
            f = root
            if style == "drive" and q % 4 == 3:
                f = root * 2
            if style == "drive" and q % 8 == 7:
                f = root * 1.5
            put(bass, sy.bass_note(f, BEAT / 2 - 0.035), tq, -8 if q % 2 == 0 else -10)

# ------------------------------------------------------------------------------------------- pads
def pad_chord(name: str, s: float, e: float, gain: float, cutoff_from: float, cutoff_to: float) -> None:
    dur = e - s + 0.6
    n = int(dur * SR)
    env = sy.adsr(n, 0.12, 0.5, 0.85, 0.55, gate=e - s)
    stack = np.zeros((n, 2))
    for nn in CHORDS[name]["pad"]:
        stack += sy.supersaw(N(nn), n, voices=5, detune_cents=16)
    cut = np.linspace(cutoff_from, cutoff_to, n)
    for c in range(2):
        stack[:, c] = sy.lowpass_tv(stack[:, c], cut, q=0.7)
    stack *= env[:, None] / 2.2
    put(pads, stack, s, gain)
    put(verb_send, stack.mean(axis=1) * 0.35, s, gain)


for sec, g, c0, c1 in [("intro", -17, 700, 1500), ("verse", -15, 1500, 2600), ("build", -13, 1800, 7000),
                       ("drop", -14, 3200, 3200), ("lift", -14, 2200, 2600), ("final", -13, 3600, 3600)]:
    for name, s, e in chord_spans(sec):
        if sec == "build":
            span = SEC["build"]["end"] - SEC["build"]["start"]
            c_s = c0 + (c1 - c0) * (s - SEC["build"]["start"]) / span
            c_e = c0 + (c1 - c0) * (e - SEC["build"]["start"]) / span
            pad_chord(name, s, e, g, c_s, c_e)
        else:
            pad_chord(name, s, e, g, c0, c1)

# ------------------------------------------------------------------------------------------- plucks / lead
def arp(sec: str, rate: float, gain: float, bright: float, run_on_dominant: bool = False) -> None:
    for name, s, e in chord_spans(sec):
        notes = CHORDS[name]["arp"]
        steps = int(round((e - s) / rate))
        pattern = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1]
        for q in range(steps):
            tq = s + q * rate
            if run_on_dominant and name == "A":
                f = N(HIJAZ_RUN[q % len(HIJAZ_RUN)])
            else:
                f = N(notes[pattern[q % len(pattern)] % len(notes)])
            accent = 0 if q % 4 == 0 else -3
            sig = sy.pluck(f, 0.28, bright)
            put(plucks, sig, tq, gain + accent, 0.2 * np.sin(q * 1.3))
            put(delay_send, sig * 0.22, tq, gain)


arp("intro", BEAT / 2, -21, 0.35)
arp("verse", BEAT / 2, -22, 0.5)
arp("drop", BEAT / 4, -21, 0.85, run_on_dominant=True)
arp("final", BEAT / 4, -20, 0.95, run_on_dominant=True)

# chord stabs on the problem cards (each role "lands")
for t in EV["problemCards"] + [EV["problemTeam"]]:
    sec = "verse"
    name = chord_at(sec, min(max(t, SEC[sec]["start"]), SEC[sec]["end"] - 1e-3))
    for nn in CHORDS[name]["pad"][1:]:
        put(plucks, sy.pluck(N(nn) * 2, 0.4, 1.0), t, -24, 0.0)

# ------------------------------------------------------------------------------------------- fx
def riser(s: float, e: float, gain: float) -> None:
    n = int((e - s) * SR)
    tt = np.linspace(0, 1, n)
    swept = sy.lowpass_tv(sy.noise(n), 400 * (9000 / 400) ** (tt ** 1.3), q=2.4)
    swept = dsp.hp(swept, 250)
    tone = dsp.lp(sy.saw(220 * 2 ** (tt * 2.2), n), 5000) * 0.12
    sig = (swept * 0.45 + tone) * tt ** 2.2
    put(fx, sy.pan(sig, 0) * np.array([1.0, 0.92]), s, gain)
    put(verb_send, sig * 0.3, s, gain)


def reverse_cymbal(t_end: float, length: float, gain: float) -> None:
    n = int(length * SR)
    sig = dsp.hp(sy.noise(n), 3500) * np.linspace(0, 1, n) ** 3
    put(fx, sig, t_end - length, gain, -0.1)
    put(fx, sig, t_end - length, gain - 2, 0.1)


def impact(t: float, gain: float, size: float = 1.0) -> None:
    n = int(1.8 * SR)
    tt = np.arange(n) / SR
    boom = sy.sine(30 + 55 * np.exp(-tt / 0.08), n) * np.exp(-tt / (0.55 * size))
    crack = dsp.lp(sy.noise(int(0.25 * SR)), 3500) * np.exp(-np.arange(int(0.25 * SR)) / SR / 0.05)
    sig = sy.soft_clip(boom * 1.2, 1.3)
    sig[: len(crack)] += crack * 0.5
    put(fx, sig, t, gain)
    put(verb_send, sig * 0.5, t, gain)


riser(SEC["build"]["start"] + 0.5, SEC["build"]["end"], -9)
reverse_cymbal(SEC["drop"]["start"], 1.0, -10)
impact(SEC["drop"]["start"], -2, 1.2)
impact(0.0, -7, 0.8)
reverse_cymbal(SEC["lift"]["start"], 0.8, -12)
impact(SEC["lift"]["start"], -5, 0.9)
impact(SEC["outro"]["start"], -1, 1.6)

# outro: big resolving Dm(add9) chord with shimmer
o = SEC["outro"]["start"]
n_o = int((TOTAL - o + 2.5) * SR)
chord = np.zeros((n_o, 2))
for nn in ["D3", "A3", "E4", "F4", "A4", "D5"]:
    chord += sy.supersaw(N(nn), n_o, voices=5, detune_cents=12)
for c in range(2):
    chord[:, c] = sy.lowpass_tv(chord[:, c], np.linspace(5200, 1400, n_o), q=0.7)
chord *= sy.adsr(n_o, 0.02, 1.2, 0.55, 1.6, gate=TOTAL - o - 0.9)[:, None] / 3.0
put(pads, chord, o, -13)
put(verb_send, chord.mean(axis=1) * 0.5, o, -13)
for i, nn in enumerate(["D5", "A5", "F5", "D6", "E6", "A5"]):
    sig = sy.pluck(N(nn), 0.6, 0.7)
    put(plucks, sig, o + 0.08 + i * BEAT / 2, -22, 0.4 * (-1) ** i)
    put(delay_send, sig * 0.3, o + 0.08 + i * BEAT / 2)
put(bass, sy.bass_note(N("D2"), 2.2) * np.exp(-np.arange(int(2.2 * SR)) / SR / 0.9), o, -6)
put(drums, K, o, -1.0)

# ------------------------------------------------------------------------------------------- sidechain pump
pump = np.ones(n_total)
for t in kicks + [o]:
    s = int(t * SR)
    m = int(0.32 * SR)
    seg = 1 - 0.55 * np.exp(-np.arange(m) / SR / 0.075) * np.minimum(np.arange(m) / (0.004 * SR), 1)
    e = min(n_total, s + m)
    pump[s:e] = np.minimum(pump[s:e], seg[: e - s])
bass *= pump[:, None]
pads *= (1 - 0.6 * (1 - pump))[:, None]
plucks *= (1 - 0.35 * (1 - pump))[:, None]

# ------------------------------------------------------------------------------------------- returns + bus
wet = sy.reverb(verb_send, 2.4, seed=21, damp=5500)[:n_total] * dsp.undb(-6)
dly = sy.delay_pingpong(delay_send, 0.375, fb=0.38, repeats=5)[:n_total]
music = drums + bass + pads + plucks + fx
if __import__("os").environ.get("STEMS"):
    for _name, _sig in {"drums": drums, "bass": bass, "pads": pads, "plucks": plucks, "fx": fx, "wet": wet, "dly": dly}.items():
        dsp.save(ROOT / "audio" / "build" / "stems" / f"{_name}.wav", _sig[:n_total], subtype="FLOAT")
music[: len(wet)] += wet[: n_total]
music[: len(dly)] += dly[: n_total]

# break: tape-stop the whole bus into silence at the punch-line, then silence until the lift
br, lift = SEC["break"]["start"], SEC["lift"]["start"]
ts_len = 0.42
s0, s1 = int(br * SR), int((br + ts_len) * SR)
seg = music[s0:s1].copy()
speed = np.linspace(1.0, 0.05, s1 - s0)
pos = np.cumsum(speed)
pos = pos[pos < len(seg) - 1]
idx = pos.astype(int)
frac = pos - idx
stopped = seg[idx] * (1 - frac)[:, None] + seg[idx + 1] * frac[:, None]
stopped *= np.linspace(1, 0, len(stopped))[:, None] ** 1.5
music[s0:s1] = 0
music[s0:s0 + len(stopped)] = stopped
gap_end = int((lift - 0.8) * SR)  # silence after the tape-stop ...
music[s1:gap_end] = 0
music[gap_end:int(lift * SR)] = fx[gap_end:int(lift * SR)]  # ... until the cymbal swell into the lift

# gentle bus glue + fade-out
music = sy.soft_clip(music * 0.9, 1.15)
fade_n = int(1.6 * SR)
end = int((TOTAL + 0.0) * SR)
music[end - fade_n:end] *= np.linspace(1, 0, fade_n)[:, None] ** 2
music[end:] = 0
music = music[: int((TOTAL + 0.05) * SR)]
music = dsp.normalize_lufs(music, -18.0)
peak = np.max(np.abs(music))
if peak > dsp.undb(-1.0):
    music *= dsp.undb(-1.0) / peak
dsp.save(ROOT / "public" / "audio" / "music.wav", music)
TL["kicks"] = sorted(round(k, 4) for k in kicks + [o])  # beat pulses for the visuals
dsp.write_json(ROOT / "src" / "timeline" / "timeline.json", TL)
print("music:", dsp.loudness(music), f"{len(music)/SR:.2f}s, {len(kicks)} kicks")
