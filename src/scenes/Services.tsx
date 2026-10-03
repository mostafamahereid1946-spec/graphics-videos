import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CornerBrackets} from '../brand/motifs';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {KineticText} from '../components/KineticText';
import {EASE, SPR, levels, sprAt, tween} from '../motion';
import {evs, line, scene} from '../timeline';
import {withEmoji} from '../timeline/emoji';
import {Emo, type EmoName} from '../art/Emo';
import {FilmStrip, Laptop, Mic, Scissors, Speaker} from '../art/Props';
import {CaptionPhone} from '../illustrations/CaptionPhone';
import {Emoji} from '../illustrations/Emojis';
import {MotionBoard} from '../illustrations/MotionBoard';

const LABELS = ['VIDEO EDITING', 'MOTION GRAPHICS', 'DYNAMIC CAPTIONS', 'CUSTOM EMOJIS', 'SOUND EFFECTS'];
const IDS = ['r1', 'r2', 'r3', 'r4', 'r5'];
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');

/** A 3D emoji prop that pops in at `at` and floats. */
const Prop: React.FC<{name: EmoName; x: number; y: number; size: number; at: number; frame: number; rot?: number}> = ({name, x, y, size, at, frame, rot = 0}) => {
	const t = frame / FPS;
	const p = sprAt(frame, at, SPR.bouncy);
	return (
		<div style={{position: 'absolute', left: x - size / 2, top: y - size / 2 + Math.sin(t * 2.6 + x) * 10, opacity: p > 0.01 ? 1 : 0, transform: `scale(${p}) rotate(${rot + Math.sin(t * 2 + y) * 7}deg)`}}>
			<Emo name={name} size={size} />
		</div>
	);
};

const Sticker: React.FC<{text: string; x: number; y: number; size: number; rot: number; p: number; fill?: string}> = ({text, x, y, size, rot, p, fill = C.gold}) => (
	<svg width={size * 4} height={size * 1.6} style={{position: 'absolute', left: x - size * 2, top: y - size * 0.8, overflow: 'visible', opacity: p > 0.01 ? 1 : 0, transform: `scale(${p}) rotate(${rot}deg)`}}>
		<text x={size * 2} y={size * 1.15} textAnchor="middle" direction="rtl" fontFamily="Alexandria" fontWeight={900} fontSize={size} fill={fill} stroke={C.navy} strokeWidth={size * 0.17} strokeLinejoin="round" paintOrder="stroke">
			{text}
		</text>
	</svg>
);

/** Laptop screen content (520 x 300 units): live preview + timeline, split on the cut. */
const EditScreen: React.FC<{t: number; cut: number}> = ({t, cut}) => (
	<g>
		<rect width={520} height={300} fill={C.navyDeep} />
		<rect x={120} y={14} width={280} height={150} rx={6} fill={C.panel3} />
		<circle cx={200 + Math.sin(t * 2.5) * 50} cy={88} r={34} fill={C.cyan} />
		<rect x={262} y={64} width={70 + 50 * Math.abs(Math.sin(t * 2))} height={18} rx={9} fill={C.gold} />
		<rect x={262} y={94} width={100} height={12} rx={6} fill={rgba(C.cream, 0.6)} />
		{[0, 1, 2].map((r) =>
			[0, 1, 2, 3].map((c) => {
				const x = 18 + c * 124 + (r % 2) * 24;
				return <rect key={`${r}${c}`} x={x + (x > 250 ? cut * 12 : 0)} y={182 + r * 36} width={104 - r * 8} height={26} rx={6} fill={[C.gold, C.cyan, C.cream][r]} opacity={0.88} />;
			}),
		)}
		<rect x={252} y={174} width={4} height={122} fill={C.gold} opacity={cut} />
		<rect x={30 + Math.min(1, t / 0.9) * 222} y={172} width={5} height={124} fill={C.white} />
	</g>
);

/**
 * Services roll-call on the cyan page (the reference's teal sequence): each service the voice names gets a
 * big drawn scene + matching 3D emojis; a navy viewfinder + REC timecode frame the whole run.
 */
export const Services: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const sc = scene('services');
	const starts = evs('services');
	const accents = evs('serviceAccent');
	const idx = Math.max(0, starts.filter((s) => t >= s).length - 1);
	const frameIn = sprAt(frame, sc.start, SPR.snappy);
	const tc = Math.max(0, t - sc.start);
	const lv = levels(frame);

	const stage = (i: number, node: React.ReactNode, enter: (p: number) => string) => {
		const s = starts[i];
		const e = i < 4 ? starts[i + 1] : sc.end;
		if (t < s - 0.02 || t > e + 0.05) return null;
		const p = sprAt(frame, s, i === 1 || i === 4 ? SPR.bouncy : SPR.pop);
		const out = i < 4 ? tween(frame, e - 0.16, e + 0.02, 0, 1, EASE.in) : 0;
		return (
			<AbsoluteFill key={i} style={{opacity: (p > 0.001 ? 1 : 0) * (1 - out), transform: `${enter(p)} translateX(${out * 300}px) scale(${1 - out * 0.15})`}}>
				{node}
			</AbsoluteFill>
		);
	};
	const burst = (k: number) => Math.min(1, sprAt(frame, accents[3] - 0.15 + k * 0.05, SPR.pop));

	return (
		<AbsoluteFill>
			<CornerBrackets x={60} y={150} w={960} h={1600} len={110} stroke={10} progress={frameIn} color={C.navy} />
			<div style={{position: 'absolute', left: 96, top: 176, display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT.mono, fontWeight: 500, fontSize: 30, color: C.navy, direction: 'ltr', opacity: frameIn}}>
				<div style={{width: 22, height: 22, borderRadius: 11, background: C.navy, opacity: Math.floor(t * 2) % 2 ? 0.25 : 1}} />
				<span>REC</span>
				<span>{`00:00:${pad(tc)}:${pad((tc % 1) * 30)}`}</span>
			</div>
			<div style={{position: 'absolute', right: 96, top: 176, fontFamily: FONT.mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.18em', color: C.navy, direction: 'ltr', opacity: frameIn}}>{`0${idx + 1} / 05`}</div>

			{/* headline with emojis + label */}
			<div style={{position: 'absolute', top: 236, left: 80, right: 84, display: 'flex', justifyContent: 'flex-end'}}>
				{IDS.map((id, i) => {
					if (i !== idx) return null;
					const out = i < 4 ? tween(frame, starts[i + 1] - 0.14, starts[i + 1], 0, 1, EASE.in) : 0;
					return (
						<div key={id} style={{opacity: 1 - out, transform: `translateY(${-out * 40}px)`}}>
							<KineticText words={withEmoji(id)} frame={frame} size={line(id).words.length > 2 ? 82 : 104} weight={900} align="flex-start" color={C.navy} emColor={C.white} emBg={C.navy} />
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 400, right: 96, fontFamily: FONT.mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.24em', color: rgba(C.navy, 0.8), direction: 'ltr'}}>
				{LABELS[idx].split('').map((ch, k) => (
					<span key={k} style={{opacity: tween(frame, starts[idx] + 0.1 + k * 0.018, starts[idx] + 0.14 + k * 0.018)}}>
						{ch}
					</span>
				))}
			</div>

			{/* 1 — editing: laptop + film strip snipped on "احترافي" */}
			{stage(
				0,
				<>
					<div style={{position: 'absolute', left: 70, top: 500, filter: `drop-shadow(0 30px 50px ${rgba(C.navy, 0.45)})`}}>
						<Laptop w={940} id="svcLaptop">
							<EditScreen t={Math.max(0, t - starts[0])} cut={tween(frame, accents[0] - 0.02, accents[0] + 0.15)} />
						</Laptop>
					</div>
					<div style={{position: 'absolute', left: 70, top: 1250}}>
						<FilmStrip w={940} cut={tween(frame, accents[0] - 0.02, accents[0] + 0.25, 0, 1, EASE.out)} t={t} />
					</div>
					<div style={{position: 'absolute', left: 540 - 160, top: 1160, transform: `rotate(90deg) translateX(${-tween(frame, accents[0] - 0.4, accents[0], 140, 0, EASE.out)}px)`}}>
						<Scissors w={320} open={t < accents[0] ? 0.5 + 0.5 * Math.sin(t * 22) : tween(frame, accents[0], accents[0] + 0.1, 0.9, 0.05)} />
					</div>
					<Prop name="clapper" x={900} y={520} size={170} at={starts[0] + 0.15} frame={frame} rot={12} />
					<Prop name="movie_camera" x={180} y={1620} size={170} at={starts[0] + 0.3} frame={frame} rot={-8} />
				</>,
				(p) => `perspective(1600px) translateY(${(1 - p) * 500}px) rotateX(${(1 - p) * 25}deg)`,
			)}

			{/* 2 — motion graphics: artboard + design emojis */}
			{stage(
				1,
				<>
					<div style={{position: 'absolute', left: 60, top: 520, transform: 'scale(1.116)', transformOrigin: 'top left', filter: `drop-shadow(0 30px 50px ${rgba(C.navy, 0.45)})`}}>
						<MotionBoard frame={frame} drawAt={accents[1] - 0.25} />
					</div>
					<Prop name="palette" x={230} y={1420} size={230} at={starts[1] + 0.2} frame={frame} rot={-10} />
					<Prop name="brush" x={560} y={1480} size={190} at={starts[1] + 0.32} frame={frame} rot={20} />
					<Prop name="sparkles" x={860} y={1400} size={200} at={starts[1] + 0.44} frame={frame} />
				</>,
				(p) => `translateY(${(1 - p) * -380}px) rotate(${(1 - p) * -12}deg)`,
			)}

			{/* 3 — captions: big phone with live captions */}
			{stage(
				2,
				<>
					<div style={{position: 'absolute', left: 540 - 243, top: 490, transform: 'scale(1.5)', transformOrigin: 'top left', filter: `drop-shadow(0 30px 50px ${rgba(C.navy, 0.45)})`}}>
						<CaptionPhone frame={frame} startAt={starts[2]} />
					</div>
					<Prop name="speech" x={170} y={760} size={200} at={starts[2] + 0.2} frame={frame} rot={-8} />
					<Prop name="speech" x={910} y={1060} size={170} at={starts[2] + 0.42} frame={frame} rot={10} />
					<Prop name="writing" x={180} y={1400} size={190} at={starts[2] + 0.64} frame={frame} rot={-6} />
				</>,
				(p) => `translateX(${(1 - p) * -900}px) rotate(${(1 - p) * 14}deg)`,
			)}

			{/* 4 — custom emojis: full-page burst */}
			{stage(
				3,
				<>
					{(
						[
							['fire', 230, 660, 200],
							['star_struck', 850, 640, 210],
							['hundred', 180, 1080, 180],
							['heart', 900, 1060, 190],
							['party', 250, 1500, 210],
							['crown', 830, 1480, 190],
							['thumbs_up', 540, 1610, 170],
							['rocket', 560, 610, 150],
						] as [EmoName, number, number, number][]
					).map(([name, x, y, s], k) => (
						<Prop key={name} name={name} x={540 + (x - 540) * burst(k)} y={1060 + (y - 1060) * burst(k)} size={s} at={accents[3] - 0.15 + k * 0.05} frame={frame} />
					))}
					<div style={{position: 'absolute', left: 540 - 190, top: 1060 - 190, transform: `scale(${sprAt(frame, starts[3] + 0.05, SPR.bouncy)})`}}>
						<Emo name="heart_eyes" size={380} />
					</div>
					<div style={{position: 'absolute', left: 760, top: 1250, transform: `scale(${sprAt(frame, accents[3] + 0.2, SPR.bouncy)}) rotate(12deg)`}}>
						<Emoji kind="cface" size={170} />
					</div>
				</>,
				(p) => `scale(${0.4 + 0.6 * p})`,
			)}

			{/* 5 — sound effects: speaker + mic + EQ + stickers */}
			{stage(
				4,
				<>
					<div style={{position: 'absolute', left: 90, top: 560}}>
						<Speaker w={360} t={t} pulse={lv[1]} />
					</div>
					<div style={{position: 'absolute', left: 700, top: 760}}>
						<Mic w={220} />
					</div>
					<Prop name="headphone" x={790} y={600} size={230} at={starts[4] + 0.2} frame={frame} rot={8} />
					<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
						{Array.from({length: 22}).map((_, i) => {
							const pos = (i / 21) * (lv.length - 1);
							const lo = Math.floor(pos);
							const v = lv[lo] * (1 - (pos - lo)) + lv[Math.min(lv.length - 1, lo + 1)] * (pos - lo);
							const h = 40 + 240 * Math.min(1, v * 0.85 + 0.15 * Math.abs(Math.sin(t * 6 + i * 0.6)));
							return <rect key={i} x={110 + i * 40} y={1660 - h} width={28} height={h} rx={14} fill={i % 5 === 2 ? C.gold : C.navy} opacity={0.9} />;
						})}
					</svg>
					<Sticker text="بووم!" x={330} y={1300} size={110} rot={-12} p={sprAt(frame, accents[4] + 0.05, SPR.bouncy)} />
					<Sticker text="ووووش" x={790} y={1200} size={84} rot={10} p={sprAt(frame, starts[4] + 0.05, SPR.bouncy)} fill={C.white} />
					<Sticker text="تِك!" x={880} y={1420} size={70} rot={-6} p={sprAt(frame, starts[4] + 0.45, SPR.bouncy)} fill={C.cream} />
				</>,
				(p) => `translateY(${(1 - p) * -500}px)`,
			)}

			{/* progress */}
			<div style={{position: 'absolute', top: 1700, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, direction: 'rtl'}}>
				{IDS.map((id, i) => (
					<div key={id} style={{width: i === idx ? 60 : 18, height: 18, borderRadius: 9, background: i <= idx ? C.navy : rgba(C.navy, 0.25)}} />
				))}
			</div>
		</AbsoluteFill>
	);
};
