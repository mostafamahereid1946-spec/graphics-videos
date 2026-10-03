/**
 * COREVIA brand tokens — HEX values extracted from the vector data of the printed business card
 * (corevia_pulse_frame_final_a4_duplex_long_edge.pdf). Tints marked "derived" are mixes of those
 * colours used for flat-illustration shading.
 */
export const C = {
	navy: '#071820', // card front background, name text
	navyDeep: '#06151C', // panel gradient end
	panel: '#0B2630', // panel gradient start
	panel2: '#10313D', // derived
	panel3: '#173F4D', // derived
	panel4: '#21566A', // derived
	slate: '#273E47', // "Digital Solutions Engineer"
	cyan: '#17D5E7', // C-ring, wordmark, zig-zag pulse
	cyanDeep: '#0E9FB0', // derived shade
	cyanSoft: '#9BEEF6', // derived tint
	gold: '#D5A23E', // check mark, corner bars, wedge
	goldDeep: '#AA7622', // "FREELANCE"
	goldSoft: '#EDCB82', // derived tint
	cream: '#F7F5EE', // back info panel
	creamShade: '#E6E1D3', // derived
	steel: '#5F6A6B',
	steel2: '#879194',
	steel3: '#AEB4B1',
	white: '#FFFFFF',
} as const;

export const W = 1080;
export const H = 1920;
export const FPS = 30;

/**
 * Text-safe area. The brief asks for >=150 px top / >=170 px bottom / >=60 px sides; Meta's Reels-ad
 * overlay (profile row, caption, CTA button) covers ~14% top and ~35% bottom, so vital text stays in
 * this tighter box, which satisfies both.
 */
export const SAFE = {top: 270, bottom: 1250, left: 70, right: 1010} as const;

export const FONT = {
	ar: 'Alexandria, Outfit, sans-serif',
	display: 'Outfit, Alexandria, sans-serif',
	mono: '"DM Mono", monospace',
} as const;

export const rgba = (hex: string, a: number) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
