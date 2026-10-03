import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {LogoMark, Tagline, Wordmark} from '../brand/Logo';
import {CardBack, ChevronWipe, CornerBrackets} from '../brand/motifs';
import {loadBrandFonts} from '../brand/fonts';
import {C, FONT} from '../brand/tokens';
import {SceneBg} from '../components/SceneBg';
import {KineticText} from '../components/KineticText';
import {line} from '../timeline';

loadBrandFonts();

/** Dev still: brand system QA (fonts, Arabic shaping, logo geometry, card back). */
export const BrandSheet: React.FC = () => {
	const frame = useCurrentFrame();
	const far = 9999;
	return (
		<AbsoluteFill>
			<SceneBg paint="navy" frame={frame} />
			<div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
				<LogoMark size={230} glow={0.6} />
				<Wordmark size={120} />
				<Tagline size={30} />
				<div style={{width: 60, height: 8, background: C.gold}} />
			</div>
			<div style={{position: 'absolute', top: 760, left: 70, right: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
				<KineticText words={line('hook').words} frame={far} size={84} weight={900} />
				<KineticText words={line('s1').words.concat(line('s2b').words)} frame={far} size={62} weight={700} />
				<div style={{fontFamily: FONT.mono, fontSize: 30, letterSpacing: '0.3em', color: C.gold}}>SERVICE 01 / 05</div>
			</div>
			<div style={{position: 'absolute', top: 1110, left: 100}}>
				<CardBack width={880}>
					<div style={{direction: 'rtl', fontFamily: FONT.ar, fontWeight: 800, fontSize: 52, color: C.navy}}>باقة شهرية</div>
					<div style={{fontFamily: FONT.mono, fontSize: 28, letterSpacing: '0.22em', color: C.goldDeep, textAlign: 'right', marginTop: 8}}>MONTHLY PACKAGE</div>
				</CardBack>
			</div>
			<CornerBrackets x={70} y={270} w={940} h={980} />
			<ChevronWipe progress={0.12} />
		</AbsoluteFill>
	);
};
