import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {KineticText} from '../components/KineticText';
import {EASE, SPR, sprAt, tween} from '../motion';
import {ev, evs, line, wordAt} from '../timeline';
import {withEmoji} from '../timeline/emoji';
import {Emo} from '../art/Emo';
import {Reel, type ReelKind} from '../art/Reel';
import {Calendar} from '../illustrations/Calendar';

const KINDS: ReelKind[] = ['cafe', 'fashion', 'burger', 'beauty', 'gym', 'shop'];
const RW = 170;
const RH = (RW * 320) / 180;
const CAL = {x: 60, y: 760, w: 960, row: 140};
const CELL = (CAL.w - 60) / 7;

/** Grid slot (4 x 3) for reel i while the voice counts "10… 12". */
const slot = (i: number) => {
	const col = i % 4;
	const row = Math.floor(i / 4);
	return {x: 110 + col * 230 + (row % 2) * 20, y: 600 + row * (RH + 26)};
};

/** Calendar cell centre for day d (Saturday-first, RTL). */
const cell = (d: number) => {
	const k = d - 1;
	const col = k % 7;
	const row = Math.floor(k / 7);
	return {x: CAL.x + CAL.w - (col + 0.5) * CELL - col * 10, y: CAL.y + 62 + row * (CAL.row + 10) + CAL.row / 2};
};

/**
 * "من 10 لـ 12 ريل كل شهر… يعني محتوى ثابت كل أسبوع": twelve drawn reels rain into a grid as the numbers
 * are spoken, then each one flies into its day of a big month calendar (2-3 a week).
 */
export const Consistency: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const calIn = ev('calendarIn');
	const days = evs('calendarDays');
	const pops = evs('calendarPops');
	const n10 = ev('num10');
	const n12 = ev('num12');
	const c1 = withEmoji('c1').map((w, i) => (i === 3 ? {...w, lineBreak: true} : w));
	const lift = tween(frame, calIn - 0.15, calIn + 0.3, 0, 1, EASE.inOut);

	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 168, right: 70, fontFamily: FONT.mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.26em', color: C.gold, direction: 'ltr'}}>MONTHLY PLAN</div>
			<div style={{position: 'absolute', top: 205, left: 60, right: 66, display: 'flex', justifyContent: 'flex-end', transformOrigin: 'right top', transform: `scale(${1 - 0.3 * lift})`}}>
				<KineticText words={c1} frame={frame} size={104} weight={900} numScale={2.0} align="flex-start" emColor={C.gold} lineHeight={1.12} variant="slam" />
			</div>
			<div style={{position: 'absolute', top: 540, left: 60, right: 66, display: 'flex', justifyContent: 'flex-end', opacity: tween(frame, calIn - 0.1, calIn + 0.12)}}>
				<KineticText words={withEmoji('c2')} frame={frame} size={54} weight={900} align="flex-start" emColor={C.gold} maxWidth={980} />
			</div>

			{/* the month */}
			<div style={{position: 'absolute', left: CAL.x, top: CAL.y, opacity: tween(frame, calIn - 0.1, calIn + 0.2), transform: `translateY(${(1 - tween(frame, calIn - 0.1, calIn + 0.35, 0, 1, EASE.out)) * 80}px)`}}>
				<Calendar frame={frame} inAt={calIn} days={days} pops={pops} width={CAL.w} row={CAL.row} hideTiles />
			</div>

			{/* twelve reels: rain in on "10" / "12", then fly into their days */}
			{Array.from({length: 12}).map((_, i) => {
				const at = i < 10 ? n10 - 0.05 + i * 0.045 : n12 + (i - 10) * 0.08;
				const drop = sprAt(frame, at, SPR.pop);
				if (drop < 0.005) return null;
				const s = slot(i);
				const target = cell(days[i]);
				const fly = tween(frame, pops[i] - 0.22, pops[i], 0, 1, EASE.inOut);
				const land = sprAt(frame, pops[i], SPR.bouncy);
				const scale = interpolate(fly, [0, 1], [1, 0.42]);
				const x = interpolate(fly, [0, 1], [s.x, target.x - RW / 2]);
				const y = interpolate(fly, [0, 1], [s.y + (1 - drop) * -900, target.y - RH / 2]);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							transform: `scale(${scale * (fly >= 1 ? 0.9 + 0.1 * land : 1)}) rotate(${(1 - drop) * (i % 2 ? 25 : -25) + (fly < 1 ? Math.sin(t * 3 + i) * 3 : 0)}deg)`,
							filter: `drop-shadow(0 16px 26px ${rgba('#000000', 0.4)})`,
						}}
					>
						<Reel w={RW} kind={KINDS[i % KINDS.length]} t={t + i} play={1} id={`cons${i}`} />
					</div>
				);
			})}

			<div style={{position: 'absolute', left: 90, top: 1480, transform: `scale(${sprAt(frame, wordAt('c2', 2), SPR.bouncy)}) rotate(-8deg)`}}>
				<Emo name="check" size={200} />
			</div>
			<div style={{position: 'absolute', left: 790, top: 1470, transform: `scale(${sprAt(frame, wordAt('c2', 4), SPR.bouncy)}) rotate(8deg)`}}>
				<Emo name="calendar" size={210} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1540, display: 'flex', justifyContent: 'center', opacity: tween(frame, line('c2').end - 0.3, line('c2').end)}}>
				<div style={{padding: '14px 34px', borderRadius: 40, background: C.cyan, color: C.navy, fontFamily: FONT.ar, fontWeight: 900, fontSize: 52, direction: 'rtl'}}><span style={{direction: 'ltr', unicodeBidi: 'isolate', fontFamily: FONT.display}}>2–3</span> ريلز كل أسبوع</div>
			</div>
		</AbsoluteFill>
	);
};
