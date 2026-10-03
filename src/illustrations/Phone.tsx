import React from 'react';
import {C, rgba} from '../brand/tokens';

/** Phone body in a 300 x 620 SVG box. Screen area: x 16..284, y 16..604 (r 34). */
export const PHONE = {w: 300, h: 620, sx: 16, sy: 16, sw: 268, sh: 588, sr: 34} as const;

export const PhoneBody: React.FC<{children?: React.ReactNode; screen?: string; id: string}> = ({
	children,
	screen = C.panel2,
	id,
}) => (
	<g>
		<defs>
			<clipPath id={`${id}-screen`}>
				<rect x={PHONE.sx} y={PHONE.sy} width={PHONE.sw} height={PHONE.sh} rx={PHONE.sr} />
			</clipPath>
			<linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor={C.panel4} />
				<stop offset="1" stopColor={C.panel} />
			</linearGradient>
		</defs>
		<rect x={0} y={0} width={PHONE.w} height={PHONE.h} rx={48} fill={`url(#${id}-body)`} />
		<rect x={3} y={3} width={PHONE.w - 6} height={PHONE.h - 6} rx={45} fill="none" stroke={rgba(C.cyan, 0.22)} strokeWidth={2} />
		<rect x={PHONE.sx} y={PHONE.sy} width={PHONE.sw} height={PHONE.sh} rx={PHONE.sr} fill={screen} />
		<g clipPath={`url(#${id}-screen)`}>{children}</g>
		<rect x={PHONE.w / 2 - 46} y={28} width={92} height={22} rx={11} fill={C.navyDeep} />
		<rect x={PHONE.w - 3} y={150} width={5} height={64} rx={2} fill={C.panel4} />
	</g>
);
