import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Unicode ranges from the Fontsource subsets (so Arabic and Latin files of a family can coexist).
const ARABIC =
	'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC';
const LATIN =
	'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

type Face = {family: string; file: string; weight: string; unicodeRange?: string};

const faces: Face[] = [
	// Arabic display + captions (geometric companion to Outfit)
	...['500', '600', '700', '800', '900'].flatMap((w) => [
		{family: 'Alexandria', file: `alexandria-arabic-${w}-normal.woff2`, weight: w, unicodeRange: ARABIC},
		{family: 'Alexandria', file: `alexandria-latin-${w}-normal.woff2`, weight: w, unicodeRange: LATIN},
	]),
	// Brand Latin display (wordmark, names, numbers)
	...['500', '600', '700', '800'].map((w) => ({family: 'Outfit', file: `outfit-latin-${w}-normal.woff2`, weight: w})),
	// Ruqaa — the everyday Egyptian handwriting (sticky-note scribbles in the hook)
	{family: 'Aref Ruqaa', file: 'aref-ruqaa-arabic-700-normal.woff2', weight: '700', unicodeRange: ARABIC},
	// Brand mono (tracked labels)
	...['400', '500'].map((w) => ({family: 'DM Mono', file: `dm-mono-latin-${w}-normal.woff2`, weight: w})),
];

let started = false;

/** Registers every brand font once; Remotion's loadFont() holds rendering until each face is ready. */
export const loadBrandFonts = () => {
	if (started) return;
	started = true;
	for (const f of faces) {
		loadFont({
			family: f.family,
			url: staticFile(`fonts/${f.file}`),
			weight: f.weight,
			unicodeRange: f.unicodeRange,
			display: 'block',
		});
	}
};
