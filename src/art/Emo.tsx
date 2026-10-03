import React from 'react';
import {Img, staticFile} from 'remotion';

/** Microsoft Fluent 3D emoji (MIT licence) — see public/emoji/LICENSE-fluentui-emoji.txt */
export type EmoName =
	| 'artist' | 'beach' | 'bell' | 'biceps' | 'bolt' | 'brush' | 'calendar' | 'camera' | 'chair' | 'check'
	| 'clapper' | 'coffee' | 'crown' | 'dizzy' | 'envelope' | 'exploding' | 'eyes' | 'film' | 'fire' | 'gift'
	| 'headphone' | 'heart' | 'heart_eyes' | 'hundred' | 'incoming' | 'keyboard' | 'laptop' | 'loud' | 'magnet'
	| 'megaphone' | 'mic' | 'movie_camera' | 'package' | 'palette' | 'party' | 'pen' | 'people_hug' | 'phone'
	| 'point_down' | 'relieved' | 'rocket' | 'scissors' | 'singer' | 'sliders' | 'smile_hearts' | 'sparkles'
	| 'speaker' | 'speaking' | 'speech' | 'star' | 'star_struck' | 'sunglasses' | 'team' | 'technologist'
	| 'thinking' | 'thumbs_up' | 'trophy' | 'tv' | 'writing';

export const Emo: React.FC<{name: EmoName; size: number; style?: React.CSSProperties}> = ({name, size, style}) => (
	<Img
		src={staticFile(`emoji/${name}.png`)}
		style={{width: size, height: size, display: 'block', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.28))', ...style}}
	/>
);
