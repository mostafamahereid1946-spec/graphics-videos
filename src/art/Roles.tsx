import React from 'react';
import {C, FONT, rgba} from '../brand/tokens';
import {Emo} from './Emo';
import {Person} from './Person';
import {Laptop, Mic} from './Props';

export type RoleKind = 'editor' | 'motion' | 'captions' | 'sound';

const Bubble: React.FC<{w: number; text?: string; color?: string; flip?: boolean}> = ({w, text, color = C.cream, flip}) => (
	<div style={{position: 'relative', width: w, padding: '10px 14px', borderRadius: 18, background: color, display: 'flex', flexDirection: 'column', gap: 7}}>
		{text ? (
			<div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: C.navy, lineHeight: 1}}>{text}</div>
		) : (
			<>
				<div style={{height: 8, width: '90%', borderRadius: 4, background: rgba(C.navy, 0.55)}} />
				<div style={{height: 8, width: '60%', borderRadius: 4, background: rgba(C.navy, 0.35)}} />
			</>
		)}
		<div style={{position: 'absolute', bottom: -10, [flip ? 'left' : 'right']: 18, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `12px solid ${color}`}} />
	</div>
);

/** Drawn "you would have to hire…" scenes for the problem beat (box 440 x 520). t = seconds since shown. */
export const RoleScene: React.FC<{kind: RoleKind; t: number}> = ({kind, t}) => {
	const bob = (k: number) => Math.sin(t * 3 + k) * 6;
	const blink = Math.floor(t * 10) % 31 === 0;
	if (kind === 'editor') {
		return (
			<div style={{position: 'relative', width: 440, height: 520}}>
				<div style={{position: 'absolute', left: 95, top: 60}}>
					<Person size={250} hair="short" shirt={C.cyan} blink={blink} />
				</div>
				<div style={{position: 'absolute', left: 30, top: 290}}>
					<Laptop w={380} id="roleEditor">
						<rect width={520} height={300} fill={C.navyDeep} />
						<rect x={130} y={20} width={260} height={140} rx={6} fill={C.panel3} />
						<circle cx={200 + Math.sin(t * 2) * 40} cy={90} r={30} fill={C.cyan} />
						{[0, 1, 2].map((r) => (
							<g key={r}>
								{[0, 1, 2, 3].map((c) => (
									<rect key={c} x={20 + c * 124 + (r % 2) * 30} y={184 + r * 36} width={100 - r * 10} height={26} rx={6} fill={[C.gold, C.cyan, C.cream][r]} opacity={0.85} />
								))}
							</g>
						))}
						<rect x={60 + ((t * 120) % 400)} y={176} width={5} height={118} fill={C.white} />
					</Laptop>
				</div>
				<div style={{position: 'absolute', right: 6, top: 30 + bob(0), transform: 'rotate(10deg)'}}>
					<Emo name="clapper" size={96} />
				</div>
			</div>
		);
	}
	if (kind === 'motion') {
		return (
			<div style={{position: 'relative', width: 440, height: 520}}>
				<svg width={440} height={250} style={{position: 'absolute', left: 0, top: 10}}>
					<path d="M 40 200 C 110 40, 230 40, 250 130 S 380 210, 410 60" fill="none" stroke={C.cyan} strokeWidth={8} strokeDasharray="1 0" />
					{[[40, 200], [250, 130], [410, 60]].map(([x, y], i) => (
						<rect key={i} x={x - 11} y={y - 11} width={22} height={22} rx={3} fill={C.white} stroke={C.cyan} strokeWidth={4} />
					))}
					<circle cx={120 + bob(1) * 3} cy={70} r={22} fill={C.gold} />
					<rect x={330} y={150 + bob(2)} width={40} height={40} rx={8} fill={C.cream} transform={`rotate(${t * 60} 350 ${170 + bob(2)})`} />
				</svg>
				<div style={{position: 'absolute', left: 95, top: 110}}>
					<Person size={250} hair="hijab" hairColor={C.cyanDeep} shirt={C.gold} blink={blink} />
				</div>
				<svg width={440} height={200} style={{position: 'absolute', left: 0, top: 330}}>
					<rect x={60} y={30} width={320} height={150} rx={20} fill={C.navy} />
					<rect x={80} y={48} width={280} height={114} rx={10} fill={C.panel3} />
					<path d="M 110 140 Q 180 60 250 120 T 340 80" fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round" />
					<g transform={`translate(${250 + Math.sin(t * 3) * 40} ${110 + Math.cos(t * 3) * 10}) rotate(35)`}>
						<rect x={-6} y={-90} width={12} height={110} rx={6} fill={C.cream} />
						<path d="M -6 20 L 0 36 L 6 20 Z" fill={C.navy} />
					</g>
				</svg>
				<div style={{position: 'absolute', left: 10, top: 40 + bob(3), transform: 'rotate(-12deg)'}}>
					<Emo name="palette" size={92} />
				</div>
			</div>
		);
	}
	if (kind === 'captions') {
		return (
			<div style={{position: 'relative', width: 440, height: 520}}>
				<div style={{position: 'absolute', left: 95, top: 110}}>
					<Person size={250} hair="curly" shirt={C.cream} blink={blink} mouth="open" />
				</div>
				<div style={{position: 'absolute', left: 16, top: 40 + bob(0)}}>
					<Bubble w={150} text="Aa" color={C.cyan} flip />
				</div>
				<div style={{position: 'absolute', right: 16, top: 70 + bob(1.5)}}>
					<Bubble w={170} color={C.gold} />
				</div>
				<svg width={440} height={170} style={{position: 'absolute', left: 0, top: 360}}>
					<rect x={40} y={30} width={360} height={110} rx={16} fill={C.navy} />
					{Array.from({length: 3}).map((_, r) =>
						Array.from({length: 10 - r}).map((__, c) => (
							<rect key={`${r}-${c}`} x={58 + c * 33 + r * 14} y={44 + r * 30} width={26} height={22} rx={5} fill={(Math.floor(t * 8) + r * 3 + c) % 7 === 0 ? C.cyan : C.panel3} />
						)),
					)}
				</svg>
				<div style={{position: 'absolute', right: 30, top: 230 + bob(2), transform: 'rotate(12deg)'}}>
					<Emo name="writing" size={84} />
				</div>
			</div>
		);
	}
	return (
		<div style={{position: 'relative', width: 440, height: 520}}>
			<svg width={440} height={150} style={{position: 'absolute', left: 0, top: 20}}>
				{Array.from({length: 18}).map((_, i) => {
					const h = 20 + Math.abs(Math.sin(t * 6 + i * 0.7)) * 90;
					return <rect key={i} x={40 + i * 20} y={75 - h / 2} width={12} height={h} rx={6} fill={i % 4 === 0 ? C.gold : C.cyan} />;
				})}
			</svg>
			<div style={{position: 'absolute', left: 60, top: 120}}>
				<Person size={250} hair="cap" shirt={C.panel4} headphones blink={blink} mouth="open" />
			</div>
			<div style={{position: 'absolute', left: 270, top: 250}}>
				<Mic w={120} />
			</div>
			<div style={{position: 'absolute', left: 14, top: 300 + bob(1), transform: 'rotate(-10deg)'}}>
				<Emo name="headphone" size={90} />
			</div>
		</div>
	);
};
