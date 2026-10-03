"""Build the voice-over track + the master timeline from the user's raw recording.

Steps
  1. Cut the best take of every script line out of the raw recording (`script.json` -> `src`).
  2. Level-match the takes (they were recorded at different distances / energy).
  3. Estimate word boundaries inside every line (energy valleys + expected word length, solved with DP).
  4. Place each line so that its *speech onset* lands on the musical grid (120 BPM) with natural gaps.
  5. Process the assembled VO (EQ, de-esser, compression, reverb throw on the punchline) -> -16 LUFS stem.
  6. Write `src/timeline/timeline.json` (lines, words, scenes, music sections, SFX cues) for Remotion + the
     music/SFX/mix scripts.

Usage: python3 audio/build_vo.py [path/to/recording]
"""
from __future__ import annotations

import json
import math
import re
import sys

import numpy as np

import cues
import dsp
from dsp import ROOT, SR

SCRIPT = json.loads((ROOT / "audio" / "script.json").read_text(encoding="utf-8"))
BPM = SCRIPT["bpm"]
FPS = SCRIPT["fps"]
BEAT = 60.0 / BPM
GRID = {"16th": BEAT / 4, "8th": BEAT / 2, "beat": BEAT, "bar": BEAT}  # "bar" = beat-aligned section downbeat

DIACRITICS = re.compile(r"[ً-ْٰـ]")
NON_LETTER = re.compile(r"[^ء-يٱ-ۓA-Za-z0-9]")


def spoken_weight(tok: dict) -> float:
    """Rough spoken-length weight of a token (letters of what is actually said)."""
    s = NON_LETTER.sub("", DIACRITICS.sub("", tok.get("say", tok["t"])))
    return max(1.5, float(len(s)))


def word_bounds(clip: np.ndarray, tokens: list[dict]) -> tuple[list[tuple[float, float]], float, float]:
    """Return per-token (start, end) in seconds relative to the clip, plus speech onset/offset.

    Boundaries are picked by dynamic programming over every 5 ms frame: the cost prefers
    (a) positions close to where the token's expected length says the boundary should be and
    (b) deep energy valleys (the short dips between Arabic words / stop closures).
    """
    hop = 0.005
    e = dsp.env_db(clip, SR, hop_s=hop, win_s=0.02)
    e = np.convolve(e, np.ones(3) / 3, mode="same")
    act = np.where(e > e.max() - 38)[0]
    on, off = int(act[0]), int(act[-1]) + 1
    t0, t1 = on * hop, off * hop
    k = len(tokens)
    if k == 1:
        return [(t0, t1)], t0, t1

    w = np.array([spoken_weight(t) for t in tokens])
    expected = t0 + np.cumsum(w)[:-1] / w.sum() * (t1 - t0)

    # valley depth at every frame: how far below the louder of its two 45 ms neighbourhoods
    L = 9
    depth = np.zeros_like(e)
    for i in range(on + 1, off - 1):
        left, right = e[max(on, i - L):i].max(), e[i + 1:min(off, i + L + 1)].max()
        depth[i] = max(0.0, min(left, right) - e[i])
    depth = np.minimum(depth, 30.0) / 30.0

    frames = np.arange(on, off)
    times = frames * hop
    sigma = max(0.05, 0.33 * (t1 - t0) / k)
    min_len = int(0.09 / hop)
    alpha = 1.4

    # DP: cost[j][i] = best cost placing boundary j at frame index i (index into `frames`)
    n = len(frames)
    inf = 1e18
    cost = np.full((k - 1, n), inf)
    back = np.zeros((k - 1, n), dtype=int)
    for j in range(k - 1):
        local = ((times - expected[j]) / sigma) ** 2 - alpha * depth[frames]
        if j == 0:
            valid = np.arange(n) >= min_len
            cost[0][valid] = local[valid]
        else:
            # running min over cost[j-1][: i-min_len]
            prev = cost[j - 1]
            best, arg = inf, -1
            for i in range(n):
                p = i - min_len
                if p >= 0 and prev[p] < best:
                    best, arg = prev[p], p
                if arg >= 0:
                    cost[j][i] = best + local[i]
                    back[j][i] = arg
    last_valid = np.arange(n) <= n - 1 - min_len
    i = int(np.argmin(np.where(last_valid, cost[k - 2], inf)))
    idx = [i]
    for j in range(k - 2, 0, -1):
        i = back[j][i]
        idx.append(i)
    idx = idx[::-1]
    cuts = [t0] + [float(times[i]) for i in idx] + [t1]
    return [(cuts[q], cuts[q + 1]) for q in range(k)], t0, t1


def snap_to_onsets(clip: np.ndarray, bounds: list[tuple[float, float]]) -> list[tuple[float, float]]:
    """A boundary that falls inside a pause is split: the previous word ends where the pause starts and the
    next word starts at its real speech onset (so captions pop exactly when the sound does)."""
    hop = 0.005
    e = dsp.env_db(clip, SR, hop_s=hop, win_s=0.02)
    thr = e.max() - 32
    out = [list(b) for b in bounds]
    for j in range(1, len(out)):
        i = int(out[j][0] / hop)
        if i >= len(e) or e[i] >= thr:
            continue
        k = i
        while k < len(e) - 1 and e[k] < thr and (k - i) * hop < 0.4:
            k += 1
        b = i
        while b > 0 and e[b - 1] < thr and (i - b) * hop < 0.4:
            b -= 1
        out[j][0] = max(out[j - 1][0] + 0.06, k * hop - 0.015)
        out[j - 1][1] = max(out[j - 1][0] + 0.05, b * hop + 0.01)
    return [(a, b) for a, b in out]


# Long-term-average-spectrum target for a warm, close-mic broadcast voice-over (dB re 1 kHz, 1/3 octave).
LTAS_BANDS = [63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150,
              4000, 5000, 6300, 8000, 10000, 12500, 16000]
LTAS_TARGET = [-10, -5, 2, 6.5, 9, 9.5, 9.5, 9, 8.5, 7.5, 6, 3.5, 0, -0.5, 0, -0.5, 0, 0.5, 0, -1.5, -3, -4.5,
               -6, -8, -14]


def ltas(x: np.ndarray) -> np.ndarray:
    """1/3-octave long-term average spectrum of the active speech, dB re the 1 kHz band."""
    from scipy.signal import welch
    e = dsp.env_db(x, SR, 0.01, 0.03)
    act = np.repeat(e > e.max() - 35, int(0.01 * SR))[: len(x)]
    f, p = welch(x[: len(act)][act], SR, nperseg=8192)
    out = np.array([10 * np.log10(p[(f >= c / 2 ** (1 / 6)) & (f < c * 2 ** (1 / 6))].sum() + 1e-20) for c in LTAS_BANDS])
    return out - out[LTAS_BANDS.index(1000)]


def match_eq(x: np.ndarray, amount: float = 0.6, limit: float = 4.5) -> tuple[np.ndarray, np.ndarray]:
    """Linear-phase FIR that moves the voice's measured LTAS `amount` of the way towards LTAS_TARGET.
    Never boosts below 90 Hz or above 13 kHz (no rumble / MP3 artefacts)."""
    from scipy.signal import firwin2
    meas = ltas(x)
    corr = np.array(LTAS_TARGET) - meas
    mid = [i for i, c in enumerate(LTAS_BANDS) if 300 <= c <= 3150]
    corr -= corr[mid].mean()
    corr = np.convolve(np.pad(corr, 1, mode="edge"), np.ones(3) / 3, mode="valid")  # smooth across bands
    corr = np.clip(corr * amount, -limit, limit)
    for i, c in enumerate(LTAS_BANDS):
        if (c < 90 or c > 13000) and corr[i] > 0:
            corr[i] = 0.0
    freqs = np.concatenate([[0], LTAS_BANDS, [SR / 2]]) / (SR / 2)
    gains = dsp.undb(np.concatenate([[corr[0]], corr, [corr[-1]]]))
    fir = firwin2(4095, freqs, gains)
    y = dsp.convolve(x, fir)[2047:2047 + len(x)]
    return y, corr


def studio_chain(vo: np.ndarray) -> np.ndarray:
    """Phone recording -> 'studio' voice: rumble HPF, measured match-EQ (warmth in, box + harshness out),
    parallel harmonic saturation, dynamic de-essing, two-stage compression. Loudness is set afterwards."""
    x = dsp.hp(vo, 75, order=4)
    x, corr = match_eq(x)
    print("  match-EQ (dB):", " ".join(f"{c}:{g:+.1f}" for c, g in zip(LTAS_BANDS, corr)))
    warm = np.tanh(3.0 * dsp.lp(x, 5000) / (np.max(np.abs(x)) + 1e-9)) * np.max(np.abs(x)) / 3.0
    x = x + 0.12 * warm
    x = dsp.ffmpeg_filter(x, ",".join([
        "deesser=i=0.55:m=0.5:f=0.45",
        "acompressor=threshold=-26dB:ratio=3:attack=6:release=110:knee=6:makeup=4dB",
        "acompressor=threshold=-15dB:ratio=5:attack=1.5:release=45:knee=3",
        "lowpass=f=15500",
    ]))
    print("  LTAS after (dB re 1k):", " ".join(f"{c}:{v:+.1f}" for c, v in zip(LTAS_BANDS, ltas(x))))
    return x



def cut_line(raw: np.ndarray, line: dict) -> np.ndarray:
    a, b = line["src"]
    pre, post = line.get("pre", 0.025), line.get("post", 0.05)
    s, e = int((a - pre) * SR), int((b + post) * SR)
    clip = raw[max(0, s):min(len(raw), e)]
    return dsp.fade(clip, line.get("fadeIn", 0.006), line.get("fadeOut", 0.02))


def build(recording: str) -> None:
    raw = dsp.load(ROOT / recording if not recording.startswith("/") else recording)
    print(f"recording: {len(raw)/SR:.2f}s")

    # ---- 1-3: cut, level, word bounds ---------------------------------------------------------
    align_path = ROOT / "audio" / "word_align.json"
    aligned = json.loads(align_path.read_text(encoding="utf-8"))["lines"] if align_path.exists() else {}
    TARGET_ACTIVE_RMS = -21.0
    clips = []
    for line in SCRIPT["lines"]:
        clip = cut_line(raw, line)
        gain = TARGET_ACTIVE_RMS - dsp.active_rms_db(clip)
        clip = clip * dsp.undb(gain)
        bounds, on, off = word_bounds(clip, line["tokens"])
        if line["id"] in aligned:  # Whisper-verified boundaries (source time -> clip time)
            zero = line["src"][0] - line.get("pre", 0.025)
            bounds = [(a - zero, b - zero) for a, b in aligned[line["id"]]]
            on, off = bounds[0][0], bounds[-1][1]
        bounds = snap_to_onsets(clip, bounds)
        clips.append({"line": line, "clip": clip, "bounds": bounds, "on": on, "off": off, "gain": gain})
        words = " | ".join(f"{t['t']}@{b[0]:.2f}" for t, b in zip(line["tokens"], bounds))
        print(f"  {line['id']:4s} gain {gain:+5.1f} dB  speech {off-on:4.2f}s  {words}")

    # ---- 4: place on the beat grid --------------------------------------------------------------
    placed, prev_end = [], 0.0
    for c in clips:
        line = c["line"]
        if "at" in line:
            onset = float(line["at"])
        else:
            g = GRID[line["snap"]]
            gap = line.get("gap", 0.2)
            earliest = prev_end + gap
            # small tolerance: a line may land on a grid point up to 80 ms "early" (gap shrinks slightly)
            # instead of being pushed a whole beat later because the previous line ran a hair long
            onset = math.ceil((earliest - min(0.08, 0.3 * gap)) / g - 1e-6) * g
        clip_start = onset - c["on"]
        placed.append({**c, "onset": onset, "clip_start": clip_start, "speech_end": clip_start + c["off"]})
        prev_end = clip_start + c["off"]

    total = placed[-1]["speech_end"] + SCRIPT["outroHold"]
    total = math.ceil(total / BEAT) * BEAT  # end on a beat
    n_total = int(total * SR) + SR // 2
    vo = np.zeros(n_total)
    for p in placed:
        s = int(round(p["clip_start"] * SR))
        vo[s:s + len(p["clip"])] += p["clip"]

    # ---- 5: process (studio chain) --------------------------------------------------------------------
    vo_p = studio_chain(vo)[:n_total]

    # reverb "throw" on the punchline question (k1) — tail rings into the music break
    ir = dsp.plate_ir(1.9, damp_hz=5200, seed=3)
    for p in placed:
        if p["line"].get("throw"):
            a = int((p["clip_start"] + p["off"] - 0.32) * SR)
            b = int((p["clip_start"] + p["off"]) * SR)
            seg = vo_p[a:b] * np.hanning(2 * (b - a))[b - a:]  # last word, faded out
            tail = dsp.convolve(seg, ir) * dsp.undb(-9)
            tail = dsp.hp(tail, 300)
            vo_p[a:a + len(tail)] += tail[: max(0, len(vo_p) - a)]

    # loudness: -16 LUFS stem, transient plosives caught by a look-ahead limiter (2 passes converge)
    for _ in range(2):
        vo_p = dsp.normalize_lufs(vo_p, -16.0)
        vo_p = dsp.ffmpeg_filter(vo_p, "alimiter=limit=0.80:attack=4:release=60:asc=1:level=0")[:n_total]
    dsp.save(ROOT / "public" / "audio" / "vo.wav", vo_p)
    print("VO stem:", dsp.loudness(vo_p))

    # ---- 6: timeline --------------------------------------------------------------------------------
    by_id = {p["line"]["id"]: p for p in placed}

    def st(i: str) -> float:
        return round(by_id[i]["onset"], 4)

    def en(i: str) -> float:
        return round(by_id[i]["speech_end"], 4)

    lines_out = []
    for p in placed:
        line = p["line"]
        words = []
        for tok, (a, b) in zip(line["tokens"], p["bounds"]):
            wd = {"t": tok["t"], "start": round(p["clip_start"] + a, 4), "end": round(p["clip_start"] + b, 4)}
            for flag in ("em", "brand", "num", "lineBreak"):
                if tok.get(flag):
                    wd[flag] = True
            words.append(wd)
        lines_out.append({"id": line["id"], "scene": line["scene"], "start": st(line["id"]), "end": en(line["id"]),
                          "text": " ".join(t["t"] for t in line["tokens"]), "words": words})

    LEAD = 0.25  # visuals lead the voice slightly (as in the reference reel)
    scenes = [
        {"id": "hook", "start": 0.0, "end": st("p1") - LEAD},
        {"id": "problem", "start": st("p1") - LEAD, "end": st("s1") - LEAD},
        {"id": "solution", "start": st("s1") - LEAD, "end": st("r1")},
        {"id": "services", "start": st("r1"), "end": st("c1") - LEAD},
        {"id": "consistency", "start": st("c1") - LEAD, "end": st("k1")},
        {"id": "punch", "start": st("k1"), "end": st("a1") - LEAD},
        {"id": "cta", "start": st("a1") - LEAD, "end": st("a3") - 0.15},
        {"id": "logo", "start": st("a3") - 0.15, "end": total},
    ]
    sections = [
        {"id": "intro", "start": 0.0, "end": st("p1") - BEAT},
        {"id": "verse", "start": st("p1") - BEAT, "end": st("s1")},
        {"id": "build", "start": st("s1"), "end": st("r1")},
        {"id": "drop", "start": st("r1"), "end": st("k1")},
        {"id": "break", "start": st("k1"), "end": st("k2")},
        {"id": "lift", "start": st("k2"), "end": st("a1")},
        {"id": "final", "start": st("a1"), "end": st("a3")},
        {"id": "outro", "start": st("a3"), "end": total},
    ]
    for s in scenes + sections:
        s["start"], s["end"] = round(s["start"], 4), round(s["end"], 4)
    events, sfx = cues.compute(lines_out, scenes)

    timeline = {
        "_generated": "audio/build_vo.py — do not edit by hand",
        "fps": FPS, "bpm": BPM, "beat": BEAT,
        "duration": round(total, 4), "durationInFrames": int(round(total * FPS)),
        "lines": lines_out, "scenes": scenes, "sections": sections, "events": events, "sfx": sfx,
        "edl": [{"id": p["line"]["id"], "src": p["line"]["src"], "gainDb": round(p["gain"], 2),
                 "placedAt": round(p["clip_start"], 4)} for p in placed],
    }
    dsp.write_json(ROOT / "src" / "timeline" / "timeline.json", timeline)
    print(f"timeline: {total:.2f}s = {timeline['durationInFrames']} frames")
    for s in scenes:
        print(f"  scene {s['id']:12s} {s['start']:6.2f} -> {s['end']:6.2f}")
    for l in lines_out:
        print(f"  line {l['id']:4s} {l['start']:6.2f}-{l['end']:6.2f}  {l['text']}")


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else SCRIPT["recording"])
