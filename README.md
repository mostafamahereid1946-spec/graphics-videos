# COREVIA — Meta Reels ad "فريق كامل… في باقة واحدة"

A 1080×1920, 30 fps, 41.5 s motion-graphics ad built in **[Remotion](https://www.remotion.dev/)** (React), voiced
by Moustafa (Egyptian Arabic), for COREVIA's monthly reels package in Egypt.

**Deliverable:** `out/corevia-reel-v2.mp4` (H.264 High / yuv420p, AAC 320 kbps, −14 LUFS, −1.3 dBTP).

## What's inside

* **Audio pipeline (`audio/`, Python):** your phone recording → best takes cut with Whisper-verified timing →
  "studio" voice chain (measured match-EQ, harmonic warmth, de-esser, compression) → original music composed
  on the voice's beat grid → 50 synthesized SFX → multiband ducking → master.
* **Timeline (`src/timeline/timeline.json`):** generated from the voice — every word's start/end, scene cuts,
  music sections, SFX cues, kick times, per-frame audio levels. All visuals read it, so motion lands on the word.
* **Visuals (`src/`, Remotion):** full-page brand-colour scenes (navy / cyan / cream / gold), drawn
  illustrations for everything the voice says (`src/art/`), 3D emojis beside the matching words, word-synced
  kinetic Arabic typography, brand transitions (chevron wipe, iris, gold wedge, glitch logo).

```
audio/
  script.json        lines, caption words, best-take source ranges, beat-grid rules (single source of truth)
  build_vo.py        cut + level + word timing + studio chain → public/audio/vo.wav + timeline.json
  align_words.py     (optional) Whisper large-v3 word-boundary verification → audio/word_align.json
  cues.py            named visual/SFX events derived from the words
  music.py           original music (D harmonic minor, 120 BPM) → public/audio/music.wav
  sfx.py             synthesized SFX → public/audio/sfx.wav
  mix.py             ducking + mastering → public/audio/mix.wav (+ audio levels for the visuals)
src/
  CoreviaReel.tsx    main composition (backgrounds, scenes, transitions, audio)
  scenes/            Hook, Problem, Solution, Services, Consistency, Punch, Cta, LogoEnd
  art/               drawn illustrations: reels, people, props (shop, magnet, gift box, laptop…), emoji
  brand/             tokens (exact card colours), fonts, logo (rebuilt from the card's vectors), motifs
  components/        KineticText (word-synced Arabic + emojis), SceneBg, overlays
docs/                brand & motion guide, VO script + take map
```

## Rebuild

Prerequisites: Node 18+, Python 3.10+, ffmpeg.

```bash
npm install
pip install -r audio/requirements.txt

# audio (≈ 30 s) — re-run whenever the recording or script.json changes
npm run audio

# preview / render
npm run studio                 # live preview in the browser
npm run render                 # → out/corevia-reel-v2.mp4
npx remotion render SafeZoneQA out/safezones.mp4   # same video with safe-zone overlay
```

In a sandbox without Chrome, point Remotion at a Chrome Headless Shell:
`REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell npm run render`.

### New recording?

1. Put it in `audio/source/` and set `recording` in `audio/script.json`.
2. Update each line's `src` [start, end] (seconds in the raw file). Optionally run
   `python3 audio/align_words.py /path/to/sherpa-onnx-whisper-large-v3` for verified word timing.
3. `npm run audio && npm run render`.

## Meta upload notes

* 9:16, 1080×1920, ≤ 60 s → Reels/Stories placements. Pick the **Send message** (or WhatsApp) CTA button;
  the video's last frames point down to it.
* Layout follows the brief's safe zone (150 px top / 170 px bottom / 60 px sides). Meta's own UI may cover
  part of the lower third in Reels placements; nothing vital lives in the bottom 170 px.
* No prices, no promised results, no platform logos (see `docs/BRAND_MOTION_GUIDE.md`).

## Licences

* Remotion: free for individuals and companies with ≤ 3 employees — <https://www.remotion.dev/license>.
* Fonts: Outfit, DM Mono, Alexandria, Aref Ruqaa — SIL Open Font License (via Fontsource).
* 3D emoji: Microsoft Fluent Emoji, MIT (`public/emoji/LICENSE-fluentui-emoji.txt`).
* Music & SFX: original, synthesized in `audio/` — no third-party samples.
