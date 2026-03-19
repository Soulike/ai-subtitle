import type { Readable } from 'node:stream';

import { ZodError } from 'zod';

import { AppError } from '@/types/error.js';

import { generateAss } from './helper/ass-generator.js';
import { convertParagraphsToLines } from './helper/segmentation.js';
import { tingwuTranscriptionSchema } from './type/tingwu-transcription.js';

const MAX_DURATION_MS_PER_LINE = 5000;

export const subtitleService = {
  async convertToAss(transcriptionUrl: string): Promise<Readable> {
    let response: Response;
    try {
      response = await fetch(transcriptionUrl);
    } catch {
      throw new AppError(400, 'Failed to fetch transcription URL');
    }

    if (!response.ok) {
      throw new AppError(
        400,
        `Transcription URL returned HTTP ${String(response.status)}`,
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new AppError(400, 'Transcription URL did not return valid JSON');
    }

    try {
      const data = tingwuTranscriptionSchema.parse(json);
      const lines = convertParagraphsToLines(
        data.Transcription.Paragraphs,
        MAX_DURATION_MS_PER_LINE,
      );

      return generateAss(lines);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new AppError(400, 'Invalid transcription JSON format');
      }
      throw err;
    }
  },
};
