import React from 'react';
import {C} from '../brand/tokens';

/**
 * Custom COREVIA emoji set (drawn, not system emoji — on-brand and safe to render anywhere).
 * All in a 100x100 box.
 */
export type EmojiKind = 'cface' | 'fire' | 'heart' | 'stars' | 'rocket' | 'bolt' | 'clapper' | 'shades';

const Face: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<>
		<circle cx={50} cy={50} r={44} fill={C.cream} />
		<circle cx={50} cy={50} r={44} fill="none" stroke={C.creamShade} strokeWidth={3} />
		{children}
	</>
);

export const Emoji: React.FC<{kind: EmojiKind; size: number; style?: React.CSSProperties}> = ({kind, size, style}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible', ...style}}>
		{kind === 'cface' ? (
			<>
				{/* brand smiley: the C-ring is the face, the gold check is the smile */}
				<circle cx={48} cy={50} r={34} fill={C.cream} />
				<path d="M 74 24 A 37 37 0 1 0 74 76" fill="none" stroke={C.cyan} strokeWidth={11} strokeLinecap="square" />
				<ellipse cx={38} cy={42} rx={5} ry={7} fill={C.navy} />
				<ellipse cx={58} cy={42} rx={5} ry={7} fill={C.navy} />
				<path d="M 34 58 L 46 70 L 64 54" fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="square" />
				<path d="M 68 54 L 74 54" stroke={C.gold} strokeWidth={5} strokeLinecap="square" />
			</>
		) : kind === 'fire' ? (
			<>
				<path d="M 50 6 C 62 26, 84 36, 80 64 C 77 84, 62 94, 50 94 C 34 94, 20 82, 20 64 C 20 46, 34 38, 36 22 C 44 32, 46 38, 46 44 C 52 34, 52 20, 50 6 Z" fill={C.gold} />
				<path d="M 50 42 C 58 54, 68 60, 66 74 C 64 86, 56 90, 50 90 C 42 90, 34 84, 34 74 C 34 64, 42 60, 44 50 C 48 56, 50 50, 50 42 Z" fill={C.cyan} />
				<path d="M 50 66 C 54 72, 58 76, 56 82 C 54 87, 46 87, 44 82 C 42 76, 48 72, 50 66 Z" fill={C.cream} />
			</>
		) : kind === 'heart' ? (
			<>
				<path d="M 50 88 C 20 68, 6 52, 8 34 C 10 18, 24 10, 36 12 C 44 13, 48 18, 50 22 C 52 18, 56 13, 64 12 C 76 10, 90 18, 92 34 C 94 52, 80 68, 50 88 Z" fill={C.cyan} />
				<path d="M 32 44 L 46 58 L 70 36" fill="none" stroke={C.cream} strokeWidth={9} strokeLinecap="square" />
			</>
		) : kind === 'stars' ? (
			<Face>
				{[34, 66].map((x) => (
					<path
						key={x}
						transform={`translate(${x} 42)`}
						d="M 0 -14 L 4 -4 L 14 -4 L 6 3 L 9 13 L 0 7 L -9 13 L -6 3 L -14 -4 L -4 -4 Z"
						fill={C.gold}
					/>
				))}
				<path d="M 30 62 Q 50 84 70 62 Z" fill={C.navy} />
				<path d="M 40 70 Q 50 78 60 70 Q 50 74 40 70 Z" fill={C.cyan} />
			</Face>
		) : kind === 'rocket' ? (
			<g transform="rotate(45 50 50)">
				<path d="M 42 76 L 50 96 L 58 76 Z" fill={C.gold} />
				<path d="M 50 4 C 66 18, 68 44, 64 76 L 36 76 C 32 44, 34 18, 50 4 Z" fill={C.cream} />
				<circle cx={50} cy={38} r={9} fill={C.cyan} stroke={C.navy} strokeWidth={3} />
				<path d="M 36 56 L 22 74 L 36 72 Z M 64 56 L 78 74 L 64 72 Z" fill={C.navy} />
			</g>
		) : kind === 'bolt' ? (
			<path d="M 58 4 L 18 56 L 46 56 L 38 96 L 82 40 L 54 40 Z" fill={C.gold} stroke={C.cyan} strokeWidth={4} strokeLinejoin="round" />
		) : kind === 'clapper' ? (
			<>
				<rect x={12} y={40} width={76} height={48} rx={6} fill={C.navy} />
				<g transform="rotate(-14 12 34)">
					<rect x={12} y={22} width={76} height={16} rx={4} fill={C.cream} />
					{[0, 1, 2, 3].map((i) => (
						<path key={i} d={`M ${20 + i * 18} 22 l 10 0 l -8 16 l -10 0 Z`} fill={C.navy} />
					))}
				</g>
				<rect x={22} y={52} width={56} height={6} rx={3} fill={C.gold} />
				<rect x={22} y={66} width={36} height={6} rx={3} fill={C.cyan} />
			</>
		) : (
			<Face>
				<path d="M 18 36 L 82 36 L 80 44 Q 78 56 64 56 Q 54 56 52 44 L 48 44 Q 46 56 36 56 Q 22 56 20 44 Z" fill={C.navy} />
				<path d="M 26 42 L 34 42" stroke={C.cyan} strokeWidth={4} strokeLinecap="round" />
				<path d="M 60 42 L 68 42" stroke={C.cyan} strokeWidth={4} strokeLinecap="round" />
				<path d="M 36 70 Q 52 80 66 66" fill="none" stroke={C.navy} strokeWidth={6} strokeLinecap="round" />
			</Face>
		)}
	</svg>
);
