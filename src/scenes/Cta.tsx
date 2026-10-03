import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {LogoMark} from '../brand/Logo';
import {C, FONT, FPS, rgba} from '../brand/tokens';
import {KineticText} from '../components/KineticText';
import {EASE, SPR, sprAt, tween} from '../motion';
import {ev, evs, wordAt} from '../timeline';
import {withEmoji} from '../timeline/emoji';
import {Emo} from '../art/Emo';
import {Megaphone, PaperPlane} from '../art/Props';
import {PHONE, PhoneBody} from '../illustrations/Phone';
import {CtaButton} from '../illustrations/Chat';

const PK = 1.45;
const PX = 80;
const PY = 560;

/**
 * CTA: "ابعتلنا رسالة دلوقتي… وخلّي محتواك يتكلّم عنك". A big phone chat (no platform branding): the message
 * pops, a paper plane takes off on "رسالة"; a megaphone blasts on "يتكلّم"; the button points down to Meta's CTA.
 */
export const Cta: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const words = withEmoji('a1');
	const bubbles = evs('ctaBubbles');
	const btn = ev('ctaButton');
	const phoneIn = sprAt(frame, ev('ctaIn'), SPR.soft);
	const b1 = sprAt(frame, bubbles[0], SPR.pop);
	const b2 = sprAt(frame, bubbles[1], SPR.pop);
	const typing = t > bubbles[0] + 0.3 && t < bubbles[1];
	const planeP = tween(frame, wordAt('a1', 1) - 0.05, wordAt('a1', 1) + 1.0, 0, 1, EASE.inOut);
	const mega = sprAt(frame, wordAt('a1', 5) - 0.08, SPR.bouncy);
	const point = sprAt(frame, btn + 0.2, SPR.bouncy);

	// paper-plane path: from the phone's send button up and to the right
	const px = interpolate(planeP, [0, 1], [PX + 250 * PK, 980]);
	const py = interpolate(planeP, [0, 1], [PY + 560 * PK, 520]) - Math.sin(planeP * Math.PI) * 260;

	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 170, left: 60, right: 60, display: 'flex', justifyContent: 'center'}}>
				<KineticText words={words.slice(0, 2)} frame={frame} size={112} weight={900} emColor={C.cyan} />
			</div>
			<div style={{position: 'absolute', top: 340, left: 60, right: 60, display: 'flex', justifyContent: 'center'}}>
				<KineticText words={words.slice(2).map((w) => ({...w, lineBreak: false}))} frame={frame} size={56} weight={800} color={rgba(C.cream, 0.95)} emColor={C.gold} maxWidth={980} />
			</div>

			{/* phone with the chat */}
			<div style={{position: 'absolute', left: PX, top: PY + (1 - phoneIn) * 1100, transform: `rotate(${-4 + (1 - phoneIn) * -10}deg)`, filter: `drop-shadow(0 34px 60px ${rgba('#000000', 0.5)})`}}>
				<svg width={PHONE.w * PK} height={PHONE.h * PK} viewBox={`0 0 ${PHONE.w} ${PHONE.h}`} style={{overflow: 'visible'}}>
					<PhoneBody id="ctaPhone" screen={C.cream}>
						<rect x={0} y={0} width={PHONE.w} height={92} fill={C.navy} />
						<circle cx={252} cy={70} r={15} fill={C.panel3} />
						<rect x={130} y={62} width={96} height={10} rx={5} fill={rgba(C.cream, 0.8)} />
						<rect x={150} y={78} width={76} height={7} rx={3.5} fill={rgba(C.cyan, 0.8)} />
						<path d="M 40 70 l 12 -10 M 40 70 l 12 10" stroke={C.cream} strokeWidth={4} strokeLinecap="round" />
						<rect x={16} y={556} width={268} height={48} fill={C.creamShade} />
						<rect x={30} y={566} width={190} height={28} rx={14} fill={C.white} />
						<circle cx={252} cy={580} r={17} fill={C.cyan} />
						<path d="M 245 572 L 262 580 L 245 588 Z" fill={C.navy} />
					</PhoneBody>
				</svg>
				<div style={{position: 'absolute', left: 26 * PK, right: 26 * PK, top: 120 * PK, display: 'flex', flexDirection: 'column', gap: 18}}>
					<div style={{alignSelf: 'flex-end', direction: 'rtl', padding: '14px 22px', borderRadius: '26px 26px 6px 26px', background: C.cyan, color: C.navy, fontFamily: FONT.ar, fontWeight: 800, fontSize: 38, opacity: b1 > 0.01 ? 1 : 0, transform: `scale(${b1})`, transformOrigin: 'right bottom'}}>
						عايز أبدأ الباقة
					</div>
					<div style={{alignSelf: 'flex-start', display: 'flex', alignItems: 'flex-end', gap: 10, direction: 'ltr'}}>
						<div style={{width: 58, height: 58, borderRadius: 29, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: typing || b2 > 0.01 ? 1 : 0}}>
							<LogoMark size={40} />
						</div>
						{typing ? (
							<div style={{padding: '18px 22px', borderRadius: '26px 26px 26px 6px', background: C.white, display: 'flex', gap: 9}}>
								{[0, 1, 2].map((i) => (
									<div key={i} style={{width: 14, height: 14, borderRadius: 7, background: C.steel2, transform: `translateY(${Math.sin(t * 12 - i * 0.9) * 5}px)`}} />
								))}
							</div>
						) : (
							<div style={{direction: 'rtl', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: '26px 26px 26px 6px', background: C.white, color: C.navy, fontFamily: FONT.ar, fontWeight: 900, fontSize: 38, opacity: b2 > 0.01 ? 1 : 0, transform: `scale(${b2})`, transformOrigin: 'left bottom'}}>
								يلا بينا!
								<Emo name="clapper" size={46} style={{filter: 'none'}} />
							</div>
						)}
					</div>
				</div>
			</div>

			{/* paper plane on "رسالة" */}
			{planeP > 0 && planeP < 1 ? (
				<>
					<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
						<path
							d={`M ${PX + 250 * PK} ${PY + 560 * PK} Q ${(PX + 250 * PK + px) / 2} ${py - 200} ${px} ${py}`}
							fill="none"
							stroke={C.gold}
							strokeWidth={6}
							strokeDasharray="16 14"
							opacity={0.8}
						/>
					</svg>
					<div style={{position: 'absolute', left: px - 80, top: py - 60, transform: `rotate(${-20 + planeP * 10}deg) scale(${0.8 + 0.3 * Math.sin(planeP * Math.PI)})`}}>
						<PaperPlane w={170} />
					</div>
				</>
			) : null}
			<div style={{position: 'absolute', left: 820, top: 500, transform: `scale(${sprAt(frame, wordAt('a1', 1) + 0.95, SPR.bouncy)}) rotate(10deg)`}}>
				<Emo name="incoming" size={180} />
			</div>

			{/* megaphone on "يتكلّم" */}
			<div style={{position: 'absolute', left: 620, top: 900, transform: `scale(${mega}) rotate(${-14 + Math.sin(t * 8) * 3 * mega}deg)`, transformOrigin: 'left center', opacity: mega > 0.01 ? 1 : 0}}>
				<Megaphone w={400} t={t} />
			</div>
			{[0, 1, 2].map((i) => (
				<div key={i} style={{position: 'absolute', left: [860, 720, 900][i], top: [760, 1240, 1150][i] + Math.sin(t * 3 + i) * 10, transform: `scale(${sprAt(frame, wordAt('a1', 5) + 0.1 + i * 0.08, SPR.bouncy)}) rotate(${(i - 1) * 12}deg)`}}>
					<Emo name="speech" size={[130, 110, 100][i]} />
				</div>
			))}

			{/* button pointing to Meta's CTA */}
			<div style={{position: 'absolute', top: 1560, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<CtaButton frame={frame} at={btn} width={780} />
			</div>
			<div style={{position: 'absolute', left: 60, top: 1520 + Math.abs(Math.sin(t * 5)) * 22, transform: `scale(${point})`}}>
				<Emo name="point_down" size={130} />
			</div>
		</AbsoluteFill>
	);
};
