import HttpError from 'http-errors';
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
      } else if (HttpError.isHttpError(err)) {
        ctx.status = err.status;
        ctx.body = { error: err.message };
      } else {
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
      }
      ctx.log.error(err);
    }
  };
}
