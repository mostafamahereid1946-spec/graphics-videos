import React from 'react';
import {C, rgba} from '../brand/tokens';

export type ReelKind = 'cafe' | 'fashion' | 'burger' | 'beauty' | 'gym' | 'shop';

const BG: Record<ReelKind, [string, string]> = {
	cafe: [C.goldSoft, C.goldDeep],
	fashion: [C.cyanSoft, C.cyanDeep],
	burger: [C.panel4, C.panel],
	beauty: [C.cream, C.creamShade],
	gym: [C.panel3, C.navyDeep],
	shop: [C.gold, C.goldDeep],
};

/** The "video" inside a reel — a small flat scene for a type of local business. Box 180 x 320. */
const ReelScene: React.FC<{kind: ReelKind; t: number}> = ({kind, t}) => {
	const bob = Math.sin(t * 3) * 4;
	switch (kind) {
		case 'cafe':
			return (
				<g transform={`translate(0 ${bob})`}>
					{[0, 1, 2].map((i) => (
						<path key={i} d={`M ${72 + i * 18} 120 q -8 -14 0 -26 q 8 -12 0 -24`} fill="none" stroke={rgba(C.cream, 0.8)} strokeWidth={5} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 4 + i)} />
					))}
					<ellipse cx={90} cy={200} rx={64} ry={14} fill={C.cream} />
					<path d="M 46 132 L 134 132 L 124 196 Q 90 210 56 196 Z" fill={C.cream} />
					<ellipse cx={90} cy={132} rx={44} ry={10} fill={C.navy} />
					<path d="M 132 146 q 26 0 22 22 q -4 18 -26 16" fill="none" stroke={C.cream} strokeWidth={8} />
				</g>
			);
		case 'fashion':
			return (
				<g transform={`rotate(${Math.sin(t * 2.4) * 4} 90 92)`}>
					<path d="M 90 92 L 90 78 q 0 -12 12 -12" fill="none" stroke={C.navy} strokeWidth={5} strokeLinecap="round" />
					<path d="M 40 112 L 90 92 L 140 112" fill="none" stroke={C.navy} strokeWidth={5} />
					<path d="M 50 112 L 76 102 Q 90 118 104 102 L 130 112 L 150 150 L 130 158 L 128 230 L 52 230 L 50 158 L 30 150 Z" fill={C.cream} />
					<path d="M 76 102 Q 90 118 104 102" fill="none" stroke={C.gold} strokeWidth={5} />
					<rect x={84} y={150} width={12} height={12} rx={6} fill={C.gold} />
				</g>
			);
		case 'burger':
			return (
				<g transform={`translate(0 ${bob})`}>
					<path d="M 36 150 Q 90 70 144 150 Z" fill={C.gold} />
					{[56, 80, 104, 120].map((x, i) => (
						<ellipse key={i} cx={x} cy={124 + (i % 2) * 8} rx={3} ry={2} fill={C.cream} />
					))}
					<path d="M 32 152 L 148 152 L 140 166 L 120 158 L 100 168 L 80 158 L 60 168 L 40 158 Z" fill={C.cyan} />
					<rect x={36} y={166} width={108} height={24} rx={12} fill={C.navy} />
					<path d="M 38 190 L 142 190 L 130 204 L 50 204 Z" fill={C.goldSoft} />
					<path d="M 38 208 L 142 208 Q 142 232 120 232 L 60 232 Q 38 232 38 208 Z" fill={C.gold} />
				</g>
			);
		case 'beauty':
			return (
				<g transform={`translate(0 ${bob})`}>
					<rect x={62} y={110} width={56} height={110} rx={18} fill={C.cyan} />
					<rect x={74} y={88} width={32} height={26} rx={6} fill={C.gold} />
					<rect x={70} y={146} width={40} height={40} rx={8} fill={rgba(C.white, 0.8)} />
					<path d="M 140 100 l 5 12 l 12 5 l -12 5 l -5 12 l -5 -12 l -12 -5 l 12 -5 z" fill={C.gold} opacity={0.6 + 0.4 * Math.sin(t * 6)} />
					<path d="M 36 170 l 4 9 l 9 4 l -9 4 l -4 9 l -4 -9 l -9 -4 l 9 -4 z" fill={C.cyanDeep} opacity={0.6 + 0.4 * Math.sin(t * 5 + 1)} />
				</g>
			);
		case 'gym':
			return (
				<g transform={`translate(0 ${-Math.abs(Math.sin(t * 3)) * 18})`}>
					<rect x={44} y={150} width={92} height={14} rx={7} fill={C.cream} />
					<rect x={28} y={128} width={22} height={58} rx={6} fill={C.gold} />
					<rect x={130} y={128} width={22} height={58} rx={6} fill={C.gold} />
					<rect x={16} y={138} width={14} height={38} rx={5} fill={C.goldDeep} />
					<rect x={150} y={138} width={14} height={38} rx={5} fill={C.goldDeep} />
				</g>
			);
		default:
			return (
				<g transform={`translate(0 ${bob})`}>
					<path d="M 64 108 q 0 -36 26 -36 q 26 0 26 36" fill="none" stroke={C.cyan} strokeWidth={8} />
					<path d="M 44 106 L 136 106 L 146 224 L 34 224 Z" fill={C.navy} />
					<path d="M 104 150 l 26 0 l 0 26 l -26 0 z" fill={C.gold} transform="rotate(45 117 163)" />
					<circle cx={112} cy={156} r={4} fill={C.navy} />
				</g>
			);
	}
};

/**
 * A drawn reel (vertical short video card): footage, story progress bar, side actions, caption lines, play
 * button. Generic UI — no platform branding.
 */
export const Reel: React.FC<{w: number; kind: ReelKind; t?: number; liked?: number; play?: number; id: string}> = ({
	w,
	kind,
	t = 0,
	liked = 0,
	play = 0,
	id,
}) => {
	const [a, b] = BG[kind];
	return (
		<svg width={w} height={(w * 320) / 180} viewBox="0 0 180 320" style={{overflow: 'visible', display: 'block'}}>
			<defs>
				<linearGradient id={`rg-${id}`} x1="0" y1="0" x2="0.4" y2="1">
					<stop offset="0" stopColor={a} />
					<stop offset="1" stopColor={b} />
				</linearGradient>
				<clipPath id={`rc-${id}`}>
					<rect width={180} height={320} rx={22} />
				</clipPath>
			</defs>
			<g clipPath={`url(#rc-${id})`}>
				<rect width={180} height={320} fill={`url(#rg-${id})`} />
				<ReelScene kind={kind} t={t} />
				<rect y={236} width={180} height={84} fill={rgba(C.navyDeep, 0.35)} />
				{/* story progress */}
				{[0, 1, 2].map((i) => (
					<rect key={i} x={12 + i * 54} y={10} width={48} height={4} rx={2} fill={rgba(C.white, i === 0 ? 0.95 : 0.4)} />
				))}
				{/* side actions */}
				<path
					d="M 158 196 c -6 -9 -19 -4 -15 6 c 3 7 15 14 15 14 c 0 0 12 -7 15 -14 c 4 -10 -9 -15 -15 -6 z"
					fill={liked > 0.5 ? C.gold : 'none'}
					stroke={C.white}
					strokeWidth={3}
					transform={`translate(0 0) scale(1)`}
				/>
				<path d="M 145 226 h 26 a 4 4 0 0 1 4 4 v 13 a 4 4 0 0 1 -4 4 h -14 l -8 7 v -7 h -4 a 4 4 0 0 1 -4 -4 v -13 a 4 4 0 0 1 4 -4 z" fill="none" stroke={C.white} strokeWidth={3} />
				<path d="M 147 270 l 26 -12 l -6 26 l -6 -10 z" fill="none" stroke={C.white} strokeWidth={3} strokeLinejoin="round" />
				{/* creator + caption */}
				<circle cx={26} cy={262} r={11} fill={C.cream} />
				<rect x={44} y={255} width={66} height={7} rx={3.5} fill={rgba(C.white, 0.9)} />
				<rect x={14} y={282} width={110} height={6} rx={3} fill={rgba(C.white, 0.6)} />
				<rect x={14} y={294} width={76} height={6} rx={3} fill={rgba(C.white, 0.45)} />
				<rect y={314} width={180} height={6} fill={rgba(C.white, 0.25)} />
				<rect y={314} width={180 * ((t * 0.35) % 1)} height={6} fill={C.cyan} />
				{play > 0.01 ? (
					<g opacity={play} transform={`translate(90 150) scale(${0.6 + 0.4 * play})`}>
						<circle r={30} fill={rgba(C.white, 0.9)} />
						<path d="M -9 -15 L -9 15 L 16 0 Z" fill={C.navy} />
					</g>
				) : null}
			</g>
			<rect width={180} height={320} rx={22} fill="none" stroke={rgba(C.white, 0.25)} strokeWidth={2} />
		</svg>
	);
};
