import { createReadStream } from 'node:fs';

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

    const taskId = await transcriptService.createTask(
      createReadStream(file.filepath),
      file.originalFilename ?? 'audio',
      sourceLanguage,
    );

    ctx.body = { taskId };
  });

  router.get('/transcript/:taskId', async (ctx) => {
    const { taskId } = ctx.params;
    ctx.body = await transcriptService.getTaskStatus(taskId);
  });
}
