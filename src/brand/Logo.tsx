import React from 'react';
import {C, FONT, rgba} from './tokens';

/**
 * COREVIA mark, rebuilt from the card's vector data (200-unit box):
 *  - cyan C: arc centre (96.36, 100), r = 74, from -45.7deg to +45.7deg, stroke 22, square caps
 *  - gold check: M67 84 L100 121 L133 84, stroke 16
 *  - gold tab:   M138 84 L151 84, stroke 10
 */
export const C_ARC = 'M 148 47 A 74 74 0 1 0 148 153';
export const CHECK = 'M 67 84 L 100 121 L 133 84';
export const TAB = 'M 138 84 L 151 84';

type MarkProps = {
	size: number;
	/** 0..1 draw-on progress of the C ring */
	ring?: number;
	/** 0..1 draw-on progress of the check */
	check?: number;
	/** 0..1 slide-in of the tab */
	tab?: number;
	ringColor?: string;
	checkColor?: string;
	/** 0..1 cyan glow */
	glow?: number;
	style?: React.CSSProperties;
};

export const LogoMark: React.FC<MarkProps> = ({
	size,
	ring = 1,
	check = 1,
	tab = 1,
	ringColor = C.cyan,
	checkColor = C.gold,
	glow = 0,
	style,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 200 200"
		style={{
			overflow: 'visible',
			filter: glow > 0 ? `drop-shadow(0 0 ${22 * glow}px ${rgba(C.cyan, 0.55 * glow)})` : undefined,
			...style,
		}}
	>
		<path
			d={C_ARC}
			fill="none"
			stroke={ringColor}
			strokeWidth={22}
			strokeLinecap="square"
			pathLength={1}
			strokeDasharray="1 1"
			strokeDashoffset={1 - ring}
			opacity={ring > 0.005 ? 1 : 0}
		/>
		<path
			d={CHECK}
			fill="none"
			stroke={checkColor}
			strokeWidth={16}
			strokeLinecap="square"
			strokeLinejoin="miter"
			pathLength={1}
			strokeDasharray="1 1"
			strokeDashoffset={1 - check}
			opacity={check > 0.005 ? 1 : 0}
		/>
		<path
			d={TAB}
			stroke={checkColor}
			strokeWidth={10}
			strokeLinecap="square"
			opacity={tab > 0.01 ? Math.min(1, tab * 1.5) : 0}
			transform={`translate(${(1 - tab) * -16} 0)`}
		/>
	</svg>
);

/** "COREVIA" wordmark in Outfit Bold with optional per-letter rise. */
export const Wordmark: React.FC<{
	size: number;
	/** 0..1 overall reveal; letters stagger across it */
	progress?: number;
	color?: string;
	style?: React.CSSProperties;
}> = ({size, progress = 1, color = C.cyan, style}) => {
	const letters = 'COREVIA'.split('');
	return (
		<div
			style={{
				display: 'flex',
				fontFamily: FONT.display,
				fontWeight: 700,
				fontSize: size,
				lineHeight: 1,
				letterSpacing: '0.01em',
				color,
				direction: 'ltr',
				...style,
			}}
		>
			{letters.map((ch, i) => {
				const local = Math.max(0, Math.min(1, progress * 1.6 - i * 0.09));
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: local,
							transform: `translateY(${(1 - local) * size * 0.45}px)`,
						}}
					>
						{ch}
					</span>
				);
			})}
		</div>
	);
};

/** "IT SOLUTIONS ENGINEERING" with a mono type-on. */
export const Tagline: React.FC<{size: number; progress?: number; color?: string; text?: string}> = ({
	size,
	progress = 1,
	color = C.white,
	text = 'IT SOLUTIONS ENGINEERING',
}) => {
	const n = Math.round(text.length * Math.max(0, Math.min(1, progress)));
	return (
		<div
			style={{
				fontFamily: FONT.mono,
				fontWeight: 500,
				fontSize: size,
				letterSpacing: '0.24em',
				color,
				direction: 'ltr',
				whiteSpace: 'pre',
				lineHeight: 1,
			}}
		>
			<span>{text.slice(0, n)}</span>
			<span style={{opacity: 0}}>{text.slice(n)}</span>
		</div>
	);
};
