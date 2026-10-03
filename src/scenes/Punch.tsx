import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {LogoMark} from '../brand/Logo';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {KineticText} from '../components/KineticText';
import {EASE, SPR, sprAt, tween} from '../motion';
import {ev, line, wordAt} from '../timeline';
import {withEmoji} from '../timeline/emoji';
import {Emo} from '../art/Emo';
import {Person} from '../art/Person';
import {BeachChill} from '../art/Props';
import {Reel} from '../art/Reel';

/**
 * Punch-line. Gold page + music break: "عايز إيه تاني؟!" with floating question marks (the reference's
 * "شتبي بعد؟!"). Beat returns on a cyan page: "ريّح دماغك…" — a relaxed client on a beach chair — and on
 * "وسيب الريلز علينا" the reels fly off to the COREVIA mark.
 */
export const Punch: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const resume = ev('punchResume');
	const k1 = line('k1');
	const inK2 = t >= resume - 0.02;
	const last = k1.words[k1.words.length - 1].start;
	const shake = t > last && t < last + 0.45 ? Math.sin((t - last) * 70) * Math.exp(-(t - last) * 8) * 14 : 0;

	if (!inK2) {
		return (
			<AbsoluteFill style={{transform: `translateX(${shake}px)`}}>
				{[0, 1, 2, 3, 4, 5, 6].map((i) => {
					const p = sprAt(frame, k1.start + 0.05 + i * 0.07, SPR.bouncy);
					const x = [120, 900, 200, 860, 520, 120, 920][i];
					const y = [330, 360, 1450, 1500, 1640, 900, 980][i];
					return (
						<div key={i} style={{position: 'absolute', left: x - 80, top: y - 100 + Math.sin(t * 3 + i) * 14, fontFamily: FONT.ar, fontWeight: 900, fontSize: 200, color: rgba(C.navy, 0.16), transform: `scale(${p}) rotate(${(i % 2 ? 1 : -1) * (12 + i * 4)}deg)`}}>
							؟
						</div>
					);
				})}
				<div style={{position: 'absolute', left: 60, right: 60, top: 620, display: 'flex', justifyContent: 'center'}}>
					<KineticText words={withEmoji('k1')} frame={frame} size={156} weight={900} variant="slam" color={C.navy} emColor={C.white} emBg={C.navy} lineHeight={1.3} />
				</div>
			</AbsoluteFill>
		);
	}

	const chill = sprAt(frame, resume, SPR.soft);
	const fly = tween(frame, wordAt('k2', 3) - 0.1, wordAt('k2', 4) + 0.05, 0, 1, EASE.inOut);
	const badge = sprAt(frame, wordAt('k2', 3) - 0.2, SPR.pop);
	const flex = sprAt(frame, wordAt('k2', 4) + 0.05, SPR.bouncy);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 175, left: 60, right: 60, display: 'flex', justifyContent: 'center'}}>
				<KineticText
					words={withEmoji('k2').map((w, i) => (i === 2 ? {...w, lineBreak: true} : w))}
					frame={frame}
					size={96}
					weight={900}
					color={C.navy}
					emColor={C.white}
					emBg={C.navy}
					lineHeight={1.34}
				/>
			</div>
			{/* beach chill */}
			<div style={{position: 'absolute', left: 60, top: 820 + (1 - chill) * 700}}>
				<BeachChill w={960} t={t} />
			</div>
			<div style={{position: 'absolute', left: 520, top: 1080 + (1 - chill) * 700, transform: 'rotate(-14deg)'}}>
				<Person size={270} hair="short" shirt={C.cream} shades mouth="smile" />
			</div>
			<div style={{position: 'absolute', left: 840, top: 1260 + (1 - chill) * 700, transform: `rotate(10deg) translateY(${Math.sin(t * 3) * 8}px)`}}>
				<Emo name="coffee" size={150} />
			</div>
			{/* reels fly off to COREVIA ("سيب الريلز علينا") */}
			<div style={{position: 'absolute', left: 780, top: 560, width: 220, height: 220, borderRadius: 110, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${badge * (1 + 0.1 * flex)})`, boxShadow: `0 20px 50px ${rgba(C.navy, 0.45)}`}}>
				<LogoMark size={150} />
			</div>
			{[0, 1, 2].map((i) => {
				const p = Math.min(1, Math.max(0, fly * 1.3 - i * 0.15));
				if (p <= 0 || p >= 1) return null;
				const x = interpolate(p, [0, 1], [300 + i * 120, 890]);
				const y = interpolate(p, [0, 1], [1100 - i * 40, 670]) - Math.sin(p * Math.PI) * 220;
				return (
					<div key={i} style={{position: 'absolute', left: x - 60, top: y - 107, transform: `scale(${1 - 0.7 * p}) rotate(${p * 40 - 20}deg)`}}>
						<Reel w={120} kind={(['cafe', 'gym', 'shop'] as const)[i]} t={t} play={1} id={`pun${i}`} />
					</div>
				);
			})}
			<div style={{position: 'absolute', left: 640, top: 760, transform: `scale(${flex}) rotate(-10deg)`}}>
				<Emo name="biceps" size={170} />
			</div>
		</AbsoluteFill>
	);
};
