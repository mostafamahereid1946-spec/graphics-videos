"""Named visual/audio events derived from the voice timeline.

Both the Remotion scenes (via timeline.json -> `events`) and the SFX renderer (`sfx`) read these, so a
shape pop, a whoosh and the word that triggers them can never drift apart.
"""
from __future__ import annotations


def compute(lines: list[dict], scenes: list[dict]) -> tuple[dict, list[dict]]:
    L = {l["id"]: l for l in lines}
    S = {s["id"]: s for s in scenes}

    def W(line: str, i: int) -> float:
        return L[line]["words"][i]["start"]

    ev: dict[str, float | list[float]] = {}
    sfx: list[dict] = []

    def add(kind: str, t: float, gain: float = 0.0, pitch: float = 1.0) -> None:
        sfx.append({"type": kind, "t": round(max(0.0, t), 4), "gain": gain, "pitch": pitch})

    # ---- hook: magnifier sweeps in, lens zooms through on "ريلز"
    ev["hookMagnifierIn"] = 0.0
    ev["hookZoom"] = W("hook", 1) - 0.18
    add("whoosh", 0.0, -4)
    add("zoom", ev["hookZoom"], -6)

    # ---- problem: one role card per line, "ده فريق كامل!" slams the team together
    ev["problemIn"] = S["problem"]["start"]
    add("sliver", S["problem"]["start"] - 0.06, -5)
    ev["problemCards"] = [W("p1", 2) - 0.06, W("p2", 1) - 0.06, W("p3", 1) - 0.06, W("p4", 1) - 0.06]
    for i, t in enumerate(ev["problemCards"]):
        add("pop", t, -7, 1.0 + 0.12 * i)
    ev["problemTeam"] = W("p5", 1) - 0.04
    add("slam", ev["problemTeam"], -6)

    # ---- solution: cards fly together -> logo snaps on "COREVIA" -> package card + checks + "1" stamp
    ev["solutionMerge"] = S["solution"]["start"]
    ev["solutionLogo"] = W("s1", 1) - 0.05
    add("swoosh", ev["solutionMerge"], -6)
    add("snap", ev["solutionLogo"], -5)
    ev["solutionCard"] = L["s2a"]["start"] - 0.12
    add("whoosh", ev["solutionCard"], -10, 1.15)
    ev["solutionChecks"] = [W("s2a", 0) + 0.18 + 0.16 * i for i in range(4)]
    for i, t in enumerate(ev["solutionChecks"]):
        add("tick", t, -10, 1.0 + 0.08 * i)
    ev["solutionStamp"] = W("s2b", 3) - 0.03
    add("stamp", ev["solutionStamp"], -5)

    # ---- services: drop on r1, one illustration per line
    ev["drop"] = S["services"]["start"]
    ev["services"] = [L[f"r{i}"]["start"] - (0.0 if i == 1 else 0.12) for i in range(1, 6)]
    for t in ev["services"][1:]:
        add("swish", t, -8)
    ev["serviceAccent"] = [W("r1", 1), W("r2", 1), W("r3", 1), W("r4", 1), W("r5", 1)]
    add("snip", ev["serviceAccent"][0] - 0.02, -9)
    add("draw", ev["serviceAccent"][1] - 0.25, -12)
    for k in range(3):
        add("blip", L["r3"]["start"] + 0.25 + 0.22 * k, -13, 1.0 + 0.1 * k)
    add("sparkle", ev["serviceAccent"][3] - 0.1, -10)
    add("boom", ev["serviceAccent"][4] + 0.05, -9)

    # ---- consistency: "10" / "12" slam, then calendar fills with reels (2-3 a week)
    ev["consistencyIn"] = S["consistency"]["start"]
    add("sliver", S["consistency"]["start"] - 0.06, -6)
    ev["num10"] = W("c1", 1) - 0.03
    ev["num12"] = W("c1", 2) - 0.03
    add("slam", ev["num10"], -8, 1.1)
    add("slam", ev["num12"], -7, 0.9)
    ev["calendarIn"] = L["c2"]["start"] - 0.2
    days = [2, 4, 6, 9, 11, 13, 16, 18, 20, 23, 25, 27]
    span = (L["c2"]["end"] - L["c2"]["start"]) * 0.92
    ev["calendarDays"] = days
    ev["calendarPops"] = [L["c2"]["start"] + span * i / len(days) for i in range(len(days))]
    for i, t in enumerate(ev["calendarPops"]):
        add("tick", t, -15, 1.0 + 0.04 * i)

    # ---- punch: music break, words slam, groove returns on "ريّح"
    ev["punchIn"] = S["punch"]["start"]
    ev["punchResume"] = L["k2"]["start"]
    add("riser", L["k2"]["start"] - 0.5, -12)

    # ---- CTA: chat bubbles + button
    ev["ctaIn"] = S["cta"]["start"]
    add("whoosh", S["cta"]["start"], -8, 0.9)
    ev["ctaBubbles"] = [L["a1"]["start"] + 0.05, W("a1", 3) - 0.1]
    for t in ev["ctaBubbles"]:
        add("ding", t, -11)
    ev["ctaButton"] = W("a1", 1) - 0.05
    add("pop", ev["ctaButton"], -8, 0.85)

    # ---- logo: flash + glitch reveal on "COREVIA", end-card CTA
    ev["logoFlash"] = S["logo"]["start"]
    ev["logoReveal"] = L["a3"]["start"]
    add("glitch", ev["logoFlash"], -9)
    add("shimmer", ev["logoReveal"] + 0.05, -12)
    ev["logoCta"] = L["a3"]["end"] + 0.6
    add("pop", ev["logoCta"], -9, 0.8)

    ev = {k: ([round(x, 4) for x in v] if isinstance(v, list) else round(v, 4)) for k, v in ev.items()}
    ev["calendarDays"] = days
    return ev, sorted(sfx, key=lambda s: s["t"])
