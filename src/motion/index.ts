import {Easing, interpolate, spring, type SpringConfig} from 'remotion';
import {FPS} from '../brand/tokens';
import {timeline} from '../timeline';

/** seconds -> frame */
export const F = (s: number) => Math.round(s * FPS);

/** Spring presets — every move in the reel is a spring or an eased curve (no linear motion). */
export const SPR = {
	pop: {damping: 12, mass: 0.6, stiffness: 190}, // overshoot ~8%, settles in ~12 frames
	snappy: {damping: 20, mass: 0.6, stiffness: 230}, // fast, no visible overshoot
	soft: {damping: 24, mass: 1, stiffness: 95}, // camera / large panels
	bouncy: {damping: 9, mass: 0.7, stiffness: 170}, // elastic stickers
	heavy: {damping: 16, mass: 1.4, stiffness: 140}, // slams
} satisfies Record<string, Partial<SpringConfig>>;

/** Spring that starts at `atSec` (0 before, ~1 after). */
export const sprAt = (frame: number, atSec: number, cfg: Partial<SpringConfig> = SPR.snappy) =>
	spring({frame: frame - F(atSec), fps: FPS, config: cfg});

export const EASE = {
	out: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish out
	inOut: Easing.bezier(0.65, 0, 0.35, 1),
	in: Easing.bezier(0.7, 0, 0.84, 0),
	outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
	whip: Easing.bezier(0.83, 0, 0.17, 1),
} as const;

/** Eased 0..1 (or from..to) between two times in seconds, clamped. */
export const tween = (
	frame: number,
	aSec: number,
	bSec: number,
	from = 0,
	to = 1,
	ease: (t: number) => number = EASE.out,
) => {
	const a = F(aSec);
	const b = Math.max(a + 1, F(bSec));
	return interpolate(frame, [a, b], [from, to], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease,
	});
};

/** 0..1 visibility window with eased in/out edges (seconds). */
export const windowed = (frame: number, start: number, end: number, fadeIn = 0.2, fadeOut = 0.2) =>
	Math.min(tween(frame, start, start + fadeIn, 0, 1), tween(frame, end - fadeOut, end, 1, 0, EASE.inOut));

const KICKS = timeline.kicks ?? [];

/** Decaying 1 -> 0 pulse on every kick drum hit (for beat-synced bumps). */
export const kickPulse = (frame: number, decay = 0.12) => {
	const t = frame / FPS;
	let lo = 0;
	let hi = KICKS.length - 1;
	let last = -1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (KICKS[mid] <= t + 1e-6) {
			last = mid;
			lo = mid + 1;
		} else hi = mid - 1;
	}
	if (last < 0) return 0;
	return Math.exp(-(t - KICKS[last]) / decay);
};

/** Per-frame audio band levels (0..1, 12 bands) of the final mix, for audio-reactive graphics. */
export const levels = (frame: number): number[] => {
	const L = timeline.levels;
	if (!L || L.length === 0) return new Array(12).fill(0);
	return L[Math.max(0, Math.min(L.length - 1, frame))];
};

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};
