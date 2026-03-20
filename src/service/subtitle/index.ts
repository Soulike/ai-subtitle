import { Readable } from 'node:stream';

import type { TingwuTranscription } from '@/types/tingwu.js';

import { generateAss } from './helper/ass-generator.js';
import { convertParagraphsToLines } from './helper/segmentation.js';

const MAX_DURATION_MS_PER_LINE = 5000;

export const subtitleService = {
  convertToAss(transcription: TingwuTranscription): Readable {
    const lines = convertParagraphsToLines(
      transcription.Transcription.Paragraphs,
      MAX_DURATION_MS_PER_LINE,
    );

    return generateAss(lines);
  },
};
