import type Koa from 'koa';

import { AppError } from '@/types/error.js';

export function errorHandler(): Koa.Middleware {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (err instanceof AppError) {
        ctx.status = err.statusCode;
        ctx.body = { error: err.message };
        if (err.statusCode >= 500) {
          ctx.log.error(err);
        }
      } else {
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
        ctx.log.error(err);
      }
    }
  };
}
