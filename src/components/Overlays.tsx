import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, rgba} from '../brand/tokens';

/** Film grain (animated fractal noise, half-res) — adds texture and dithers the navy gradients. */
export const Grain: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 0.06}) => (
	<AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
		<svg width={540} height={960} style={{transform: 'scale(2)', transformOrigin: 'top left'}}>
			<filter id="grain">
				<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 9} stitchTiles="stitch" />
				<feColorMatrix type="saturate" values="0" />
			</filter>
			<rect width={540} height={960} filter="url(#grain)" />
		</svg>
	</AbsoluteFill>
);

/** QA overlay: the brief's safe zone (150 top / 170 bottom / 60 sides) + Meta's Reels-ad UI zone (dotted, info). */
export const SafeZones: React.FC = () => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<div style={{position: 'absolute', left: 60, right: 60, top: 150, bottom: 170, border: `4px solid ${rgba('#FF3B6B', 0.95)}`}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 1250, height: 2, borderTop: `3px dotted ${rgba(C.gold, 0.9)}`}} />
		<div style={{position: 'absolute', left: 70, top: 1258, fontFamily: FONT.mono, fontSize: 28, color: C.gold}}>META UI BELOW (INFO)</div>
	</AbsoluteFill>
);

/** Full-frame flash (drop / logo). */
export const Flash: React.FC<{p: number; color?: string}> = ({p, color = C.white}) =>
	p > 0 ? <AbsoluteFill style={{background: color, opacity: p}} /> : null;

/** Gold card-wedge sweeping diagonally across the frame (card-back wedge as a transition). */
export const WedgeWipe: React.FC<{progress: number}> = ({progress}) => {
	if (progress <= 0 || progress >= 1) return null;
	const x = -1500 + progress * 3300;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
			<g transform={`translate(${x} 0) skewX(-24)`}>
				<rect x={-260} y={-200} width={150} height={2400} fill={C.cyan} />
				<rect x={-100} y={-200} width={1250} height={2400} fill={C.gold} />
				<rect x={1150} y={-200} width={70} height={2400} fill={C.navy} />
			</g>
		</svg>
	);
};
