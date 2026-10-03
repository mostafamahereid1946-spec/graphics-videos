import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {loadBrandFonts} from '../brand/fonts';
import {C} from '../brand/tokens';
import {Emo} from '../art/Emo';
import {Crowd, Person} from '../art/Person';
import {BeachChill, FilmStrip, GiftBox, Laptop, Magnet, Megaphone, Mic, PaperPlane, Scissors, Shop, Speaker, StickyNote} from '../art/Props';
import {Reel} from '../art/Reel';
import {RoleScene} from '../art/Roles';

loadBrandFonts();

/** Dev still: every drawn illustration on one page for QA. */
export const ArtSheet: React.FC = () => {
	const t = useCurrentFrame() / 30;
	const at = (x: number, y: number, node: React.ReactNode) => <div style={{position: 'absolute', left: x, top: y}}>{node}</div>;
	return (
		<AbsoluteFill style={{background: C.navy}}>
			<AbsoluteFill style={{background: C.cyan, top: 1180}} />
			{at(20, 20, <StickyNote w={300} text="ريلز ؟" />)}
			{at(340, 30, <Magnet w={170} t={t} />)}
			{at(540, 20, <Shop w={260} t={t} />)}
			{at(820, 30, <GiftBox w={230} lid={0.4} />)}
			{['cafe', 'fashion', 'burger', 'beauty', 'gym', 'shop'].map((k, i) => (
				<React.Fragment key={k}>{at(20 + i * 175, 340, <Reel w={160} kind={k as never} t={t} play={i === 0 ? 1 : 0} liked={i % 2} id={`a${i}`} />)}</React.Fragment>
			))}
			{at(20, 650, <Crowd size={120} count={6} />)}
			{at(700, 640, <Person size={170} hair="long" shirt={C.gold} shades />)}
			{at(880, 650, <Emo name="sunglasses" size={160} />)}
			{at(10, 840, <RoleScene kind="editor" t={t} />)}
			{at(560, 840, <RoleScene kind="motion" t={t} />)}
			{at(10, 1360, <RoleScene kind="captions" t={t} />)}
			{at(560, 1360, <RoleScene kind="sound" t={t} />)}
			{at(380, 1230, <Laptop w={300} id="sheet" />)}
			{at(380, 1500, <FilmStrip w={300} cut={0.6} t={t} />)}
			{at(400, 1600, <Scissors w={150} open={0.6} />)}
			{at(470, 1700, <Speaker w={120} t={t} pulse={0.5} />)}
			{at(600, 1800, <Mic w={60} />)}
			{at(300, 1780, <Megaphone w={150} t={t} />)}
			{at(160, 1830, <PaperPlane w={110} />)}
			{at(700, 1640, <BeachChill w={360} t={t} />)}
		</AbsoluteFill>
	);
};
