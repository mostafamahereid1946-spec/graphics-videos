import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {loadBrandFonts} from './brand/fonts';
import {ChevronWipe} from './brand/motifs';
import {C, FPS} from './brand/tokens';
import {Flash, Grain, SafeZones, WedgeWipe} from './components/Overlays';
import {IrisBg, PAINT, SceneBg, type Paint} from './components/SceneBg';
import {EASE, tween} from './motion';
import {Consistency} from './scenes/Consistency';
import {Cta} from './scenes/Cta';
import {Hook} from './scenes/Hook';
import {LogoEnd} from './scenes/LogoEnd';
import {Problem} from './scenes/Problem';
import {Punch} from './scenes/Punch';
import {Services} from './scenes/Services';
import {Solution} from './scenes/Solution';
import {ev, scene} from './timeline';

loadBrandFonts();

export type ReelProps = {showSafeZones?: boolean; withAudio?: boolean};

const WIPE = 0.24; // half-length of a chevron wipe (s); full cover lands exactly on the scene cut
const IRIS = 0.42;

type BgSeg = {from: number; paint: Paint; iris?: {cx: number; cy: number}};

/** Full-page palette backdrops, keyed to the voice (cream opens from the logo, cyan on the drop, …). */
const BG: BgSeg[] = [
	{from: 0, paint: 'navy'},
	{from: ev('solutionLogo') - 0.1, paint: 'cream', iris: {cx: 540, cy: 760}},
	{from: scene('services').start, paint: 'cyan', iris: {cx: 540, cy: 960}},
	{from: scene('consistency').start, paint: 'navy'},
	{from: scene('punch').start, paint: 'gold'},
	{from: ev('punchResume'), paint: 'cyan', iris: {cx: 540, cy: 960}},
	{from: scene('cta').start, paint: 'navy'},
];

/**
 * COREVIA — "فريق كامل… في باقة واحدة" Meta Reels ad (1080x1920, 30 fps).
 * Every timing comes from src/timeline/timeline.json, generated from the voice recording, so pictures, emojis,
 * wipes and SFX land on the spoken word and on the music grid (120 BPM).
 */
export const CoreviaReel: React.FC<ReelProps> = ({showSafeZones = false, withAudio = true}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const S = scene;
	const on = (id: string) => t >= S(id).start && t < S(id).end + (id === 'logo' ? 1 : 0);

	let k = 0;
	for (let i = 0; i < BG.length; i++) if (t >= BG[i].from) k = i;
	const seg = BG[k];
	const irisP = seg.iris ? tween(frame, seg.from, seg.from + IRIS, 0, 1, EASE.inOut) : 1;

	const wipe = (at: number) => tween(frame, at - WIPE, at + WIPE, 0, 1, EASE.inOut);
	const flashAt = (at: number, peak: number) => (t >= at ? tween(frame, at, at + 0.3, peak, 0, EASE.out) : 0);

	return (
		<AbsoluteFill style={{backgroundColor: PAINT[seg.paint].base}}>
			{irisP < 1 && k > 0 ? (
				<>
					<SceneBg paint={BG[k - 1].paint} frame={frame} />
					<IrisBg paint={seg.paint} frame={frame} p={irisP} cx={seg.iris?.cx} cy={seg.iris?.cy} />
				</>
			) : (
				<SceneBg paint={seg.paint} frame={frame} />
			)}

			{on('hook') ? <Hook frame={frame} /> : null}
			{on('problem') ? <Problem frame={frame} /> : null}
			{on('solution') ? <Solution frame={frame} /> : null}
			{on('services') ? <Services frame={frame} /> : null}
			{on('consistency') ? <Consistency frame={frame} /> : null}
			{on('punch') ? <Punch frame={frame} /> : null}
			{on('cta') ? <Cta frame={frame} /> : null}
			{on('logo') ? <LogoEnd frame={frame} /> : null}

			{/* brand transitions */}
			<ChevronWipe progress={wipe(S('problem').start)} color={C.navy} />
			<ChevronWipe progress={wipe(S('consistency').start)} color={C.navy} />
			<WedgeWipe progress={tween(frame, S('cta').start - 0.26, S('cta').start + 0.3, 0, 1, EASE.inOut)} />
			<Flash p={flashAt(S('services').start, 0.85)} />
			<Flash p={flashAt(S('logo').start, 0.95)} />

			<Grain frame={frame} opacity={0.05} />
			{showSafeZones ? <SafeZones /> : null}
			{withAudio ? <Audio src={staticFile('audio/mix.wav')} /> : null}
		</AbsoluteFill>
	);
};
