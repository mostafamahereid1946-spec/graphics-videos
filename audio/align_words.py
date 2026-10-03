"""Refine caption word boundaries by asking Whisper large-v3 (sherpa-onnx) where each word really ends.

For every boundary between word j and j+1 inside a line we try a few candidate cut points (the energy/DP
estimate from build_vo.word_bounds plus nearby energy valleys) and transcribe the audio *before* and *after*
the cut. The candidate whose prefix reads as words[0..j] and whose suffix reads as words[j+1..] wins.

Result is cached in audio/word_align.json (source-recording times), which build_vo.py prefers over the
heuristic. Run once per recording:

    python3 audio/align_words.py /path/to/sherpa-onnx-whisper-large-v3
"""
from __future__ import annotations

import difflib
import json
import re
import sys
from pathlib import Path

import numpy as np

import dsp
from build_vo import SCRIPT, cut_line, word_bounds
from dsp import ROOT, SR

DIAC = re.compile(r"[ً-ْٰـ]")
PUNCT = re.compile(r"[^ء-يٱ-ۓA-Za-z0-9 ]")
DIGITS = {"10": "عشره", "12": "اتناشر", "١٠": "عشره", "١٢": "اتناشر"}


def norm(s: str) -> str:
    s = DIAC.sub("", s)
    for k, v in DIGITS.items():
        s = s.replace(k, f" {v} ")
    s = re.sub("[أإآ]", "ا", s).replace("ى", "ي").replace("ة", "ه").replace("ؤ", "و").replace("ئ", "ي")
    s = PUNCT.sub(" ", s.lower())
    return re.sub(r"\s+", "", s)


def sim(a: str, b: str) -> float:
    a, b = norm(a), norm(b)
    if not a and not b:
        return 1.0
    return difflib.SequenceMatcher(None, a, b).ratio()


def main(model_dir: str) -> None:
    import sherpa_onnx

    m = Path(model_dir)
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(m / "large-v3-encoder.int8.onnx"), decoder=str(m / "large-v3-decoder.int8.onnx"),
        tokens=str(m / "large-v3-tokens.txt"), language="ar", task="transcribe", num_threads=4,
        tail_paddings=1500)
    raw = dsp.load(ROOT / SCRIPT["recording"])
    raw16 = dsp.load(ROOT / SCRIPT["recording"], 16000)
    pad = np.zeros(int(0.3 * 16000))

    def transcribe(a: float, b: float) -> str:
        seg = raw16[int(a * 16000):int(b * 16000)]
        seg = seg / (np.max(np.abs(seg)) + 1e-9) * 0.5
        st = rec.create_stream()
        st.accept_waveform(16000, np.concatenate([pad, seg, pad]).astype(np.float32))
        rec.decode_stream(st)
        return st.result.text.strip()

    out = {}
    for line in SCRIPT["lines"]:
        toks = line["tokens"]
        if len(toks) < 2:
            continue
        clip = cut_line(raw, line)
        offset = line["src"][0] - line.get("pre", 0.025)  # clip time 0 in source time
        bounds, on, off = word_bounds(clip, toks)
        say = [t.get("say", t["t"]) for t in toks]
        e = dsp.env_db(clip, SR, 0.005, 0.02)
        e = np.convolve(e, np.ones(3) / 3, mode="same")
        refined = []
        for j in range(len(toks) - 1):
            b0 = bounds[j][1]
            lo = refined[-1] + 0.08 if refined else on + 0.08
            hi = bounds[j + 1][1] - 0.08 if j + 1 < len(toks) - 1 else off - 0.08
            # candidates: DP estimate + strongest valleys within +-0.3 s (inside [lo, hi])
            cands = {round(b0, 3)}
            i0, i1 = int(max(lo, b0 - 0.3) / 0.005), int(min(hi, b0 + 0.3) / 0.005)
            vals = [(e[max(0, i - 9):i].max() if i > 0 else e[i]) - e[i] for i in range(i0, i1)]
            for k in np.argsort(vals)[::-1][:6]:
                t = (i0 + k) * 0.005
                if vals[k] > 8 and all(abs(t - c) > 0.04 for c in cands):
                    cands.add(round(t, 3))
                if len(cands) >= 3:
                    break
            best = None
            for c in sorted(cands):
                if not (lo <= c <= hi):
                    continue
                pre_txt = transcribe(offset + on - 0.02, offset + c)
                suf_txt = transcribe(offset + c, offset + off + 0.02)
                score = sim(pre_txt, " ".join(say[: j + 1])) + sim(suf_txt, " ".join(say[j + 1:]))
                score -= 0.15 * abs(c - b0)  # mild prior towards the DP estimate
                print(f"  {line['id']:4s} b{j} cand {offset + c:7.3f}s score {score:5.3f} | {pre_txt} || {suf_txt}",
                      flush=True)
                if best is None or score > best[0]:
                    best = (score, c)
            refined.append(best[1] if best else b0)
        cuts = [on] + refined + [off]
        out[line["id"]] = [[round(offset + cuts[q], 4), round(offset + cuts[q + 1], 4)] for q in range(len(toks))]
        print(f"{line['id']}: " + " | ".join(f"{t['t']}@{w[0]:.2f}" for t, w in zip(toks, out[line['id']])), flush=True)
    dsp.write_json(ROOT / "audio" / "word_align.json",
                   {"_doc": "Word boundaries in source-recording seconds, verified with Whisper large-v3.",
                    "recording": SCRIPT["recording"], "lines": out})




SKEL_DROP = re.compile(r"[اويىهةءأإآئؤ]")


def skel(s: str) -> str:
    """Consonant skeleton: Whisper spells Egyptian vowels/endings inconsistently ('دا كلو' vs 'ده كله')."""
    return SKEL_DROP.sub("", norm(s))


def skel_sim(a: str, b: str) -> float:
    a, b = skel(a), skel(b)
    if not a and not b:
        return 1.0
    return difflib.SequenceMatcher(None, a, b).ratio()


def rescore(log_path: str) -> None:
    """Re-pick boundaries from a previous run's log (no Whisper needed) with skeleton+text similarity."""
    pat = re.compile(r"^\s+(\S+)\s+b(\d+) cand\s+([\d.]+)s score\s+[-\d.]+ \| (.*?) \|\| (.*)$")
    cands: dict[str, dict[int, list[tuple[float, str, str]]]] = {}
    for row in Path(log_path).read_text(encoding="utf-8").splitlines():
        m = pat.match(row)
        if m:
            lid, j, t, pre, suf = m.group(1), int(m.group(2)), float(m.group(3)), m.group(4), m.group(5)
            cands.setdefault(lid, {}).setdefault(j, []).append((t, pre, suf))
    raw = dsp.load(ROOT / SCRIPT["recording"])
    out = {}
    for line in SCRIPT["lines"]:
        toks = line["tokens"]
        if len(toks) < 2 or line["id"] not in cands:
            continue
        clip = cut_line(raw, line)
        offset = line["src"][0] - line.get("pre", 0.025)
        bounds, on, off = word_bounds(clip, toks)
        say = [t.get("say", t["t"]) for t in toks]
        chosen, prev = [], offset + on
        for j in range(len(toks) - 1):
            b0 = offset + bounds[j][1]
            best = None
            for t, pre, suf in cands[line["id"]].get(j, []):
                if t < prev + 0.08:
                    continue
                exp_pre, exp_suf = " ".join(say[: j + 1]), " ".join(say[j + 1:])
                score = (0.6 * skel_sim(pre, exp_pre) + 0.4 * sim(pre, exp_pre)
                         + 0.6 * skel_sim(suf, exp_suf) + 0.4 * sim(suf, exp_suf)) - 0.15 * abs(t - b0)
                if best is None or score > best[0]:
                    best = (score, t)
            pick = best[1] if best else max(b0, prev + 0.1)
            chosen.append(pick)
            prev = pick
        cuts = [offset + on] + chosen + [offset + off]
        out[line["id"]] = [[round(cuts[q], 4), round(cuts[q + 1], 4)] for q in range(len(toks))]
        print(f"{line['id']}: " + " | ".join(f"{t['t']}@{w[0]:.2f}" for t, w in zip(toks, out[line['id']])))
    dsp.write_json(ROOT / "audio" / "word_align.json",
                   {"_doc": "Word boundaries in source-recording seconds, verified with Whisper large-v3 "
                            "(prefix/suffix transcription of candidate cuts, consonant-skeleton scoring).",
                    "recording": SCRIPT["recording"], "lines": out})


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--rescore":
        rescore(sys.argv[2])
    else:
        main(sys.argv[1])
