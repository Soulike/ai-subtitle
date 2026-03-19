import { z } from 'zod';

export const convertAssSchema = z.object({
  transcriptionUrl: z.url(),
});
