import React from 'react';
import {Composition} from 'remotion';
import {CoreviaReel} from './CoreviaReel';
import {ArtSheet} from './dev/ArtSheet';
import {BrandSheet} from './dev/BrandSheet';
import {FPS, H, W} from './brand/tokens';
import {timeline} from './timeline';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="CoreviaReel"
			component={CoreviaReel}
			width={W}
			height={H}
			fps={FPS}
			durationInFrames={timeline.durationInFrames}
			defaultProps={{showSafeZones: false, withAudio: true}}
		/>
		<Composition
			id="SafeZoneQA"
			component={CoreviaReel}
			width={W}
			height={H}
			fps={FPS}
			durationInFrames={timeline.durationInFrames}
			defaultProps={{showSafeZones: true, withAudio: false}}
		/>
		<Composition id="BrandSheet" component={BrandSheet} width={W} height={H} fps={FPS} durationInFrames={60} />
		<Composition id="ArtSheet" component={ArtSheet} width={W} height={H} fps={FPS} durationInFrames={60} />
	</>
);
