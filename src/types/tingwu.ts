import { z } from 'zod';

const tingwuWordSchema = z.object({
  Id: z.number(),
  SentenceId: z.number(),
  Start: z.number(),
  End: z.number(),
  Text: z.string(),
});

const tingwuParagraphSchema = z.object({
  ParagraphId: z.string(),
  SpeakerId: z.string(),
  Words: z.array(tingwuWordSchema),
});

export const tingwuTranscriptionSchema = z.object({
  Transcription: z.object({
    AudioInfo: z.object({
      Size: z.number(),
      Duration: z.number(),
      SampleRate: z.number(),
      Language: z.string(),
    }),
    Paragraphs: z.array(tingwuParagraphSchema),
  }),
});

export type TingwuTranscription = z.infer<typeof tingwuTranscriptionSchema>;
export type TingwuParagraph = z.infer<typeof tingwuParagraphSchema>;
export type TingwuWord = z.infer<typeof tingwuWordSchema>;
