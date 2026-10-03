import type {EmoName} from '../art/Emo';
import {line, type Word} from './index';

/** Which 3D emoji pops beside which spoken word (line id -> word index -> emoji). */
export const WORD_EMOJI: Record<string, Record<number, EmoName>> = {
	hook: {1: 'clapper', 2: 'magnet', 3: 'eyes', 4: 'rocket'},
	p1: {2: 'movie_camera'},
	p2: {2: 'sparkles'},
	p3: {1: 'speech'},
	p4: {1: 'headphone'},
	p5: {2: 'exploding'},
	s2a: {2: 'hundred'},
	s2b: {1: 'gift'},
	r1: {1: 'scissors'},
	r2: {1: 'palette'},
	r3: {1: 'speech'},
	r4: {0: 'heart_eyes', 2: 'star_struck'},
	r5: {1: 'speaker'},
	c1: {3: 'film', 5: 'calendar'},
	c2: {2: 'check'},
	k1: {2: 'thinking'},
	k2: {1: 'sunglasses', 4: 'biceps'},
	a1: {1: 'envelope', 5: 'megaphone'},
};

export type EWord = Word & {emoji?: EmoName};

export const withEmoji = (id: string): EWord[] => line(id).words.map((w, i) => ({...w, emoji: WORD_EMOJI[id]?.[i]}));
