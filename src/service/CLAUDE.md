# Service Layer

## Pattern

Services are pure business logic functions. They receive plain data, process it, and return plain data.

## Adding a Service

1. Create a new file in `src/service/` (e.g. `subtitle.ts`)
2. Export named functions for each operation

```ts
// src/service/subtitle.ts
import { fetchTranscription } from '@/api/subtitle.js';

export async function processSubtitle(audioUrl: string) {
  const transcription = await fetchTranscription(audioUrl);
  // business logic here
  return transcription;
}
```

## Rules

- No Koa dependency — services must not import or use `ctx`
- Call the API layer for external service interactions
- Do not call the router layer
