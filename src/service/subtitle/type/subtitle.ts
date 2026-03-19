import type { TingwuWord } from './tingwu-transcription.js';

export interface Segment {
  start: number;
  end: number;
  text: string;
  words: TingwuWord[];
}

export interface SubtitleLine {
  start: number;
  end: number;
  text: string;
}
