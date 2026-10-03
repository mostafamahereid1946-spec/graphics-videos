// Render QA stills at given timestamps (seconds) with a single bundle.
// Usage: node scripts/qa-stills.mjs [composition] t1 t2 ...   (outputs to out/qa/)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const id = isNaN(Number(args[0])) ? args.shift() : 'SafeZoneQA';
const times = args.map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const composition = await selectComposition({serveUrl, id, browserExecutable});
fs.mkdirSync('out/qa', {recursive: true});
for (const t of times) {
	const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
	const output = `out/qa/${id}-${String(frame).padStart(4, '0')}.png`;
	await renderStill({composition, serveUrl, output, frame, browserExecutable, imageFormat: 'png'});
	console.log('wrote', output, `t=${t}s`);
}
