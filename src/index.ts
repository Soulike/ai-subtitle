import Koa from 'koa';

import { router } from '@/router/index.js';

const app = new Koa();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
