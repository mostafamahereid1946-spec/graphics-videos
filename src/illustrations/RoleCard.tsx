import React from 'react';
import {C} from '../brand/tokens';

/** Role glyphs (100x100), drawn navy-on-cyan. */
export const RoleIcon: React.FC<{kind: 'editor' | 'motion' | 'captions' | 'sound'; size: number}> = ({kind, size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<circle cx={50} cy={50} r={50} fill={C.cyan} />
		<g fill={C.navy} stroke={C.navy} strokeLinejoin="round" strokeLinecap="round">
			{kind === 'editor' ? (
				<>
					<rect x={22} y={44} width={56} height={34} rx={5} stroke="none" />
					<g transform="rotate(-16 22 40)">
						<rect x={22} y={30} width={56} height={11} rx={3} stroke="none" />
					</g>
					<g stroke={C.cyan} strokeWidth={4}>
						<line x1={32} y1={44} x2={40} y2={52} />
						<line x1={46} y1={44} x2={54} y2={52} />
						<line x1={60} y1={44} x2={68} y2={52} />
					</g>
				</>
			) : kind === 'motion' ? (
				<>
					<path d="M 22 72 C 30 30, 58 30, 50 52 S 70 74, 80 30" fill="none" strokeWidth={6} />
					<rect x={16} y={66} width={12} height={12} rx={2} stroke="none" />
					<rect x={74} y={24} width={12} height={12} rx={2} stroke="none" />
					<circle cx={50} cy={52} r={6} stroke="none" fill={C.gold} />
				</>
			) : kind === 'captions' ? (
				<>
					<rect x={18} y={26} width={64} height={44} rx={10} stroke="none" />
					<path d="M 34 70 L 30 82 L 46 70 Z" stroke="none" />
					<rect x={28} y={38} width={44} height={7} rx={3.5} fill={C.cyan} stroke="none" />
					<rect x={28} y={51} width={28} height={7} rx={3.5} fill={C.gold} stroke="none" />
				</>
			) : (
				<>
					<path d="M 22 42 h 12 l 16 -14 v 44 l -16 -14 h -12 z" stroke="none" />
					<path d="M 60 38 q 8 12 0 24" fill="none" strokeWidth={6} />
					<path d="M 68 30 q 16 20 0 40" fill="none" strokeWidth={6} />
				</>
			)}
		</g>
	</svg>
);
