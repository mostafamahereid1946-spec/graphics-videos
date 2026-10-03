# COREVIA — Brand Identity & Motion Guide

Reel: **"فريق كامل… في باقة واحدة"** — Meta Reels ad for COREVIA's monthly reels package (Egypt).
Format: 1080 × 1920, 30 fps, 41.5 s, H.264 + AAC, −14 LUFS.

## 1. Sources

| Source | Used for |
|---|---|
| `corevia_pulse_frame_final_a4_duplex_long_edge.pdf` (business card, vector) | Exact HEX palette (read from the PDF's vector colour operators, not sampled pixels), logo geometry, card motifs, fonts |
| Reference reel (LA MEDIA, 27 s) | Concept, pacing, transitions, layout |
| `website.sharegamer1946.workers.dev` | Not reachable from the build environment (blocked by its network egress policy). The card is the brand source of truth |

## 2. Palette (exact, from the card)

| Role | HEX | Where on the card |
|---|---|---|
| Core Navy (base) | `#071820` | front background, name text |
| Panel gradient | `#0B2630 → #06151C` | dark panel on the back |
| **Signal Cyan** (primary) | `#17D5E7` | C-ring, wordmark, zig-zag "pulse" sliver |
| **Circuit Gold** (accent) | `#D5A23E` | check mark, corner bars, wedge |
| Bronze Gold | `#AA7622` | "FREELANCE" (gold text on light) |
| Paper Cream | `#F7F5EE` | back info panel |
| Slate | `#273E47` | "Digital Solutions Engineer" |
| Steel greys | `#5F6A6B` `#879194` `#AEB4B1` | rules, dividers |
| Texture | cyan @ 3–5 % (hairlines), cyan @ 36 % (thin ring) | front background |

Derived tints used for flat illustration shading live in `src/brand/tokens.ts` and are marked "derived".

## 3. Typography

| Use | Face | Notes |
|---|---|---|
| Latin display (COREVIA, numbers) | **Outfit** 600–800 | from the card |
| Labels / kickers | **DM Mono** 500, tracked 0.16–0.3 em | from the card ("IT SOLUTIONS ENGINEERING") |
| Arabic headlines + captions | **Alexandria** 600–900 | geometric Arabic that pairs with Outfit (OFL) |

Minimum sizes: headlines ≥ 56 px (used 60–150 px), captions/kinetic words ≥ 36 px, any text ≥ 28 px.

## 4. Logo (rebuilt from the PDF vectors, 200-unit box)

* Cyan C: arc centre (96.36, 100), r = 74, from −45.7° to +45.7°, stroke 22, square caps → `M 148 47 A 74 74 0 1 0 148 153`
* Gold check: `M 67 84 L 100 121 L 133 84`, stroke 16
* Gold tab: `M 138 84 L 151 84`, stroke 10

## 5. Brand motifs → motion

| Card motif | In the reel |
|---|---|
| C-ring | magnifier lens, logo draw-on, ring bursts |
| Gold check + tab | checklist ticks, brand emoji smile |
| Gold corner bars / crop marks | viewfinder corners (services), end-card bars, role-card corners |
| Diagonal hairlines + huge arcs | parallax background, beat-pulsing rings |
| Dark notched panel + cyan zig-zag sliver | chevron wipe transition; the package card (card back rebuilt live) |
| Gold wedge | diagonal wedge wipe into the CTA |
| Dashed cut line | "team" frame, the edit cut in the editor illustration |
| "Pulse frame" | audio-reactive pulse line in the lower third |

## 6. Reference breakdown → our structure (v2)

| Reference (27 s) | COREVIA (41.5 s) |
|---|---|
| Sticky note + magnifier zooms through → "محتاج موظف" in the lens | Sticky note "ريلز ؟" (Ruqaa handwriting) + magnifier dive → full cyan page: reels fan in ("ريلز"), attraction beams ("تشدّ"), a crowd slides in with reactions ("الناس"), the shop opens ("لمشروعك؟") |
| 6-role framed grid | 4 "مطلوب" (wanted) panels with drawn hires — editor at a laptop, motion designer with a pen tablet, captions writer, sound person with headphones + mic → "ده فريق كامل!" 🤯 ×4 |
| "for the salary of one" | The hires collapse into four **skill** badges orbiting the COREVIA mark (cream page) → the mark lands on a gift box, the skills drop in, lid closes, gold "1" stamp + confetti on "واحدة!" (one package — never staff) |
| Roll-call: big illustration per role, REC viewfinder | Cyan page roll-call: laptop edit + film strip cut by scissors · bezier artboard + 🎨✨ · big captions phone + 💬 · 3D emoji explosion · speaker + mic + live EQ + "بووم!" stickers |
| — | 12 drawn reels rain in on "10… 12", then fly into their days of a month calendar ("2–3 ريلز كل أسبوع") |
| Text-only "شتبي بعد؟!" | Gold page "عايز إيه تاني؟! 🤔" + floating ؟ during the music break |
| "تدلّل" | Cyan page: relaxed client on a beach chair 😎; reels fly to the COREVIA badge on "علينا" 💪 |
| — | Phone chat → paper plane on "رسالة" 📩, megaphone on "يتكلّم" 📣, button + 👇 |
| Glitchy chromatic logo reveal | Flash + RGB-split glitch, mark draws on "COREVIA", reels frame the lockup, CTA |

Every spoken keyword also gets a **3D emoji beside the word** (`src/timeline/emoji.ts`), popping a beat after
the word itself. Full-page backgrounds follow the voice: navy → cyan (lens) → navy → cream (iris from the logo)
→ cyan (drop) → navy → gold (break) → cyan (beat returns) → navy (CTA, logo).

## 7. Safe zones

Layout rule = the brief: **≥ 150 px top, ≥ 170 px bottom, ≥ 60 px sides** for all vital text (render the
`SafeZoneQA` composition to see it). Illustrations and backgrounds use the full page. Meta's Reels-ad UI can
cover part of the lower third; the CTA button sits at y ≈ 1560–1690 in the CTA scene and y ≈ 1300 on the end card.

## 8. Ad-policy guardrails (Meta + Egypt)

* No prices, money, "free", "discount" or "save" wording.
* No promised results (views, followers, sales); "تشدّ الناس" is a creative claim, not a guarantee.
* Hook asks about a need, never asserts a personal attribute (Meta personal-attributes policy).
* No Instagram/Facebook/WhatsApp logos, trademarks or cloned UI — generic phone/chat graphics only.
* Culturally neutral imagery (the reference's "model" role was dropped); no religious/political symbols.
* No Qatari phone number on screen (Egypt targeting); the CTA points to Meta's "Send message" button.
* "10–12 ريل كل شهر" must stay true to the package you sell.
* Music and SFX are original (synthesised) → no copyright claims or muting.
