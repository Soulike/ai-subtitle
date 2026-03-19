import type { File } from 'formidable';
import Koa from 'koa';

import { AppError } from '@/types/error.js';

export function parseUploadedFiles(ctx: Koa.Context): File {
  const { files } = ctx.request;
  if (!files?.file) {
    throw new AppError(400, 'Missing "file" in multipart upload');
  }

  return Array.isArray(files.file) ? files.file[0] : files.file;
}
