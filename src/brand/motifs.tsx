import React from 'react';
import {LogoMark} from './Logo';
import {C, rgba} from './tokens';

/** Gold crop-mark style bar (card corners). */
export const GoldBar: React.FC<{x: number; y: number; w: number; h?: number; progress?: number; fromRight?: boolean}> = ({
	x,
	y,
	w,
	h = 10,
	progress = 1,
	fromRight = false,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width: w,
			height: h,
			background: C.gold,
			transformOrigin: fromRight ? 'right center' : 'left center',
			transform: `scaleX(${progress})`,
		}}
	/>
);

/** Viewfinder corners (gold) around a rect — the card's crop marks reused as a camera frame. */
export const CornerBrackets: React.FC<{
	x: number;
	y: number;
	w: number;
	h: number;
	len?: number;
	stroke?: number;
	progress?: number;
	color?: string;
}> = ({x, y, w, h, len = 70, stroke = 7, progress = 1, color = C.gold}) => {
	const l = len * progress;
	const s = stroke;
	const corners: [number, number, number, number][] = [
		[x, y, 1, 1],
		[x + w, y, -1, 1],
		[x, y + h, 1, -1],
		[x + w, y + h, -1, -1],
	];
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
			{corners.map(([cx, cy, dx, dy], i) => (
				<path
					key={i}
					d={`M ${cx + dx * l} ${cy} L ${cx} ${cy} L ${cx} ${cy + dy * l}`}
					fill="none"
					stroke={color}
					strokeWidth={s}
					strokeLinecap="square"
					opacity={progress > 0.01 ? 1 : 0}
				/>
			))}
		</svg>
	);
};

/** Card-back geometry, normalised to the 85x55 mm card (from the PDF clip paths). */
export const CARD_RATIO = 155.98 / 240.73;
export const DARK_PANEL = [
	[0, 0],
	[0.409, 0],
	[0.493, 0.132],
	[0.385, 0.5],
	[0.493, 0.868],
	[0.409, 1],
	[0, 1],
] as const;
export const CYAN_SLIVER = [
	[0.4562, 0],
	[0.5021, 0.1137],
	[0.4672, 0.5034],
	[0.5021, 0.8932],
	[0.4562, 1],
] as const;
export const GOLD_WEDGE = [
	[0, 0.8845],
	[0.2441, 0.7664],
	[0.2903, 0.7664],
	[0, 0.9935],
] as const;

const poly = (pts: readonly (readonly [number, number])[], w: number, h: number) =>
	pts.map(([px, py]) => `${(px * w).toFixed(1)},${(py * h).toFixed(1)}`).join(' ');

/**
 * The business-card back as a live component: dark notched panel with the mark + gold wedge, cyan
 * zig-zag sliver, cream info panel (children are laid out inside the cream area).
 */
export const CardBack: React.FC<{
	width: number;
	children?: React.ReactNode;
	logo?: number; // 0..1 logo draw
	sliver?: number; // 0..1 sliver grow (top->bottom)
	style?: React.CSSProperties;
}> = ({width, children, logo = 1, sliver = 1, style}) => {
	const h = width * CARD_RATIO;
	return (
		<div
			style={{
				position: 'relative',
				width,
				height: h,
				background: C.cream,
				borderRadius: width * 0.018,
				overflow: 'hidden',
				boxShadow: `0 40px 90px ${rgba('#000000', 0.45)}, 0 0 0 2px ${rgba(C.cream, 0.08)}`,
				...style,
			}}
		>
			<svg width={width} height={h} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="cardPanel" x1="0.1" y1="0" x2="0.6" y2="1">
						<stop offset="0" stopColor={C.panel} />
						<stop offset="1" stopColor={C.navyDeep} />
					</linearGradient>
					<clipPath id="sliverGrow">
						<rect x={0} y={0} width={width} height={h * sliver} />
					</clipPath>
				</defs>
				<polygon points={poly(DARK_PANEL, width, h)} fill="url(#cardPanel)" />
				<polygon points={poly(GOLD_WEDGE, width, h)} fill={C.gold} />
				<polygon points={poly(CYAN_SLIVER, width, h)} fill={C.cyan} clipPath="url(#sliverGrow)" />
			</svg>
			<div style={{position: 'absolute', left: width * 0.075, top: h * 0.154}}>
				<LogoMark size={width * 0.2} ring={logo} check={Math.max(0, logo * 1.4 - 0.4)} tab={logo} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: width * 0.53,
					right: width * 0.05,
					top: 0,
					bottom: 0,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
				}}
			>
				{children}
			</div>
		</div>
	);
};

/**
 * Brand transition: a navy panel with the card's chevron edge + cyan sliver sweeps right-to-left
 * (Arabic reading direction). progress 0..1: 0 = off right, 0.5 = fully covering, 1 = off left.
 */
export const ChevronWipe: React.FC<{progress: number; color?: string}> = ({progress, color = C.panel}) => {
	if (progress <= 0 || progress >= 1) return null;
	const W = 1080;
	const H = 1920;
	const depth = 260; // chevron depth
	const span = W + depth * 2 + 120;
	const x = W + depth + 60 - progress * (span + W);
	const pts = [
		[x, 0],
		[x - depth, H / 2],
		[x, H],
		[x + W + depth, H],
		[x + W, H / 2],
		[x + W + depth, 0],
	];
	const sl = [
		[x - 26, 0],
		[x - depth - 26, H / 2],
		[x - 26, H],
		[x + 34, H],
		[x - depth + 34, H / 2],
		[x + 34, 0],
	];
	const gold = [
		[x + W * 0.55, H],
		[x + W * 0.55 + depth * 0.5, H * 0.75],
		[x + W * 0.55 + depth * 0.5 + 60, H * 0.75],
		[x + W * 0.55 + 60, H],
	];
	const toS = (p: number[][]) => p.map(([a, b]) => `${a},${b}`).join(' ');
	return (
		<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
			<polygon points={toS(sl)} fill={C.cyan} />
			<polygon points={toS(pts)} fill={color} />
			<polygon points={toS(gold)} fill={C.gold} opacity={0.9} />
		</svg>
	);
};
