import Router from '@koa/router';

import { registerHealthRoutes } from './health.js';

const router = new Router();
registerHealthRoutes(router);

export { router };
