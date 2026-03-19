# API Layer

## Pattern

API functions handle communication with external services. They encapsulate HTTP calls, SDK usage, and response parsing, returning typed data. Group related functions using an object literal namespace.

## Adding an API

1. Create a new file in `src/api/` (e.g. `subtitle.ts`)
2. Export an object literal grouping related functions

```ts
// src/api/subtitle.ts
interface TranscriptionResult {
  text: string;
  segments: { start: number; end: number; text: string }[];
}

export const subtitle = {
  async fetchTranscription(audioUrl: string): Promise<TranscriptionResult> {
    // call external service
  },
};
```

## Rules

- Only handles external service communication
- Return typed data — no raw responses
- Do not call the router or service layer
