# Router Layer

## Pattern

A single central router is created in `index.ts`. Each feature file exports a `register*Routes(router)` function that registers its routes on the shared router.

## Adding Routes

1. Create a new file in `src/router/` (e.g. `subtitle.ts`)
2. Export a function that takes a `Router` and registers routes on it
3. Import and call it in `src/router/index.ts`

```ts
// src/router/subtitle.ts
import type Router from '@koa/router';

export function registerSubtitleRoutes(router: Router) {
  router.post('/subtitle', async (ctx) => {
    // call service layer
  });
}
```

```ts
// src/router/index.ts
import { registerSubtitleRoutes } from './subtitle.js';

registerSubtitleRoutes(router);
```

## Rules

- Routers parse requests and set responses — no business logic
- Call the service layer for business logic
- Do not call the API layer directly
