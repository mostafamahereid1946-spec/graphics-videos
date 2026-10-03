import React from 'react';
import {C_ARC, CHECK, TAB} from '../brand/Logo';
import {C, rgba} from '../brand/tokens';

type SvgProps = {w: number; style?: React.CSSProperties};
const box = (w: number, vw: number, vh: number, style?: React.CSSProperties) => ({
	width: w,
	height: (w * vh) / vw,
	viewBox: `0 0 ${vw} ${vh}`,
	style: {overflow: 'visible' as const, display: 'block', ...style},
});

/** Reference-reel opener: a sticky note with a handwritten (Ruqaa) question and paper clips. */
export const StickyNote: React.FC<SvgProps & {text: string; scribble?: number}> = ({w, text, scribble = 1, style}) => (
	<svg {...box(w, 320, 320, style)}>
		<path d="M 26 34 L 300 22 L 306 288 Q 200 300 40 304 Z" fill={rgba('#000000', 0.25)} transform="translate(10 14)" />
		<path d="M 20 26 L 296 16 L 300 270 L 262 300 L 30 300 Z" fill={C.cream} />
		<path d="M 262 300 L 300 270 L 268 268 Z" fill={C.creamShade} />
		<rect x={20} y={26} width={280} height={34} fill={rgba(C.gold, 0.22)} transform="rotate(-2 160 40)" />
		<text x={160} y={170} textAnchor="middle" direction="rtl" fontFamily="Aref Ruqaa" fontWeight={700} fontSize={92} fill={C.navy}>
			{text}
		</text>
		<path
			d="M 70 206 Q 120 190 170 204 T 262 200"
			fill="none"
			stroke={C.gold}
			strokeWidth={8}
			strokeLinecap="round"
			pathLength={1}
			strokeDasharray="1 1"
			strokeDashoffset={1 - scribble}
		/>
		{[236, 262].map((y, i) => (
			<g key={y}>
				<rect x={226} y={y - 12} width={22} height={22} rx={5} fill="none" stroke={C.slate} strokeWidth={4} />
				<rect x={80} y={y - 4} width={i ? 110 : 136} height={7} rx={3.5} fill={rgba(C.slate, 0.35)} />
			</g>
		))}
		{/* paper clips */}
		{[
			[64, 6, -8, C.gold],
			[250, 0, 6, C.cyan],
		].map(([x, y, r, c], i) => (
			<g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
				<path d="M 0 60 L 0 8 Q 0 -6 12 -6 Q 24 -6 24 8 L 24 54 Q 24 64 16 64 Q 8 64 8 54 L 8 14" fill="none" stroke={c as string} strokeWidth={6} strokeLinecap="round" />
			</g>
		))}
	</svg>
);

/** Horseshoe magnet with pulsing force lines ("تشدّ"). */
export const Magnet: React.FC<SvgProps & {t?: number}> = ({w, t = 0, style}) => (
	<svg {...box(w, 220, 240, style)}>
		{[0, 1, 2].map((i) => {
			const k = ((t * 1.4 + i / 3) % 1);
			return (
				<path
					key={i}
					d={`M ${40 - k * 30} ${206 + k * 24} Q 110 ${230 + k * 60} ${180 + k * 30} ${206 + k * 24}`}
					fill="none"
					stroke={C.gold}
					strokeWidth={6}
					strokeLinecap="round"
					strokeDasharray="10 12"
					opacity={1 - k}
				/>
			);
		})}
		<path d="M 40 196 L 40 110 Q 40 30 110 30 Q 180 30 180 110 L 180 196" fill="none" stroke={C.cyan} strokeWidth={48} />
		<path d="M 40 110 Q 40 30 110 30 Q 180 30 180 110" fill="none" stroke={rgba(C.white, 0.25)} strokeWidth={10} transform="translate(-10 -8)" />
		<rect x={16} y={168} width={48} height={40} fill={C.cream} />
		<rect x={156} y={168} width={48} height={40} fill={C.cream} />
		<rect x={16} y={168} width={48} height={10} fill={C.creamShade} />
		<rect x={156} y={168} width={48} height={10} fill={C.creamShade} />
	</svg>
);

/** A small shop front — "مشروعك" (your business). */
export const Shop: React.FC<SvgProps & {t?: number; open?: number}> = ({w, t = 0, open = 1, style}) => (
	<svg {...box(w, 320, 300, style)}>
		<rect x={30} y={70} width={260} height={220} fill={C.cream} />
		<rect x={30} y={70} width={260} height={220} fill="none" stroke={C.creamShade} strokeWidth={4} />
		{/* sign */}
		<rect x={70} y={22} width={180} height={46} rx={10} fill={C.navy} />
		<path d="M 146 34 l 8 0 l 3 6 l 14 0 l -3 14 l -16 0 z" fill={C.gold} />
		<circle cx={150} cy={58} r={3} fill={C.gold} />
		<circle cx={166} cy={58} r={3} fill={C.gold} />
		<rect x={182} y={36} width={52} height={8} rx={4} fill={rgba(C.cream, 0.6)} />
		<rect x={86} y={36} width={46} height={8} rx={4} fill={rgba(C.cream, 0.6)} />
		{/* awning */}
		{Array.from({length: 8}).map((_, i) => (
			<path key={i} d={`M ${20 + i * 35} 76 L ${55 + i * 35} 76 L ${55 + i * 35} 112 Q ${37.5 + i * 35} 128 ${20 + i * 35} 112 Z`} fill={i % 2 ? C.cream : C.cyan} />
		))}
		{/* window + door */}
		<rect x={50} y={142} width={130} height={96} rx={8} fill={C.cyanSoft} />
		<path d={`M ${60 + ((t * 60) % 120)} 146 l 24 0 l -40 88 l -24 0 z`} fill={rgba(C.white, 0.5)} />
		<rect x={64} y={198} width={30} height={40} rx={4} fill={C.gold} />
		<rect x={104} y={186} width={30} height={52} rx={4} fill={C.cyanDeep} />
		<rect x={202} y={142} width={70} height={148} rx={6} fill={C.navy} />
		<rect x={202} y={142} width={70 * (1 - 0.6 * open)} height={148} rx={6} fill={C.panel3} />
		<circle cx={258} cy={220} r={5} fill={C.gold} />
		<rect x={20} y={284} width={280} height={12} rx={4} fill={C.creamShade} />
	</svg>
);

/** Branded gift box — the monthly package. lid: 0 = lid up/open, 1 = closed. */
export const GiftBox: React.FC<SvgProps & {lid?: number; bow?: number}> = ({w, lid = 1, bow = 1, style}) => {
	const lift = (1 - lid) * 120;
	const tilt = (1 - lid) * -18;
	return (
		<svg {...box(w, 360, 380, style)}>
			<ellipse cx={180} cy={366} rx={150} ry={16} fill={rgba('#000000', 0.2)} />
			{/* body */}
			<rect x={44} y={150} width={272} height={214} rx={14} fill={C.navy} />
			<rect x={44} y={150} width={272} height={40} fill={rgba('#000000', 0.25)} />
			<rect x={160} y={150} width={40} height={214} fill={C.cyan} />
			{/* logo on the front */}
			<g transform="translate(64 214) scale(0.42)">
				<path d={C_ARC} fill="none" stroke={C.cyan} strokeWidth={22} strokeLinecap="square" />
				<path d={CHECK} fill="none" stroke={C.gold} strokeWidth={16} strokeLinecap="square" />
				<path d={TAB} stroke={C.gold} strokeWidth={10} strokeLinecap="square" />
			</g>
			<rect x={226} y={244} width={70} height={10} rx={5} fill={rgba(C.cream, 0.35)} />
			<rect x={226} y={264} width={46} height={10} rx={5} fill={rgba(C.cream, 0.25)} />
			{/* lid */}
			<g transform={`translate(0 ${-lift}) rotate(${tilt} 44 150)`}>
				<rect x={30} y={110} width={300} height={56} rx={12} fill={C.panel3} />
				<rect x={160} y={110} width={40} height={56} fill={C.cyan} />
				{/* bow */}
				<g transform={`translate(180 110) scale(${bow})`}>
					<path d="M 0 0 C -60 -70 -110 -10 -40 2 Z" fill={C.gold} />
					<path d="M 0 0 C 60 -70 110 -10 40 2 Z" fill={C.gold} />
					<path d="M 0 0 C -30 -40 -60 -10 -30 0 Z" fill={C.goldDeep} />
					<path d="M 0 0 C 30 -40 60 -10 30 0 Z" fill={C.goldDeep} />
					<circle r={16} fill={C.goldSoft} />
				</g>
			</g>
		</svg>
	);
};

/** Laptop; `children` render inside the screen (SVG units 0..520 x 0..300). */
export const Laptop: React.FC<SvgProps & {children?: React.ReactNode; id: string}> = ({w, children, id, style}) => (
	<svg {...box(w, 640, 440, style)}>
		<defs>
			<clipPath id={`lap-${id}`}>
				<rect x={60} y={30} width={520} height={300} rx={8} />
			</clipPath>
		</defs>
		<rect x={40} y={10} width={560} height={340} rx={24} fill={C.navy} />
		<rect x={60} y={30} width={520} height={300} rx={8} fill={C.navyDeep} />
		<g clipPath={`url(#lap-${id})`}>
			<g transform="translate(60 30)">{children}</g>
		</g>
		<path d="M 0 362 L 640 362 L 610 410 Q 600 424 580 424 L 60 424 Q 40 424 30 410 Z" fill={C.panel4} />
		<rect x={0} y={350} width={640} height={16} rx={6} fill={C.panel3} />
		<rect x={270} y={366} width={100} height={10} rx={5} fill={C.panel3} />
	</svg>
);

/** Film strip that splits where it is cut (cut 0..1). */
export const FilmStrip: React.FC<SvgProps & {cut?: number; t?: number}> = ({w, cut = 0, t = 0, style}) => {
	const frames = [C.cyan, C.gold, C.cyanDeep, C.cream, C.gold, C.cyan];
	const gap = cut * 40;
	return (
		<svg {...box(w, 760, 150, style)}>
			{[0, 1].map((half) => (
				<g key={half} transform={`translate(${half ? 380 + gap : 0} ${half ? cut * 18 : 0}) rotate(${half ? cut * 6 : -cut * 3} ${half ? 0 : 380} 75)`}>
					<rect x={0} y={0} width={380} height={150} fill={C.navy} />
					{Array.from({length: 10}).map((_, i) => (
						<g key={i}>
							<rect x={10 + i * 38} y={10} width={22} height={16} rx={3} fill={C.cream} />
							<rect x={10 + i * 38} y={124} width={22} height={16} rx={3} fill={C.cream} />
						</g>
					))}
					{[0, 1, 2].map((i) => {
						const c = frames[(half * 3 + i + Math.floor(t * 2)) % frames.length];
						return (
							<g key={i}>
								<rect x={12 + i * 124} y={34} width={110} height={82} rx={6} fill={c} />
								<circle cx={44 + i * 124} cy={62} r={12} fill={rgba(C.white, 0.6)} />
								<path d={`M ${16 + i * 124} 112 L ${56 + i * 124} 78 L ${82 + i * 124} 98 L ${118 + i * 124} 70 L ${118 + i * 124} 112 Z`} fill={rgba(C.navy, 0.35)} />
							</g>
						);
					})}
				</g>
			))}
		</svg>
	);
};

/** Scissors; open 0..1 animates the blades. */
export const Scissors: React.FC<SvgProps & {open?: number}> = ({w, open = 0.5, style}) => {
	const a = 8 + open * 22;
	return (
		<svg {...box(w, 260, 200, style)}>
			<g transform="translate(110 100)">
				<g transform={`rotate(${-a})`}>
					<path d="M 0 0 L 150 -10 Q 160 -2 150 6 Z" fill={C.cream} stroke={C.creamShade} strokeWidth={3} />
					<circle cx={-62} cy={22} r={34} fill="none" stroke={C.gold} strokeWidth={16} />
					<path d="M 0 0 L -36 14" stroke={C.gold} strokeWidth={16} />
				</g>
				<g transform={`rotate(${a})`}>
					<path d="M 0 0 L 150 10 Q 160 2 150 -6 Z" fill={C.cream} stroke={C.creamShade} strokeWidth={3} />
					<circle cx={-62} cy={-22} r={34} fill="none" stroke={C.goldDeep} strokeWidth={16} />
					<path d="M 0 0 L -36 -14" stroke={C.goldDeep} strokeWidth={16} />
				</g>
				<circle r={9} fill={C.navy} />
			</g>
		</svg>
	);
};

/** Speaker blasting rings (pulse 0..1 from the music). */
export const Speaker: React.FC<SvgProps & {pulse?: number; t?: number}> = ({w, pulse = 0, t = 0, style}) => (
	<svg {...box(w, 300, 380, style)}>
		{[0, 1, 2].map((i) => {
			const k = (t * 1.3 + i / 3) % 1;
			return <circle key={i} cx={150} cy={250} r={90 + k * 120} fill="none" stroke={C.navy} strokeWidth={8} opacity={(1 - k) * 0.5} />;
		})}
		<rect x={40} y={20} width={220} height={350} rx={30} fill={C.navy} />
		<rect x={52} y={32} width={196} height={326} rx={22} fill={C.panel} />
		<circle cx={150} cy={104} r={44} fill={C.panel3} />
		<circle cx={150} cy={104} r={26 + pulse * 6} fill={C.cyan} />
		<circle cx={150} cy={104} r={10} fill={C.navy} />
		<circle cx={150} cy={250} r={88} fill={C.panel3} />
		<circle cx={150} cy={250} r={68 + pulse * 10} fill={C.cyanDeep} />
		<circle cx={150} cy={250} r={44 + pulse * 6} fill={C.cyan} />
		<circle cx={150} cy={250} r={18} fill={C.navy} />
		<circle cx={232} cy={46} r={7} fill={C.gold} />
	</svg>
);

/** Studio microphone on a stand. */
export const Mic: React.FC<SvgProps> = ({w, style}) => (
	<svg {...box(w, 160, 300, style)}>
		<rect x={46} y={10} width={68} height={130} rx={34} fill={C.cream} />
		{[40, 60, 80, 100].map((y) => (
			<rect key={y} x={56} y={y} width={48} height={5} rx={2.5} fill={C.creamShade} />
		))}
		<rect x={40} y={128} width={80} height={22} rx={8} fill={C.navy} />
		<path d="M 30 100 Q 30 190 80 190 Q 130 190 130 100" fill="none" stroke={C.navy} strokeWidth={10} strokeLinecap="round" />
		<rect x={74} y={188} width={12} height={84} fill={C.navy} />
		<rect x={30} y={268} width={100} height={16} rx={8} fill={C.navy} />
	</svg>
);

/** Megaphone with sound lines — "خلّي محتواك يتكلّم". */
export const Megaphone: React.FC<SvgProps & {t?: number}> = ({w, t = 0, style}) => (
	<svg {...box(w, 340, 240, style)}>
		<path d="M 60 90 L 220 20 L 220 220 L 60 150 Z" fill={C.cyan} />
		<path d="M 220 20 L 236 12 L 236 228 L 220 220 Z" fill={C.cyanDeep} />
		<rect x={20} y={84} width={50} height={72} rx={12} fill={C.navy} />
		<path d="M 90 150 L 110 210 L 140 210 L 124 156 Z" fill={C.navy} />
		<rect x={70} y={96} width={14} height={48} fill={C.gold} />
		{[0, 1, 2].map((i) => {
			const k = (t * 2 + i / 3) % 1;
			const r = 30 + k * 60;
			return <path key={i} d={`M ${250 + r * 0.3} ${120 - r} Q ${270 + r} 120 ${250 + r * 0.3} ${120 + r}`} fill="none" stroke={C.gold} strokeWidth={8} strokeLinecap="round" opacity={1 - k} />;
		})}
	</svg>
);

/** Paper plane. */
export const PaperPlane: React.FC<SvgProps> = ({w, style}) => (
	<svg {...box(w, 220, 170, style)}>
		<path d="M 10 80 L 210 10 L 120 160 L 96 104 Z" fill={C.cream} />
		<path d="M 96 104 L 210 10 L 120 160 Z" fill={C.creamShade} />
		<path d="M 96 104 L 100 150 L 120 124 Z" fill={C.steel3} />
	</svg>
);

/** Beach scene — "ريّح دماغك": umbrella + lounge chair + sun. */
export const BeachChill: React.FC<SvgProps & {t?: number}> = ({w, t = 0, style}) => (
	<svg {...box(w, 520, 420, style)}>
		<circle cx={430} cy={70} r={46} fill={C.gold} />
		{Array.from({length: 10}).map((_, i) => {
			const a = (i / 10) * Math.PI * 2 + t * 0.5;
			return <line key={i} x1={430 + Math.cos(a) * 60} y1={70 + Math.sin(a) * 60} x2={430 + Math.cos(a) * 80} y2={70 + Math.sin(a) * 80} stroke={C.gold} strokeWidth={8} strokeLinecap="round" />;
		})}
		<rect x={0} y={360} width={520} height={60} rx={20} fill={C.goldSoft} />
		{/* umbrella */}
		<rect x={150} y={110} width={10} height={260} fill={C.navy} transform="rotate(8 155 240)" />
		<g transform="rotate(8 155 110)">
			{Array.from({length: 6}).map((_, i) => (
				<path key={i} d={`M 155 110 L ${35 + i * 40} 180 Q ${55 + i * 40} 168 ${75 + i * 40} 180 Z`} fill={i % 2 ? C.cream : C.cyan} />
			))}
			<path d="M 35 180 Q 155 30 275 180" fill="none" stroke={C.cyanDeep} strokeWidth={4} />
		</g>
		{/* lounge chair */}
		<path d="M 200 300 L 300 230 L 330 250 L 236 316 Z" fill={C.gold} />
		<path d="M 236 316 L 430 316 L 436 334 L 240 334 Z" fill={C.goldDeep} />
		{[0, 1, 2].map((i) => (
			<path key={i} d={`M ${226 + i * 30} ${282 - i * 20} L ${252 + i * 30} ${300 - i * 22}`} stroke={C.cream} strokeWidth={8} opacity={0.6} />
		))}
		<line x1={250} y1={334} x2={240} y2={364} stroke={C.navy} strokeWidth={8} />
		<line x1={420} y1={334} x2={430} y2={364} stroke={C.navy} strokeWidth={8} />
	</svg>
);

/** Confetti burst in brand colours (p 0..1 since the pop). */
export const Confetti: React.FC<{p: number; spread?: number}> = ({p, spread = 520}) => {
	if (p <= 0 || p >= 1) return null;
	const cols = [C.cyan, C.gold, C.cream, C.goldSoft, C.cyanSoft];
	return (
		<svg width={1} height={1} style={{position: 'absolute', overflow: 'visible'}}>
			{Array.from({length: 80}).map((_, i) => {
				const a = (i * 137.5 * Math.PI) / 180;
				const v = 0.45 + ((i * 53) % 100) / 180;
				const x = Math.cos(a) * spread * v * p;
				const y = Math.sin(a) * spread * v * p * 0.8 + p * p * 520;
				const r = i * 47 + p * 720 * (i % 2 ? 1 : -1);
				return (
					<rect key={i} x={x - 9} y={y - 5} width={i % 3 ? 18 : 12} height={i % 3 ? 10 : 12} rx={i % 3 ? 2 : 6} fill={cols[i % cols.length]} transform={`rotate(${r} ${x} ${y})`} opacity={1 - Math.max(0, p - 0.75) * 4} />
				);
			})}
		</svg>
	);
};
