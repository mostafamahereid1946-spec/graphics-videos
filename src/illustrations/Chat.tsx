import React from 'react';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {SPR, kickPulse, sprAt} from '../motion';

/** The conversion button: points down to Meta's CTA ("Send message") under the video. */
export const CtaButton: React.FC<{frame: number; at: number; width?: number}> = ({frame, at, width = 760}) => {
	const t = frame / FPS;
	const p = sprAt(frame, at, SPR.pop);
	const pulse = 1 + 0.035 * kickPulse(frame, 0.16);
	const shine = ((t - at) % 1.6) / 1.6;
	return (
		<div
			style={{
				position: 'relative',
				width,
				height: 128,
				borderRadius: 64,
				background: C.cyan,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 26,
				direction: 'rtl',
				overflow: 'hidden',
				opacity: p > 0.01 ? 1 : 0,
				transform: `scale(${p * pulse})`,
				boxShadow: `0 0 0 ${8 + 10 * kickPulse(frame, 0.2)}px ${rgba(C.cyan, 0.18)}, 0 24px 60px ${rgba('#000000', 0.45)}`,
			}}
		>
			<div style={{fontFamily: FONT.ar, fontWeight: 900, fontSize: 58, color: C.navy}}>ابعتلنا رسالة</div>
			<div style={{width: 76, height: 76, borderRadius: 38, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<svg width={40} height={40} viewBox="0 0 40 40" style={{transform: `translateY(${Math.sin(t * 8) * 4}px)`}}>
					<path d="M 20 6 L 20 32 M 8 21 L 20 33 L 32 21" fill="none" stroke={C.cyan} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
			<div
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					width: 120,
					left: `${-20 + shine * 140}%`,
					background: `linear-gradient(100deg, transparent, ${rgba(C.white, 0.45)}, transparent)`,
					transform: 'skewX(-18deg)',
				}}
			/>
		</div>
	);
};
