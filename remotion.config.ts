import {Config} from '@remotion/cli/config';

// Output tuned for Meta Reels ads: H.264 High, yuv420p, AAC 320k.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(16);
Config.setX264Preset('slow');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
Config.setDelayRenderTimeoutInMilliseconds(60000);

// Optional: point Remotion at a preinstalled Chrome Headless Shell (e.g. in CI / sandboxes).
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
	Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
if (process.env.REMOTION_CONCURRENCY) {
	Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY));
}
