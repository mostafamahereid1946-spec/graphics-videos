# VO script (Egyptian Arabic) — with delivery notes

Framework: Problem → Solution → CTA. Target 35–38 s. Pause marks: `/` short pause, `//` ~1 s. **Bold** = stress.

| # | Line | Delivery |
|---|---|---|
| ① Hook | محتاج ريلز **تشدّ** الناس لمشروعك؟ | فضول وابتسامة، نبرة طالعة في آخر السؤال |
| ② Problem | يعني محتاج **مونتير**… / ومصمّم **موشن جرافيك**… / وحدّ **للكابشنز**… / وحدّ **للصوت**… // ده **فريق كامل**! | بتعدّ على صوابعك والسرعة تزيد؛ "ده فريق كامل!" بمبالغة لطيفة |
| ③ Solution | مع **كورڤيا**… // الفريق ده **كلّه**… في باقة شهرية **واحدة**! | ثقة وكشف مفاجأة، وقفة بعد "كورڤيا" |
| ④ Services | مونتاج احترافي. / موشن جرافيك. / كابشنز متحركة. / إيموجيز مخصوص ليك. / ومؤثرات صوتية. | كل بند على ضربة، طاقة عالية |
| ⑤ Consistency | من **عشرة** لـ**اتناشر** ريل كل شهر… / يعني محتوى **ثابت** كل أسبوع. | هادي ومطمّن |
| ⑥ Punch | عايز إيه **تاني**؟! // ريّح دماغك… وسيب الريلز **علينا**. | ضحكة خفيفة، ثم هدوء وثقة |
| ⑦ CTA | **ابعتلنا رسالة** دلوقتي… / وخلّي محتواك **يتكلّم عنك**. // **كورڤيا**. | مباشر ودافي؛ "كورڤيا" بفخر (Core-VEE-ah) |

## What was recorded and what was used

Recording: `audio/source/voice-take-2026-10-03.mp3` (62.3 s, MP3 96 kbps, **−33.9 LUFS** — ~20 dB too quiet,
peaks −15.8 dBFS, no clipping; the phone's noise suppression left the pauses at −100 dB, so no denoising was
needed — DeepFilterNet was tested and changed speech by only ~0.2 dB).

Every line was identified with Whisper large-v3 (Arabic) and the best take cut out (times in the raw file):

| Line | Used take | Notes |
|---|---|---|
| hook | 1.85–4.24 | |
| p1–p5 | 5.64–12.63 | split at real pauses |
| s1, s2a | 20.33–22.68 | after interruption #1 (12.6–20.3 s silence) |
| s2b | **25.62–27.10 (take 2)** | take 1 (23.17–24.52) stops before "واحدة" |
| r1–r5 | 28.88–35.82 | split at real pauses |
| c1, c2 | 43.45–48.65 | after interruption #2 (35.9–43.3 s silence); "ريل" confirmed (not "ريال") |
| k1 / k2 | 50.68–51.50 / 51.50–53.49 | split so the punch-line gets a music break |
| a1 | 55.84–59.52 | one continuous take ("دلوقتي وخلّي" is fully joined) |
| a3 | 60.27–60.81 | |

Spoken wording that differs slightly from the script and is captioned **as spoken**:
"للكابشن", "كابشن متحرك", "إيموجي متخصص لك".

Processing ("studio" chain, `audio/build_vo.py`): per-line level matching (+10…+16 dB); 75 Hz rumble filter;
a **measured match-EQ** that moves the voice's long-term spectrum 60 % of the way to a warm close-mic broadcast
curve (+4.5 dB @ 100 Hz warmth, −1.7 dB @ 500 Hz box, −2.4…−3.3 dB @ 6–10 kHz phone harshness); subtle parallel
harmonic saturation; de-esser; two-stage compression; −16 LUFS stem; reverb throw on "تاني؟!".
Word timing: Whisper prefix/suffix verification of every word boundary + onset snapping
(`audio/word_align.json`).

## Re-recording later

Record in a quiet room, phone 15–20 cm away, 2 s silence first, ~1 s between lines, send WAV/M4A (not via
WhatsApp). Then update the `src` ranges in `audio/script.json` (or re-run `audio/align_words.py`) and rebuild —
see the README.
