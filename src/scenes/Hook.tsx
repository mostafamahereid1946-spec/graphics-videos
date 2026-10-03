import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, FPS, rgba} from '../brand/tokens';
import {KineticText} from '../components/KineticText';
import {SceneBg} from '../components/SceneBg';
import {EASE, SPR, sprAt, tween} from '../motion';
import {ev, wordAt} from '../timeline';
import {withEmoji} from '../timeline/emoji';
import {Emo} from '../art/Emo';
import {Crowd} from '../art/Person';
import {Shop, StickyNote} from '../art/Props';
import {Reel} from '../art/Reel';

const NOTE = {x: 540, y: 930, w: 660};
const LENS = {x: 520, y: 880, r: 190};

/**
 * Hook — beat for beat like the reference opener: a handwritten sticky note ("ريلز ؟"), a magnifier sweeps in
 * and the camera dives through the lens into a full cyan page where everything the voice says is drawn:
 * reels fan in, the crowd is pulled in, reactions fly, the shop opens.
 */
export const Hook: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const zoomAt = ev('hookZoom');
	const enter = sprAt(frame, 0, SPR.snappy);
	const zoomP = tween(frame, zoomAt, zoomAt + 0.5, 0, 1, EASE.whip);
	const Z = interpolate(zoomP, [0, 1], [1, 9]);
	const lx = interpolate(zoomP, [0, 1], [LENS.x, 540]);
	const ly = interpolate(zoomP, [0, 1], [LENS.y, 900]);
	const offX = (1 - enter) * -620;
	const offY = (1 - enter) * 760;
	const R = LENS.r * Z;
	const cyan = tween(frame, zoomAt + 0.1, zoomAt + 0.4, 0, 1, EASE.inOut);
	const after = zoomAt + 0.42; // cyan page fully open

	const note = (scale: number) => (
		<div style={{position: 'absolute', left: NOTE.x - (NOTE.w * scale) / 2, top: NOTE.y - (NOTE.w * scale) / 2, transform: `rotate(-5deg)`}}>
			<StickyNote w={NOTE.w * scale} text="ريلز ؟" scribble={tween(frame, 0.05, 0.5, 0, 1, EASE.inOut)} />
		</div>
	);

	// cyan-page choreography (all keyed to the spoken words)
	const reelAt = Math.max(wordAt('hook', 1) - 0.04, after - 0.05);
	const reels = [0, 1, 2].map((i) => sprAt(frame, reelAt + i * 0.07, SPR.pop));
	const pull = sprAt(frame, wordAt('hook', 2) - 0.04, SPR.snappy);
	const crowd = [0, 1, 2, 3, 4, 5].map((i) => sprAt(frame, wordAt('hook', 3) - 0.06 + i * 0.045, SPR.pop));
	const shop = sprAt(frame, wordAt('hook', 4) - 0.06, SPR.pop);
	const hearts = ['heart', 'fire', 'heart_eyes', 'eyes', 'star_struck'] as const;

	return (
		<AbsoluteFill>
			{/* phase A: desk + sticky note under the magnifier */}
			<AbsoluteFill style={{transform: `scale(${0.96 + 0.04 * enter})`}}>{note(1)}</AbsoluteFill>

			{/* lens interior: magnified note -> cyan page */}
			<AbsoluteFill style={{clipPath: `circle(${R}px at ${lx + offX}px ${ly + offY}px)`}}>
				<AbsoluteFill style={{background: C.cream}} />
				<AbsoluteFill style={{transform: `translate(${lx + offX - LENS.x}px, ${ly + offY - LENS.y}px) scale(${1.7 * Z})`, transformOrigin: `${LENS.x}px ${LENS.y}px`}}>
					{note(1)}
				</AbsoluteFill>
				<AbsoluteFill style={{opacity: cyan}}>
					<SceneBg paint="cyan" frame={frame} />
				</AbsoluteFill>

				{/* headline with emojis beside the words */}
				<div style={{position: 'absolute', top: 175, left: 60, right: 60, display: 'flex', justifyContent: 'center', opacity: tween(frame, zoomAt + 0.24, zoomAt + 0.38)}}>
					<KineticText words={withEmoji('hook')} frame={frame} size={98} weight={900} color={C.navy} emColor={C.white} emBg={C.navy} lineHeight={1.32} maxWidth={960} />
				</div>

				{/* reels fan in on "ريلز" */}
				{[0, 1, 2].map((i) => {
					const p = reels[i];
					const pos = [
						{x: 300, y: 700, r: -12, w: 250, k: 'cafe'},
						{x: 780, y: 700, r: 12, w: 250, k: 'fashion'},
						{x: 540, y: 660, r: 0, w: 300, k: 'burger'},
					][i];
					const tug = pull * Math.sin(t * 9 + i) * 3;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: pos.x - pos.w / 2,
								top: pos.y + (1 - p) * 900,
								transform: `rotate(${pos.r * p + tug}deg) scale(${0.7 + 0.3 * p})`,
								opacity: p > 0.01 ? 1 : 0,
								filter: `drop-shadow(0 26px 40px ${rgba(C.navy, 0.45)})`,
							}}
						>
							<Reel w={pos.w} kind={pos.k as 'cafe'} t={t} play={i === 2 ? 1 : 0} liked={pull > 0.5 ? 1 : 0} id={`hook${i}`} />
						</div>
					);
				})}

				{/* "تشدّ": attraction beams from the reels down to the crowd */}
				{pull > 0.01 ? (
					<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
						{[260, 420, 660, 820].map((x, i) => {
							const k = (t * 1.6 + i * 0.25) % 1;
							return (
								<path
									key={i}
									d={`M 540 1240 Q ${x} ${1360 + k * 60} ${x} ${1450}`}
									fill="none"
									stroke={C.navy}
									strokeWidth={7}
									strokeDasharray="14 14"
									strokeDashoffset={-t * 80}
									opacity={pull * 0.55}
								/>
							);
						})}
					</svg>
				) : null}

				{/* "لمشروعك؟": the shop opens behind the crowd */}
				<div style={{position: 'absolute', left: 540 - 230, top: 1080, transform: `scale(${shop}) translateY(${(1 - shop) * 120}px)`, transformOrigin: 'bottom center', opacity: shop > 0.01 ? 1 : 0}}>
					<Shop w={460} t={t} open={shop} />
				</div>

				{/* "الناس": the crowd slides in, pulled towards the reels */}
				<div style={{position: 'absolute', left: 30, right: 30, top: 1480, display: 'flex', justifyContent: 'center', transform: `translateY(${-pull * crowd[5] * 30}px)`}}>
					<Crowd size={175} count={6} progress={crowd} />
				</div>

				{/* reactions float up */}
				{hearts.map((name, i) => {
					const start = wordAt('hook', 3) + 0.1 + i * 0.09;
					const p = Math.max(0, Math.min(1, (t - start) / 1.1));
					if (p <= 0) return null;
					const x = 160 + i * 190 + Math.sin(t * 4 + i) * 20;
					return (
						<div key={name} style={{position: 'absolute', left: x - 55, top: 1400 - p * 520, opacity: 1 - Math.max(0, p - 0.7) / 0.3, transform: `scale(${Math.min(1, p * 4)})`}}>
							<Emo name={name} size={110} />
						</div>
					);
				})}
			</AbsoluteFill>

			{/* magnifier ring + handle */}
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<g transform={`translate(${lx + offX} ${ly + offY}) rotate(${(1 - enter) * -30}) scale(${Z})`}>
					<g transform="rotate(135)">
						<rect x={LENS.r + 8} y={-36} width={300} height={72} rx={36} fill={C.panel} stroke={rgba(C.cyan, 0.3)} strokeWidth={3} />
						<rect x={LENS.r + 8} y={-36} width={50} height={72} rx={10} fill={C.gold} />
						<rect x={LENS.r + 110} y={-20} width={160} height={9} rx={4.5} fill={rgba(C.cyan, 0.3)} />
						<rect x={LENS.r + 110} y={12} width={160} height={9} rx={4.5} fill={rgba(C.cyan, 0.3)} />
					</g>
					<circle r={LENS.r} fill="none" stroke={C.cyan} strokeWidth={32} />
					<circle r={LENS.r - 16} fill="none" stroke={rgba(C.white, 0.2)} strokeWidth={4} />
					<g opacity={1 - cyan}>
						<path d={`M ${-LENS.r * 0.7} ${-LENS.r * 0.42} L ${-LENS.r * 0.22} ${-LENS.r * 0.86}`} stroke={rgba(C.white, 0.45)} strokeWidth={18} strokeLinecap="round" />
						<path d={`M ${-LENS.r * 0.55} ${-LENS.r * 0.08} L ${-LENS.r * 0.06} ${-LENS.r * 0.5}`} stroke={rgba(C.white, 0.22)} strokeWidth={9} strokeLinecap="round" />
					</g>
				</g>
			</svg>
		</AbsoluteFill>
	);
};
