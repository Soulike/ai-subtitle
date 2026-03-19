import type { z } from 'zod';

import { AppError } from '@/types/error.js';

export function parseBody<T extends z.ZodType>(
  body: unknown,
  schema: T,
): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join('; ');
    throw new AppError(400, message);
  }
  return result.data;
}
