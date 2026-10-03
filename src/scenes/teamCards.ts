/** Shared layout of the four "you would have to hire…" panels (problem beat -> collapsed in the solution beat). */
export const CARD_W = 470;
export const CARD_H = 560;
export const TEAM = [
	{kind: 'editor', label: 'مونتير', kicker: 'EDITOR', x: 550, y: 560},
	{kind: 'motion', label: 'موشن', kicker: 'MOTION', x: 60, y: 560},
	{kind: 'captions', label: 'كابشن', kicker: 'CAPTIONS', x: 550, y: 1140},
	{kind: 'sound', label: 'صوت', kicker: 'SOUND', x: 60, y: 1140},
] as const;
