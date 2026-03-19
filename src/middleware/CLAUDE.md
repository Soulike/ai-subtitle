# Middleware Layer

## Pattern

Middleware functions use the factory pattern — export a function that returns `Koa.Middleware`.

```ts
import type Koa from 'koa';

export function myMiddleware(): Koa.Middleware {
  return async (ctx, next) => {
    // ...
    await next();
  };
}
```

Usage in `src/index.ts`:

```ts
app.use(myMiddleware());
```

## Rules

- Always use factory style (`app.use(middleware())`, not `app.use(middleware)`)
