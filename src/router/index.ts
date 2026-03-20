import Router from '@koa/router';

import { registerConvertRoutes } from './convert/index.js';
import { registerHealthRoutes } from './health.js';
import { registerTranscriptRoutes } from './transcript/index.js';

const router = new Router();
registerHealthRoutes(router);
registerTranscriptRoutes(router);
registerConvertRoutes(router);

export { router };
