# AI Subtitle

A server for generating audio/video subtitles using AI-powered transcription.

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Aliyun](https://www.aliyun.com/) account with OSS and Tingwu enabled

## Getting Started

### Install dependencies

```sh
bun install
```

### Configure environment

```sh
cp .env.example .env
```

Edit `.env` and fill in your credentials. See `.env.example` for all required variables.

### Run the server

```sh
# Development (with hot reload)
bun run dev

# Production
bun run start
```

## API

### Health Check

```
GET /health
```

Returns `{ "status": "ok" }`.

### Create Transcript

```
POST /transcript
Content-Type: multipart/form-data
```

| Field            | Type   | Required | Description                                                                                                                                             |
| ---------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`           | file   | Yes      | Audio/video file                                                                                                                                        |
| `sourceLanguage` | string | Yes      | Source language code (e.g. `cn`, `en`). See [Tingwu API docs](https://help.aliyun.com/zh/tingwu/api-tingwu-2023-09-30-createtask) for supported values. |

**Response:**

```json
{ "taskId": "abc123" }
```

### Get Transcript Status

```
GET /transcript/:taskId
```

**Response:**

```json
{
  "status": "COMPLETE",
  "result": { "...": "..." }
}
```

When task fails, `errorCode` and `errorMessage` fields are included.

````

Task status values: `PENDING`, `RUNNING`, `COMPLETE`, `FAILED`.

## Development

```sh
# Lint
bun run lint

# Format
bun run format

# Type check
bun run typecheck

# Test
bun run test
````

## License

MIT
