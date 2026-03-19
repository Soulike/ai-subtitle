import type Router from '@koa/router';

export function registerHealthRoutes(router: Router) {
  router.get('/health', (ctx) => {
    ctx.body = { status: 'ok' };
  });
}
