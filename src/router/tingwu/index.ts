import Router from '@koa/router';

import { registerConvertRoutes } from './convert/index.js';
import { registerTranscriptRoutes } from './transcript/index.js';

export function registerTingwuRoutes(router: Router) {
  const tingwuRouter = new Router({ prefix: '/tingwu' });
  registerTranscriptRoutes(tingwuRouter);
  registerConvertRoutes(tingwuRouter);
  router.use(tingwuRouter.routes(), tingwuRouter.allowedMethods());
}
