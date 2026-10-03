import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {F, SPR, sprAt} from '../motion';
import {Emo, type EmoName} from '../art/Emo';
import type {Word} from '../timeline';

export type KineticStyle = 'pop' | 'slam' | 'ghost' | 'rise';

type Props = {
	words: (Word & {emoji?: EmoName})[];
	frame: number;
	size: number;
	color?: string;
	emColor?: string;
	weight?: number;
	align?: 'center' | 'flex-start' | 'flex-end';
	lineHeight?: number;
	maxWidth?: number;
	variant?: KineticStyle;
	/** draw a highlight pill behind the word currently being spoken */
	activePill?: boolean;
	pillColor?: string;
	pillText?: string;
	/** seconds — words are shown this early (anticipation, default 0.04 s) */
	lead?: number;
	gap?: number;
	/** sticker-style background behind em words (e.g. white pill on the cyan hook screen) */
	emBg?: string;
	/** draw an animated bar under em words (colour) */
	emUnderline?: string;
	/** scale for the digits of `num` tokens (e.g. 2.4 -> huge Outfit numbers inside an Arabic line) */
	numScale?: number;
	style?: React.CSSProperties;
};

const isLatin = (w: Word) => w.brand || w.num || /^[A-Za-z0-9 –-]+$/.test(w.t);

/**
 * Word-synchronised kinetic typography (Arabic RTL). Every word animates in at its spoken start time
 * (from the voice timeline), em words switch to the accent colour, Latin tokens (COREVIA, numbers)
 * are isolated LTR runs in Outfit.
 */
export const KineticText: React.FC<Props> = ({
	words,
	frame,
	size,
	color = C.white,
	emColor = C.gold,
	weight = 800,
	align = 'center',
	lineHeight = 1.18,
	maxWidth = 920,
	variant = 'pop',
	activePill = false,
	pillColor = C.cyan,
	pillText = C.navy,
	lead = 0.04,
	gap,
	emBg,
	emUnderline,
	numScale = 1,
	style,
}) => {
	const t = frame / FPS;
	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				direction: 'rtl',
				justifyContent: align,
				alignItems: 'baseline',
				columnGap: gap ?? size * 0.26,
				rowGap: size * 0.08,
				maxWidth,
				fontFamily: FONT.ar,
				fontWeight: weight,
				fontSize: size,
				lineHeight,
				color,
				...style,
			}}
		>
			{words.map((w, i) => {
				const at = w.start - lead;
				const s = sprAt(frame, at, variant === 'slam' ? SPR.heavy : SPR.pop);
				const shown = frame >= F(at);
				let opacity = shown ? Math.min(1, s * 2.2) : 0;
				let transform = '';
				let filter: string | undefined;
				if (variant === 'pop') {
					transform = `translateY(${(1 - s) * size * 0.35}px) scale(${0.72 + 0.28 * s})`;
				} else if (variant === 'slam') {
					transform = `scale(${interpolate(s, [0, 1], [1.7, 1])}) rotate(${(1 - s) * (i % 2 ? 4 : -4)}deg)`;
				} else if (variant === 'ghost') {
					// reference-reel style: faint ghost first, then solid on the spoken word
					const solid = s;
					opacity = 0.16 + 0.84 * solid;
					filter = solid < 0.98 ? `blur(${(1 - solid) * 7}px)` : undefined;
					transform = `scale(${0.94 + 0.06 * solid})`;
				} else if (variant === 'rise') {
					transform = `translateY(${(1 - s) * size * 0.9}px)`;
				}
				const active = activePill && t >= w.start - 0.02 && t < w.end + 0.06;
				const pillIn = activePill ? sprAt(frame, w.start - 0.02, SPR.snappy) : 0;
				const latin = isLatin(w);
				const wordColor = active ? (w.em ? C.navy : pillText) : w.brand ? C.cyan : w.em ? emColor : color;
				const node = (
					<span
						key={i}
						style={{
							position: 'relative',
							display: 'inline-block',
							opacity,
							transform,
							filter,
							color: wordColor,
							fontFamily: latin ? FONT.display : FONT.ar,
							fontWeight: latin ? Math.min(weight, 800) : weight,
							direction: latin && !/[\u0600-\u06FF]/.test(w.t) ? 'ltr' : 'rtl',
							unicodeBidi: 'isolate',
							padding: activePill ? `0 ${size * 0.16}px` : undefined,
							whiteSpace: 'nowrap',
						}}
					>
						{w.em && emUnderline ? (
							<span
								style={{
									position: 'absolute',
									left: 0,
									right: 0,
									bottom: -size * 0.12,
									height: Math.max(8, size * 0.1),
									borderRadius: size * 0.05,
									background: emUnderline,
									transformOrigin: 'right center',
									transform: `scaleX(${Math.min(1, s * 1.15)})`,
								}}
							/>
						) : null}
						{active ? (
							<span
								style={{
									position: 'absolute',
									inset: `${size * 0.02}px 0 ${size * -0.04}px 0`,
									borderRadius: size * 0.22,
									background: w.em ? C.gold : pillColor,
									transform: `scale(${0.6 + 0.4 * pillIn})`,
									boxShadow: `0 8px 24px ${rgba(w.em ? C.gold : pillColor, 0.35)}`,
									zIndex: -1,
								}}
							/>
						) : null}
						<span style={{position: 'relative', display: 'inline-block'}}>
							{w.em && emBg && !activePill ? (
								<span
									style={{
										position: 'absolute',
										inset: `${size * 0.04}px ${-size * 0.14}px ${size * -0.06}px ${-size * 0.14}px`,
										borderRadius: size * 0.16,
										background: emBg,
										transform: `rotate(-2.5deg) scale(${0.5 + 0.5 * s})`,
										zIndex: -1,
									}}
								/>
							) : null}
							{w.num && numScale !== 1
								? w.t.split(/(\d+)/).map((part, k) =>
										/\d/.test(part) ? (
											<span
												key={k}
												style={{
														fontFamily: FONT.display,
														fontWeight: 800,
														fontSize: size * numScale,
														lineHeight: 0.9,
														color: C.cyan,
														letterSpacing: '-0.02em',
												}}
											>
												{part}
											</span>
										) : (
											<span key={k}>{part}</span>
										),
									)
								: w.t}
						</span>
						{w.emoji ? (
							<span
								style={{
									display: 'inline-block',
									verticalAlign: 'middle',
									marginInlineStart: size * 0.12,
									transform: `translateY(${-size * 0.06}px) scale(${sprAt(frame, w.start + 0.07, SPR.bouncy)}) rotate(${Math.sin(t * 3 + i) * 8}deg)`,
								}}
							>
								<Emo name={w.emoji} size={size * 0.95} />
							</span>
						) : null}
					</span>
				);
				return w.lineBreak ? (
					<React.Fragment key={i}>
						<span style={{flexBasis: '100%', height: 0}} />
						{node}
					</React.Fragment>
				) : (
					node
				);
			})}
		</div>
	);
};
