import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LogoMark, Tagline, Wordmark} from '../brand/Logo';
import {GoldBar} from '../brand/motifs';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {EASE, SPR, rand, sprAt, tween} from '../motion';
import {ev} from '../timeline';
import {Emo} from '../art/Emo';
import {Reel} from '../art/Reel';
import {CtaButton} from '../illustrations/Chat';

const Lockup: React.FC<{frame: number; at: number}> = ({frame, at}) => {
	const ring = tween(frame, at, at + 0.45, 0, 1, EASE.inOut);
	const check = tween(frame, at + 0.22, at + 0.5, 0, 1, EASE.out);
	const tab = tween(frame, at + 0.45, at + 0.6, 0, 1, EASE.outBack);
	const word = tween(frame, at + 0.05, at + 0.7, 0, 1, EASE.out);
	const tag = tween(frame, at + 0.45, at + 1.2, 0, 1, EASE.inOut);
	const dash = sprAt(frame, at + 1.15, SPR.snappy);
	const glow = 0.5 + 0.5 * Math.sin((frame / FPS) * 3);
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<LogoMark size={360} ring={ring} check={check} tab={tab} glow={0.5 + 0.4 * glow} />
			<Wordmark size={170} progress={word} style={{marginTop: 34}} />
			<div style={{marginTop: 30}}>
				<Tagline size={36} progress={tag} />
			</div>
			<div style={{width: 100, height: 11, background: C.gold, marginTop: 34, transform: `scaleX(${dash})`}} />
		</div>
	);
};

/**
 * Logo end card (the reference's glitchy chromatic reveal): white flash, RGB-split slices, the mark draws on
 * "COREVIA", reels orbit the lockup, CTA button + pointing hand to Meta's button.
 */
export const LogoEnd: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const flashAt = ev('logoFlash');
	const at = ev('logoReveal');
	const cta = ev('logoCta');
	const glitch = t >= flashAt && t < at + 0.32;
	const g = glitch ? 1 - (t - flashAt) / (at + 0.32 - flashAt) : 0;
	const seed = Math.floor(frame / 2);
	const split = glitch ? 24 * g * (0.5 + rand(seed)) : 0;
	const lock = <Lockup frame={frame} at={Math.min(at, flashAt + 0.04)} />;
	const bars = sprAt(frame, at + 0.3, SPR.snappy);
	const orbit = sprAt(frame, at + 0.6, SPR.soft);
	return (
		<AbsoluteFill>
			<GoldBar x={60} y={150} w={220} h={12} progress={bars} />
			<GoldBar x={800} y={1738} w={220} h={12} progress={bars} fromRight />
			{/* reels orbiting the brand */}
			{[0, 1, 2, 3].map((i) => {
				const pos = [
					[120, 470, -12],
					[960, 470, 12],
					[120, 1150, 10],
					[960, 1150, -10],
				][i];
				const x = 540 + (pos[0] - 540) * orbit;
				const y = pos[1] + Math.sin(t * 2.2 + i) * 16;
				return (
					<div key={i} style={{position: 'absolute', left: x - 60, top: y - 107, opacity: orbit, transform: `scale(${0.6 + 0.4 * orbit}) rotate(${pos[2] + Math.sin(t * 1.8 + i) * 4}deg)`}}>
						<Reel w={120} kind={(['cafe', 'fashion', 'beauty', 'shop'] as const)[i]} t={t + i} play={1} id={`end${i}`} />
					</div>
				);
			})}
			<div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1}}>
				{glitch ? (
					<div style={{position: 'relative'}}>
						<div style={{position: 'absolute', inset: 0, transform: `translateX(${split}px)`, opacity: 0.75, filter: 'hue-rotate(160deg) saturate(2)', mixBlendMode: 'screen'}}>{lock}</div>
						<div style={{position: 'absolute', inset: 0, transform: `translateX(${-split}px)`, opacity: 0.75, filter: 'sepia(1) saturate(4) hue-rotate(-20deg)', mixBlendMode: 'screen'}}>{lock}</div>
						{[0, 1, 2, 3, 4].map((k) => {
							const y0 = rand(seed * 7 + k) * 90;
							const dx = (rand(seed * 13 + k) - 0.5) * 140 * g;
							return (
								<div key={k} style={{position: 'absolute', inset: 0, clipPath: `inset(${y0}% 0 ${Math.max(0, 100 - y0 - 6)}% 0)`, transform: `translateX(${dx}px)`}}>
									{lock}
								</div>
							);
						})}
						<div style={{opacity: 0.85}}>{lock}</div>
					</div>
				) : (
					lock
				)}
			</div>
			<div style={{position: 'absolute', top: 1300, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 3}}>
				<CtaButton frame={frame} at={cta} width={760} />
			</div>
			<div style={{position: 'absolute', left: 56, top: 1270 + Math.abs(Math.sin(t * 5)) * 20, transform: `scale(${sprAt(frame, cta + 0.2, SPR.bouncy)})`, zIndex: 3}}>
				<Emo name="point_down" size={130} />
			</div>
			<div style={{position: 'absolute', top: 1470, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily: FONT.ar, fontWeight: 700, fontSize: 44, color: rgba(C.cream, 0.92), opacity: tween(frame, cta + 0.25, cta + 0.5), zIndex: 3}}>
				ريلز احترافية… كل أسبوع
			</div>
		</AbsoluteFill>
	);
};
