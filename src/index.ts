import assert from 'node:assert';

import Koa from 'koa';
import { koaBody } from 'koa-body';
import koaPinoLogger from 'koa-pino-logger';

import { logger } from '@/logger.js';
import { errorHandler } from '@/middleware/error-handler.js';
import { router } from '@/router/index.js';

const app = new Koa();

app.use(errorHandler());
app.use(koaPinoLogger({ logger }));
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

const port = Number(process.env.PORT);
assert(port, 'PORT environment variable is required');

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
