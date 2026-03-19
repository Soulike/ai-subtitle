import type Router from '@koa/router';

import { parseBody } from '@/router/helpers/parse-body.js';
import { subtitleService } from '@/service/subtitle/index.js';

import { convertAssSchema } from './schema.js';

export function registerConvertRoutes(router: Router) {
  router.post('/convert/ass', async (ctx) => {
    const { transcriptionUrl } = parseBody(ctx.request.body, convertAssSchema);

    const ass = await subtitleService.convertToAss(transcriptionUrl);

    ctx.type = 'text/x-ssa';
    ctx.body = ass;
  });
}
