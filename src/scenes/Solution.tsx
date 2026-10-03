import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {LogoMark} from '../brand/Logo';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {KineticText} from '../components/KineticText';
import {EASE, SPR, sprAt, tween} from '../motion';
import {ev, evs, line, scene, wordAt} from '../timeline';
import {withEmoji} from '../timeline/emoji';
import {Confetti, GiftBox} from '../art/Props';
import {RoleIcon} from '../illustrations/RoleCard';
import {HirePanel} from './Problem';
import {CARD_H, CARD_W, TEAM} from './teamCards';

const LOGO = {cx: 540, cy: 760, size: 340};
const BOX = {w: 660, x: 540 - 330, top: 840};
const BOX_SCALE = BOX.w / 360;
const MARK = {x: BOX.x + 64 * BOX_SCALE, y: BOX.top + 214 * BOX_SCALE, size: 200 * 0.42 * BOX_SCALE};
const ORBIT = [-150, -30, 150, 30].map((deg) => ({x: LOGO.cx + Math.cos((deg * Math.PI) / 180) * 330, y: LOGO.cy + Math.sin((deg * Math.PI) / 180) * 240}));

/**
 * Solution (cream page): the four hires collapse into four SKILLS (badges) that orbit the COREVIA mark as it
 * draws itself; the mark lands on a gift box, each skill drops in, the lid closes on "شهرية" and a gold "1"
 * stamps on "واحدة!" with confetti. One package — never a picture of staff.
 */
export const Solution: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const merge = ev('solutionMerge');
	const logoAt = ev('solutionLogo');
	const boxAt = ev('solutionCard');
	const drops = evs('solutionChecks');
	const stampAt = ev('solutionStamp');
	const end = scene('solution').end;

	const collapse = tween(frame, merge, merge + 0.4, 0, 1, EASE.inOut);
	const ring = tween(frame, logoAt - 0.12, logoAt + 0.28, 0, 1, EASE.inOut);
	const check = tween(frame, logoAt + 0.08, logoAt + 0.32, 0, 1, EASE.out);
	const tab = tween(frame, logoAt + 0.26, logoAt + 0.42, 0, 1, EASE.outBack);
	const box = sprAt(frame, boxAt, SPR.soft);
	const fly = tween(frame, boxAt + 0.08, boxAt + 0.5, 0, 1, EASE.inOut);
	const lid = tween(frame, wordAt('s2b', 2) - 0.08, wordAt('s2b', 2) + 0.18, 0, 1, EASE.outBack);
	const bow = sprAt(frame, wordAt('s2b', 2) + 0.12, SPR.bouncy);
	const stamp = sprAt(frame, stampAt, SPR.heavy);
	const push = tween(frame, end - 0.55, end, 0, 1, EASE.in);
	const boxShake = t > end - 0.55 ? Math.sin(t * 70) * 6 * push : 0;
	const s1Out = tween(frame, boxAt - 0.05, boxAt + 0.2, 0, 1, EASE.in);
	const head = [...withEmoji('s2a'), {...withEmoji('s2b')[0], lineBreak: true}, ...withEmoji('s2b').slice(1)];

	const logoCx = interpolate(fly, [0, 1], [LOGO.cx, MARK.x + MARK.size / 2]);
	const logoCy = interpolate(fly, [0, 1], [LOGO.cy, MARK.y + MARK.size / 2]) + (1 - box) * 900 * fly;
	const logoSize = interpolate(fly, [0, 1], [LOGO.size, MARK.size]);
	const boxTop = BOX.top + (1 - box) * 900;

	return (
		<AbsoluteFill style={{transform: `scale(${1 + push * 0.08})`}}>
			{/* hires collapse (still on the navy page) */}
			{collapse < 1
				? TEAM.map((c, i) => {
						const tx = ORBIT[i].x - (c.x + CARD_W / 2);
						const ty = ORBIT[i].y - (c.y + CARD_H / 2);
						return (
							<div
								key={c.kind}
								style={{
									position: 'absolute',
									left: c.x,
									top: c.y,
									opacity: 1 - Math.max(0, collapse - 0.6) * 2.5,
									transform: `translate(${tx * collapse}px, ${ty * collapse}px) scale(${1 - 0.7 * collapse}) rotate(${collapse * (i % 2 ? 25 : -25)}deg)`,
								}}
							>
								<HirePanel kind={c.kind} label={c.label} kicker={c.kicker} t={t} glow={collapse} />
							</div>
						);
					})
				: null}

			{/* skill badges orbiting, then dropping into the box */}
			{TEAM.map((c, i) => {
				const appear = sprAt(frame, merge + 0.3 + i * 0.03, SPR.pop);
				const drop = tween(frame, drops[i] - 0.18, drops[i] + 0.12, 0, 1, EASE.in);
				if (appear < 0.01 || drop >= 1) return null;
				const spin = (t - merge) * 0.9;
				const ox = LOGO.cx + (ORBIT[i].x - LOGO.cx) * Math.cos(spin) - (ORBIT[i].y - LOGO.cy) * Math.sin(spin) * 0.9;
				const oy = LOGO.cy + (ORBIT[i].x - LOGO.cx) * Math.sin(spin) * 0.9 + (ORBIT[i].y - LOGO.cy) * Math.cos(spin);
				const x = interpolate(drop, [0, 1], [ox, 540]);
				const y = interpolate(drop, [0, 1], [oy, boxTop + 140]);
				const s = 150 * appear * (1 - 0.6 * drop);
				return (
					<div key={c.kind} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, filter: `drop-shadow(0 14px 24px ${rgba(C.navy, 0.35)})`}}>
						<RoleIcon kind={c.kind} size={s} />
					</div>
				);
			})}

			{/* the gift box */}
			<div style={{position: 'absolute', left: BOX.x + boxShake, top: boxTop, opacity: box > 0.001 ? 1 : 0}}>
				<GiftBox w={BOX.w} lid={lid} bow={Math.max(0.6, bow)} />
			</div>

			{/* the COREVIA mark: draws itself, then lands on the box */}
			{t >= logoAt - 0.13 ? (
				<div style={{position: 'absolute', left: logoCx - logoSize / 2 + boxShake * fly, top: logoCy - logoSize / 2, transform: `scale(${fly > 0 ? 1 : 0.6 + 0.4 * sprAt(frame, logoAt - 0.12, SPR.pop)})`}}>
					<LogoMark size={logoSize} ring={ring} check={check} tab={tab} glow={0.5 * (1 - fly)} />
				</div>
			) : null}

			{/* "مع COREVIA" under the mark */}
			<div style={{position: 'absolute', left: 60, right: 60, top: 1110, display: 'flex', justifyContent: 'center', opacity: 1 - s1Out, transform: `translateY(${-s1Out * 60}px)`}}>
				<KineticText words={line('s1').words} frame={frame} size={120} weight={900} color={C.navy} />
			</div>

			{/* headline */}
			<div style={{position: 'absolute', top: 160, left: 60, right: 60, display: 'flex', justifyContent: 'center', opacity: tween(frame, boxAt - 0.1, boxAt + 0.15)}}>
				<KineticText words={head} frame={frame} size={92} weight={900} color={C.navy} emColor={C.goldDeep} variant="ghost" lineHeight={1.32} maxWidth={960} />
			</div>

			{/* stamp "1" + confetti on "واحدة!" */}
			<div style={{position: 'absolute', left: 540, top: boxTop + 200}}>
				<Confetti p={tween(frame, stampAt, stampAt + 1.1, 0, 1, (x) => x)} spread={760} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: BOX.x + BOX.w - 190 + boxShake,
					top: boxTop + 120,
					width: 210,
					height: 210,
					borderRadius: 105,
					background: C.gold,
					border: `7px solid ${C.navy}`,
					boxShadow: `0 0 0 7px ${C.gold}, 0 22px 50px ${rgba('#000000', 0.35)}`,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: stamp > 0.01 ? 1 : 0,
					transform: `scale(${interpolate(stamp, [0, 1], [2.6, 1])}) rotate(-12deg)`,
				}}
			>
				<div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 118, lineHeight: 0.9, color: C.navy}}>1</div>
				<div style={{fontFamily: FONT.ar, fontWeight: 800, fontSize: 32, color: C.navy, direction: 'rtl'}}>باقة واحدة</div>
			</div>
		</AbsoluteFill>
	);
};
