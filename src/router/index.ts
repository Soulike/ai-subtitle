import Router from '@koa/router';

import { registerHealthRoutes } from './health.js';
import { registerTranscriptRoutes } from './transcript/index.js';

const router = new Router();
registerHealthRoutes(router);
registerTranscriptRoutes(router);

export { router };
