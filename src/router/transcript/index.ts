import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';

import type Router from '@koa/router';

import { parseUploadedFiles } from '@/router/helpers/file-parse.js';
import { parseBody } from '@/router/helpers/parse-body.js';
import { transcriptService } from '@/service/transcript.js';

import { createTranscriptSchema } from './schema.js';

export function registerTranscriptRoutes(router: Router) {
  router.post('/transcript', async (ctx) => {
    const file = parseUploadedFiles(ctx);
    const { sourceLanguage } = parseBody(
      ctx.request.body,
      createTranscriptSchema,
    );

    try {
      const taskId = await transcriptService.createTask(
        createReadStream(file.filepath),
        sourceLanguage,
      );

      ctx.body = { taskId };
    } finally {
      unlink(file.filepath).catch((err: unknown) => {
        ctx.log.warn(err, 'Failed to delete temp file');
      });
    }
  });

  router.get('/transcript/:taskId', async (ctx) => {
    const { taskId } = ctx.params;
    ctx.body = await transcriptService.getTaskStatus(taskId);
  });
}
