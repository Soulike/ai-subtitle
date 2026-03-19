import type { File } from 'formidable';
import type Koa from 'koa';

import { AppError } from '@/types/error.js';

export function parseUploadedFiles(ctx: Koa.Context): File {
  const { files } = ctx.request;
  if (!files?.file) {
    throw new AppError(400, 'Missing "file" in multipart upload');
  }

  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!file) {
    throw new AppError(400, 'Missing "file" in multipart upload');
  }
  return file;
}
