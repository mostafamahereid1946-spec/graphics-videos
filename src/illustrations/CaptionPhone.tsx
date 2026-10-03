import React from 'react';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {SPR, sprAt} from '../motion';
import {Emoji} from './Emojis';
import {PHONE, PhoneBody} from './Phone';

const K = 1.08;
const WORDS = ['الكلام', 'بيتحرّك', 'معاك'];

/** A phone playing a reel whose captions pop word-by-word with a moving highlight (captions explaining captions). */
export const CaptionPhone: React.FC<{frame: number; startAt: number}> = ({frame, startAt}) => {
	const t = frame / FPS;
	const step = 0.22;
	const first = startAt + 0.25;
	const activeIdx = Math.min(WORDS.length - 1, Math.floor((t - first) / step));
	const sticker = sprAt(frame, first + step * 3 + 0.1, SPR.bouncy);
	const w = PHONE.w * K;
	const h = PHONE.h * K;
	return (
		<div style={{position: 'relative', width: w, height: h}}>
			<svg width={w} height={h} viewBox={`0 0 ${PHONE.w} ${PHONE.h}`} style={{overflow: 'visible'}}>
				<PhoneBody id="capPhone" screen={C.panel3}>
					<defs>
						<linearGradient id="capSky" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor={C.panel4} />
							<stop offset="1" stopColor={C.panel} />
						</linearGradient>
					</defs>
					<rect x={0} y={0} width={PHONE.w} height={PHONE.h} fill="url(#capSky)" />
					<circle cx={196} cy={170} r={60} fill={rgba(C.cyan, 0.25)} />
					<circle cx={196} cy={170} r={34} fill={rgba(C.gold, 0.85)} />
					<path d="M 16 360 L 96 270 L 150 320 L 214 240 L 284 330 L 284 604 L 16 604 Z" fill={rgba(C.navy, 0.55)} />
					<path d="M 16 420 L 120 350 L 190 400 L 284 360 L 284 604 L 16 604 Z" fill={rgba(C.navyDeep, 0.85)} />
					{/* progress */}
					<rect x={16} y={592} width={268} height={6} fill={rgba(C.cream, 0.18)} />
					<rect x={16} y={592} width={268 * Math.min(1, Math.max(0, (t - startAt) / 1.4))} height={6} fill={C.cyan} />
				</PhoneBody>
			</svg>
			{/* on-screen captions */}
			<div
				style={{
					position: 'absolute',
					left: 18 * K,
					right: 18 * K,
					top: 430 * K,
					display: 'flex',
					flexWrap: 'wrap',
					direction: 'rtl',
					justifyContent: 'center',
					gap: 4,
				}}
			>
				{WORDS.map((word, i) => {
					const at = first + i * step;
					const p = sprAt(frame, at, SPR.pop);
					const active = i === activeIdx && t >= at;
					return (
						<span
							key={word}
							style={{
								fontFamily: FONT.ar,
								fontWeight: 800,
								fontSize: 34,
								lineHeight: 1.3,
								padding: '0 10px',
								borderRadius: 12,
								color: active ? C.navy : C.white,
								background: active ? C.cyan : 'transparent',
								opacity: t >= at ? 1 : 0,
								transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 16}px)`,
								textShadow: active ? 'none' : `0 3px 10px ${rgba('#000000', 0.5)}`,
							}}
						>
							{word}
						</span>
					);
				})}
			</div>
			<div style={{position: 'absolute', right: -40, top: 70, transform: `scale(${sticker}) rotate(${(1 - sticker) * 40 + 10}deg)`}}>
				<Emoji kind="cface" size={110} />
			</div>
		</div>
	);
};
