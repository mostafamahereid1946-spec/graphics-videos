import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {KineticText} from '../components/KineticText';
import {SPR, sprAt, tween} from '../motion';
import {ev, evs, line} from '../timeline';
import {withEmoji} from '../timeline/emoji';
import {Emo} from '../art/Emo';
import {RoleScene, type RoleKind} from '../art/Roles';
import {CARD_H, CARD_W, TEAM} from './teamCards';

const LINES = ['p1', 'p2', 'p3', 'p4'];

/** One "wanted" panel: a drawn person doing that job (the hire you would need without COREVIA). */
export const HirePanel: React.FC<{kind: RoleKind; label: string; kicker: string; t: number; glow?: number}> = ({kind, label, kicker, t, glow = 0}) => (
	<div
		style={{
			position: 'relative',
			width: CARD_W,
			height: CARD_H,
			borderRadius: 34,
			overflow: 'hidden',
			background: `linear-gradient(165deg, ${C.panel3} 0%, ${C.panel} 75%)`,
			border: `3px solid ${rgba(C.cyan, 0.2 + 0.5 * glow)}`,
			boxShadow: `0 30px 70px ${rgba('#000000', 0.45)}${glow ? `, 0 0 ${50 * glow}px ${rgba(C.cyan, 0.4 * glow)}` : ''}`,
		}}
	>
		<div style={{position: 'absolute', left: 15, top: 30}}>
			<RoleScene kind={kind} t={t} />
		</div>
		<div style={{position: 'absolute', top: 18, right: 22, textAlign: 'right'}}>
			<div style={{fontFamily: FONT.ar, fontWeight: 900, fontSize: 46, color: C.white, direction: 'rtl', lineHeight: 1.05}}>{label}</div>
			<div style={{fontFamily: FONT.mono, fontWeight: 500, fontSize: 28, letterSpacing: '0.14em', color: C.gold, direction: 'ltr', marginTop: 4}}>{kicker}</div>
		</div>
		<div
			style={{
				position: 'absolute',
				left: 18,
				top: 22,
				padding: '6px 16px 8px',
				borderRadius: 12,
				background: C.gold,
				color: C.navy,
				fontFamily: FONT.ar,
				fontWeight: 900,
				fontSize: 32,
				transform: 'rotate(-6deg)',
				boxShadow: `0 8px 18px ${rgba('#000000', 0.3)}`,
			}}
		>
			مطلوب
		</div>
	</div>
);

/**
 * Problem: "يعني محتاج مونتير… ومصمّم موشن جرافيك… وحدّ للكابشن… وحدّ للصوت… ده فريق كامل!"
 * Each hire the viewer would need pops in as a drawn "wanted" panel; on "فريق كامل" they all shake and a
 * big 🤯 lands — the hassle, not COREVIA's staff.
 */
export const Problem: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const pops = evs('problemCards');
	const team = ev('problemTeam');
	const teamP = sprAt(frame, team, SPR.heavy);
	const boom = sprAt(frame, team + 0.05, SPR.bouncy);
	const shake = (i: number) => (t > team ? Math.sin((t - team) * 50 + i) * Math.exp(-(t - team) * 4) * 14 : 0);
	const current = [...LINES].reverse().find((id) => t >= line(id).start - 0.15);
	const teamHead = t >= line('p5').start - 0.1;

	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 168, right: 70, fontFamily: FONT.mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.28em', color: C.gold, direction: 'ltr'}}>
				{teamHead ? 'TEAM × 4' : 'YOU WOULD HIRE'}
			</div>
			<div style={{position: 'absolute', top: 215, left: 60, right: 66, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
				{!teamHead && current ? (
					<KineticText key={current} words={withEmoji(current)} frame={frame} size={104} weight={900} variant="ghost" align="flex-start" emColor={C.cyan} lineHeight={1.25} />
				) : null}
				{teamHead ? <KineticText words={withEmoji('p5')} frame={frame} size={124} weight={900} variant="slam" align="flex-start" emColor={C.gold} /> : null}
			</div>

			{TEAM.map((c, i) => {
				const p = sprAt(frame, pops[i], SPR.pop);
				const lit = t >= pops[i] && t < pops[i] + 0.7 ? 1 - (t - pops[i]) / 0.7 : 0;
				return (
					<div
						key={c.kind}
						style={{
							position: 'absolute',
							left: c.x,
							top: c.y,
							opacity: Math.min(1, p * 2),
							transform: `translate(${shake(i)}px, ${(1 - p) * 120 + shake(i + 2) * 0.5}px) scale(${0.35 + 0.65 * p - 0.04 * teamP}) rotate(${(1 - p) * (i % 2 ? 10 : -10) + teamP * (i % 2 ? 2.5 : -2.5)}deg)`,
						}}
					>
						<HirePanel kind={c.kind} label={c.label} kicker={c.kicker} t={Math.max(0, t - pops[i])} glow={lit} />
					</div>
				);
			})}

			{/* 🤯 + ×4 on "ده فريق كامل!" */}
			<div style={{position: 'absolute', left: 540 - 170, top: 1130 - 170, transform: `scale(${boom}) rotate(${(1 - boom) * -40 + Math.sin(t * 9) * 4 * boom}deg)`, opacity: boom > 0.01 ? 1 : 0}}>
				<Emo name="exploding" size={340} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 540 + 110,
					top: 1130 - 230,
					width: 150,
					height: 150,
					borderRadius: 75,
					background: C.gold,
					border: `6px solid ${C.navy}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: FONT.display,
					fontWeight: 800,
					fontSize: 66,
					color: C.navy,
					opacity: teamP > 0.01 ? 1 : 0,
					transform: `scale(${teamP}) rotate(${(1 - teamP) * 50 + 10}deg)`,
					boxShadow: `0 16px 40px ${rgba('#000000', 0.4)}`,
				}}
			>
				×4
			</div>
			{/* stress marks */}
			{teamP > 0.05 ? (
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: tween(frame, team, team + 0.2)}}>
					{[0, 1, 2, 3, 4, 5].map((i) => {
						const a = -Math.PI / 2 + (i - 2.5) * 0.45;
						const r1 = 230 + Math.sin(t * 20 + i) * 8;
						return <line key={i} x1={540 + Math.cos(a) * r1} y1={1130 + Math.sin(a) * r1} x2={540 + Math.cos(a) * (r1 + 70)} y2={1130 + Math.sin(a) * (r1 + 70)} stroke={C.gold} strokeWidth={12} strokeLinecap="round" />;
					})}
				</svg>
			) : null}
		</AbsoluteFill>
	);
};
