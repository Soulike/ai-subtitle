import type { TingwuTranscription } from '@/types/tingwu.js';

import { TingwuTranscriptToAssConverter } from './helper/tingwu-transcript-to-ass-converter.js';

const MAX_DURATION_MS_PER_LINE = 5000;

export const subtitleService = {
  convertToAss(transcription: TingwuTranscription): Generator<string> {
    const converter = new TingwuTranscriptToAssConverter(
      transcription,
      MAX_DURATION_MS_PER_LINE,
    );
    return converter.generate();
  },
};
