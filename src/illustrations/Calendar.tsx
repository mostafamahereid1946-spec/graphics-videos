import React from 'react';
import {C, FONT, rgba} from '../brand/tokens';
import {EASE, SPR, sprAt, tween} from '../motion';

const DAYS = ['السبت', 'الحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة'];
const GAP = 10;

/** Month grid (Saturday-first, RTL) that fills with reels on the voice — 2-3 a week, 10-12 a month. */
export const Calendar: React.FC<{frame: number; inAt: number; days: number[]; pops: number[]; width?: number; row?: number; hideTiles?: boolean}> = ({
	frame,
	inAt,
	days,
	pops,
	width = 880,
	row = 86,
	hideTiles = false,
}) => {
	const W = width;
	const CELL = (W - GAP * 6) / 7;
	const ROW = row;
	const tile = Math.min(CELL, ROW) * 0.62;
	return (
	<div style={{width: W, direction: 'rtl'}}>
		<div style={{display: 'flex', gap: GAP, marginBottom: 12}}>
			{DAYS.map((d, i) => (
				<div
					key={d}
					style={{
						width: CELL,
						textAlign: 'center',
						fontFamily: FONT.ar,
						fontWeight: 700,
						fontSize: 28,
						color: C.gold,
						opacity: tween(frame, inAt + i * 0.03, inAt + 0.2 + i * 0.03),
					}}
				>
					{d.replace('ال', '')}
				</div>
			))}
		</div>
		<div style={{display: 'grid', gridTemplateColumns: `repeat(7, ${CELL}px)`, gap: GAP}}>
			{Array.from({length: 28}).map((_, k) => {
				const day = k + 1;
				const row = Math.floor(k / 7);
				const col = k % 7;
				const cellIn = sprAt(frame, inAt + row * 0.05 + col * 0.02, SPR.snappy);
				const idx = days.indexOf(day);
				const reel = idx >= 0 ? sprAt(frame, pops[idx], SPR.bouncy) : 0;
				const glow = idx >= 0 ? tween(frame, pops[idx], pops[idx] + 0.5, 1, 0, EASE.out) : 0;
				return (
					<div
						key={day}
						style={{
							position: 'relative',
							height: ROW,
							borderRadius: 16,
							background: reel > 0.02 ? rgba(C.cyan, 0.1 + 0.08 * glow) : C.panel2,
							border: `2px solid ${rgba(C.cyan, reel > 0.02 ? 0.45 : 0.1)}`,
							opacity: cellIn,
							transform: `translateY(${(1 - cellIn) * 24}px)`,
						}}
					>
						<div style={{position: 'absolute', top: 6, right: 10, fontFamily: FONT.mono, fontSize: 28, color: rgba(C.cream, 0.55), direction: 'ltr'}}>{day}</div>
						{idx >= 0 && !hideTiles ? (
							<div
								style={{
									position: 'absolute',
									left: 12,
									bottom: 10,
									width: tile,
									height: tile,
									borderRadius: 14,
									background: C.cyan,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transform: `scale(${reel}) rotate(${(1 - reel) * -30}deg)`,
									boxShadow: `0 0 ${24 * glow}px ${rgba(C.cyan, 0.8)}`,
								}}
							>
								<svg width={tile * 0.44} height={tile * 0.44} viewBox="0 0 22 22">
									<path d="M 6 3 L 19 11 L 6 19 Z" fill={C.navy} />
								</svg>
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	</div>
	);
};
