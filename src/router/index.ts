import Router from '@koa/router';

import { registerHealthRoutes } from './health.js';
import { registerTingwuRoutes } from './tingwu/index.js';

const router = new Router();
registerHealthRoutes(router);
registerTingwuRoutes(router);

export { router };
