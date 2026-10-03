import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import React from 'react';
import {C, FPS, rgba} from '../brand/tokens';
import {EASE, SPR, sprAt, tween} from '../motion';

const W = 860;
const H = 560;
const PATH = 'M 90 400 C 210 110, 390 110, 440 290 S 650 480, 780 150';
const LEN = getLength(PATH);
const at = (len: number) => getPointAtLength(PATH, len) ?? {x: 0, y: 0};
const tangent = (len: number) => getTangentAtLength(PATH, len) ?? {x: 1, y: 0};
const ANCHORS = [
	{x: 90, y: 400, at: 0},
	{x: 440, y: 290, at: 0.5},
	{x: 780, y: 150, at: 1},
];

/** Motion-graphics artboard: a bezier draws itself with a pen tool, shapes ride the curve, keyframes pop. */
export const MotionBoard: React.FC<{frame: number; drawAt: number}> = ({frame, drawAt}) => {
	const t = frame / FPS;
	const draw = tween(frame, drawAt, drawAt + 0.75, 0, 1, EASE.inOut);
	const tip = at(Math.max(0.01, LEN * draw));
	const tan = tangent(Math.max(0.01, LEN * draw));
	const ang = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;
	const ride = Math.max(0, t - (drawAt + 0.75));

	return (
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible'}}>
			<defs>
				<pattern id="dots" width={40} height={40} patternUnits="userSpaceOnUse">
					<circle cx={20} cy={20} r={2.2} fill={rgba(C.cyan, 0.18)} />
				</pattern>
			</defs>
			<rect x={0} y={0} width={W} height={H} rx={28} fill={C.panel} stroke={rgba(C.cyan, 0.2)} strokeWidth={2} />
			<rect x={0} y={0} width={W} height={H} rx={28} fill="url(#dots)" />

			{/* tangent handles on the middle anchor */}
			<g opacity={tween(frame, drawAt + 0.3, drawAt + 0.5)}>
				<line x1={360} y1={170} x2={520} y2={410} stroke={rgba(C.cream, 0.6)} strokeWidth={3} />
				<circle cx={360} cy={170} r={11} fill={C.gold} />
				<circle cx={520} cy={410} r={11} fill={C.gold} />
			</g>

			{/* the curve */}
			<path d={PATH} fill="none" stroke={rgba(C.cyan, 0.15)} strokeWidth={10} strokeLinecap="round" />
			<path
				d={PATH}
				fill="none"
				stroke={C.cyan}
				strokeWidth={10}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray="1 1"
				strokeDashoffset={1 - draw}
				opacity={draw > 0.001 ? 1 : 0}
			/>
			{ANCHORS.map((a, i) => {
				const p = sprAt(frame, drawAt + a.at * 0.75, SPR.pop);
				return (
					<rect
						key={i}
						x={a.x - 13}
						y={a.y - 13}
						width={26}
						height={26}
						rx={4}
						fill={C.white}
						stroke={C.cyan}
						strokeWidth={5}
						transform={`rotate(${(1 - p) * 90} ${a.x} ${a.y}) translate(${a.x * (1 - p)} ${a.y * (1 - p)}) scale(${p})`}
					/>
				);
			})}

			{/* shapes riding the curve after it is drawn */}
			{ride > 0
				? [0, 0.33, 0.66].map((off, i) => {
						const u = (ride * 0.55 + off) % 1;
						const pt = at(LEN * u);
						const appear = Math.min(1, ride * 4);
						const squash = 1 + 0.18 * Math.sin((ride * 6 + i) * Math.PI);
						return (
							<g key={i} transform={`translate(${pt.x} ${pt.y}) scale(${appear * squash} ${appear / squash})`}>
								{i === 0 ? <circle r={28} fill={C.cyan} /> : null}
								{i === 1 ? <rect x={-24} y={-24} width={48} height={48} rx={10} fill={C.gold} transform={`rotate(${ride * 120})`} /> : null}
								{i === 2 ? <path d="M 0 -30 L 28 22 L -28 22 Z" fill={C.cream} transform={`rotate(${-ride * 90})`} /> : null}
							</g>
						);
					})
				: null}

			{/* pen tool at the drawing tip */}
			<g transform={`translate(${tip.x} ${tip.y}) rotate(${ang + 45})`} opacity={draw > 0 && draw < 1 ? 1 : tween(frame, drawAt + 0.75, drawAt + 0.95, 1, 0)}>
				<path d="M 0 0 L 16 -38 L 30 -24 Z" fill={C.cream} />
				<path d="M 16 -38 L 34 -62 L 54 -48 L 30 -24 Z" fill={C.gold} />
				<circle cx={13} cy={-21} r={4} fill={C.navy} />
			</g>

			{/* keyframe track */}
			<line x1={90} y1={510} x2={780} y2={510} stroke={rgba(C.cyan, 0.3)} strokeWidth={3} />
			{[90, 262, 435, 607, 780].map((x, i) => {
				const p = sprAt(frame, drawAt + i * 0.17, SPR.pop);
				return (
					<rect
						key={i}
						x={x - 13}
						y={497}
						width={26}
						height={26}
						fill={C.gold}
						transform={`translate(${x * (1 - p)} ${510 * (1 - p)}) scale(${p}) rotate(45 ${x} 510)`}
					/>
				);
			})}
		</svg>
	);
};
