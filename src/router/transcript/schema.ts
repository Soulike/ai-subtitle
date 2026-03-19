import { z } from 'zod';

export const createTranscriptSchema = z.object({
  sourceLanguage: z.string(),
});
