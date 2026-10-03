import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, rgba} from '../brand/tokens';
import {kickPulse} from '../motion';

export type Paint = 'navy' | 'cyan' | 'cream' | 'gold';

export const PAINT: Record<Paint, {base: string; hi: string; lo: string; line: string; ring: string; band: string; vignette: number}> = {
	navy: {base: C.navy, hi: C.panel, lo: C.navyDeep, line: rgba(C.cyan, 0.045), ring: rgba(C.cyan, 0.34), band: rgba(C.cyan, 0.05), vignette: 0.42},
	cyan: {base: C.cyan, hi: '#4FE6F2', lo: '#0FB8CA', line: rgba(C.navy, 0.07), ring: rgba(C.navy, 0.18), band: rgba(C.white, 0.12), vignette: 0.16},
	cream: {base: C.cream, hi: '#FFFFFF', lo: C.creamShade, line: rgba(C.navy, 0.045), ring: rgba(C.gold, 0.5), band: rgba(C.gold, 0.08), vignette: 0.1},
	gold: {base: C.gold, hi: '#E9BD5F', lo: C.goldDeep, line: rgba(C.navy, 0.07), ring: rgba(C.navy, 0.16), band: rgba(C.white, 0.1), vignette: 0.2},
};

/** Full-page brand-colour backdrop: gradient, the card's steep hairlines, two slow "pulse frame" rings. */
export const SceneBg: React.FC<{paint: Paint; frame: number; clip?: string}> = ({paint, frame, clip}) => {
	const P = PAINT[paint];
	const pulse = kickPulse(frame);
	const ring = (cx: number, cy: number, r: number, rot: number, k: number) => (
		<g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${1 + pulse * 0.014 * k})`}>
			<circle r={r * 1.08} fill="none" stroke={P.band} strokeWidth={r * 0.16} />
			<circle r={r} fill="none" stroke={P.ring} strokeWidth={3} strokeDasharray={`${r * 2.2} ${r * 0.35} ${r * 0.9} ${r * 0.35}`} />
			<circle r={r * 0.72} fill="none" stroke={P.ring} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="4 14" />
		</g>
	);
	return (
		<AbsoluteFill style={{clipPath: clip}}>
			<AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 30%, ${P.hi} 0%, ${P.base} 52%, ${P.lo} 100%)`}} />
			<AbsoluteFill
				style={{
					backgroundImage: `repeating-linear-gradient(117deg, transparent 0px, transparent 102px, ${P.line} 102px, ${P.line} 104px)`,
					backgroundPosition: `${(frame * 0.6) % 104}px 0px`,
				}}
			/>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{ring(940, 300, 560, frame * 0.12, 1)}
				{ring(120, 1700, 360, -frame * 0.18, 1.4)}
			</svg>
			<AbsoluteFill style={{background: `radial-gradient(110% 70% at 50% 45%, transparent 58%, ${rgba('#000000', P.vignette)} 100%)`}} />
		</AbsoluteFill>
	);
};

/** Circle reveal of a new backdrop (p 0..1) from (cx, cy). */
export const IrisBg: React.FC<{paint: Paint; frame: number; p: number; cx?: number; cy?: number}> = ({paint, frame, p, cx = 540, cy = 960}) =>
	p <= 0 ? null : <SceneBg paint={paint} frame={frame} clip={p >= 1 ? undefined : `circle(${p * 1500}px at ${cx}px ${cy}px)`} />;
