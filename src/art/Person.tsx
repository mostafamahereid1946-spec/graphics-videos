import React from 'react';
import {C, rgba} from '../brand/tokens';

export type Hair = 'short' | 'curly' | 'hijab' | 'cap' | 'long';

/**
 * Flat, friendly bust in the brand palette (box 200 x 230; head centre ~ (100, 92)).
 * Stylised like the reference reel's figures — no skin-tone realism, just shapes.
 */
export const Person: React.FC<{
	size: number;
	hair?: Hair;
	shirt?: string;
	hairColor?: string;
	headphones?: boolean;
	shades?: boolean;
	blink?: boolean;
	mouth?: 'smile' | 'open' | 'wow';
	style?: React.CSSProperties;
}> = ({size, hair = 'short', shirt = C.cyan, hairColor = C.navy, headphones = false, shades = false, blink = false, mouth = 'smile', style}) => (
	<svg width={size} height={(size * 230) / 200} viewBox="0 0 200 230" style={{overflow: 'visible', display: 'block', ...style}}>
		{/* back hair */}
		{hair === 'long' ? <path d="M 52 90 Q 50 40 100 38 Q 150 40 148 90 L 156 168 L 44 168 Z" fill={hairColor} /> : null}
		{hair === 'hijab' ? <path d="M 42 100 Q 40 34 100 32 Q 160 34 158 100 L 166 176 Q 100 196 34 176 Z" fill={hairColor} /> : null}
		{/* body */}
		<path d="M 18 230 Q 22 168 70 156 L 130 156 Q 178 168 182 230 Z" fill={shirt} />
		<path d="M 70 156 Q 100 186 130 156" fill={rgba(C.navy, 0.18)} />
		{hair === 'hijab' ? (
			<path d="M 56 150 Q 100 196 144 150 L 150 178 Q 100 208 50 178 Z" fill={hairColor} />
		) : (
			<rect x={88} y={128} width={24} height={32} rx={10} fill={C.creamShade} />
		)}
		{/* head */}
		<circle cx={100} cy={92} r={44} fill={C.cream} />
		{hair !== 'hijab' ? (
			<>
				<circle cx={56} cy={96} r={9} fill={C.creamShade} />
				<circle cx={144} cy={96} r={9} fill={C.creamShade} />
			</>
		) : null}
		{/* hair styles */}
		{hair === 'short' ? <path d="M 56 88 Q 54 44 100 44 Q 148 44 146 86 Q 128 70 104 72 Q 78 64 56 88 Z" fill={hairColor} /> : null}
		{hair === 'curly'
			? [64, 82, 100, 118, 136, 74, 92, 110, 128].map((x, i) => <circle key={i} cx={x} cy={i < 5 ? 58 : 46} r={15} fill={hairColor} />)
			: null}
		{hair === 'long' ? <path d="M 56 92 Q 58 46 100 46 Q 142 46 144 92 Q 120 74 98 76 Q 76 78 56 92 Z" fill={hairColor} /> : null}
		{hair === 'cap' ? (
			<>
				<path d="M 56 80 Q 58 40 100 40 Q 142 40 144 80 Z" fill={C.gold} />
				<path d="M 96 78 L 168 78 Q 172 88 160 90 L 96 88 Z" fill={C.goldDeep} />
				<circle cx={100} cy={42} r={5} fill={C.goldDeep} />
			</>
		) : null}
		{hair === 'hijab' ? <path d="M 60 96 Q 58 52 100 50 Q 142 52 140 96 Q 142 70 100 66 Q 58 70 60 96 Z" fill={hairColor} /> : null}
		{/* face */}
		{shades ? (
			<g>
				<path d="M 64 86 L 136 86 L 134 94 Q 132 108 116 108 Q 104 108 102 96 L 98 96 Q 96 108 84 108 Q 68 108 66 94 Z" fill={C.navy} />
				<path d="M 72 92 L 82 92" stroke={C.cyan} strokeWidth={3} strokeLinecap="round" />
				<path d="M 108 92 L 118 92" stroke={C.cyan} strokeWidth={3} strokeLinecap="round" />
			</g>
		) : (
			<>
				<ellipse cx={84} cy={96} rx={5} ry={blink ? 1 : 6} fill={C.navy} />
				<ellipse cx={116} cy={96} rx={5} ry={blink ? 1 : 6} fill={C.navy} />
			</>
		)}
		{mouth === 'smile' ? <path d="M 86 114 Q 100 126 114 114" fill="none" stroke={C.navy} strokeWidth={4.5} strokeLinecap="round" /> : null}
		{mouth === 'open' ? <path d="M 88 112 Q 100 132 112 112 Z" fill={C.navy} /> : null}
		{mouth === 'wow' ? <ellipse cx={100} cy={118} rx={7} ry={9} fill={C.navy} /> : null}
		{headphones ? (
			<g>
				<path d="M 54 96 Q 52 36 100 36 Q 148 36 146 96" fill="none" stroke={C.navy} strokeWidth={10} strokeLinecap="round" />
				<rect x={42} y={82} width={20} height={36} rx={8} fill={C.gold} />
				<rect x={138} y={82} width={20} height={36} rx={8} fill={C.gold} />
			</g>
		) : null}
	</svg>
);

/** A row of small people — "الناس". */
export const Crowd: React.FC<{size: number; count?: number; progress?: number[]}> = ({size, count = 5, progress}) => {
	const looks: {hair: Hair; shirt: string; hairColor: string}[] = [
		{hair: 'short', shirt: C.gold, hairColor: C.navy},
		{hair: 'hijab', shirt: C.cyanDeep, hairColor: C.goldDeep},
		{hair: 'curly', shirt: C.cream, hairColor: C.navy},
		{hair: 'cap', shirt: C.panel4, hairColor: C.navy},
		{hair: 'long', shirt: C.gold, hairColor: C.slate},
		{hair: 'short', shirt: C.cyan, hairColor: C.goldDeep},
	];
	return (
		<div style={{display: 'flex', alignItems: 'flex-end'}}>
			{Array.from({length: count}).map((_, i) => {
				const p = progress ? progress[i] ?? 1 : 1;
				const l = looks[i % looks.length];
				return (
					<div key={i} style={{marginLeft: i ? -size * 0.18 : 0, opacity: p > 0.01 ? 1 : 0, transform: `translateY(${(1 - p) * size * 0.6}px) scale(${0.6 + 0.4 * p})`, transformOrigin: 'bottom center'}}>
						<Person size={size * (i % 2 ? 0.92 : 1)} {...l} mouth={i % 3 === 1 ? 'open' : 'smile'} />
					</div>
				);
			})}
		</div>
	);
};
