import { Readable } from 'node:stream';

import type Router from '@koa/router';

import { parseBody } from '@/router/helpers/parse-body.js';
import { subtitleService } from '@/service/subtitle/index.js';
import { tingwuTranscriptionSchema } from '@/types/tingwu.js';

export function registerConvertRoutes(router: Router) {
  router.post('/convert/ass', (ctx) => {
    const transcription = parseBody(
      ctx.request.body,
      tingwuTranscriptionSchema,
    );

    const ass = subtitleService.convertToAss(transcription);

    ctx.type = 'text/x-ssa';
    ctx.body = Readable.from(ass);
  });
}
