# AI Subtitle

## Tech Stack

- Runtime: Bun
- Language: TypeScript
- Framework: Koa + @koa/router

## Project Structure

```
src/
├── index.ts        # App entry point
├── router/         # HTTP route handlers — call service layer
├── service/        # Business logic — call API layer
├── api/            # External service communication
├── middleware/      # Koa middleware
├── types/          # Shared types and error classes
└── logger.ts       # Pino logger instance
```

Layers only depend on downward: Router → Service → API. Never reverse.

## Conventions

- No default exports (config files exempted)
- File names use kebab-case (e.g. `error-handler.ts`)
- Import order enforced
- Relative imports use `.js` extension (nodenext resolution)
- Use `@/*` alias for `src/` when importing across modules. In-module imports use relative paths.
- No `console` usage. Use `ctx.log` in request context, or import `logger` from `@/logger.js` outside of requests.
- Use `assert` from `node:assert` for runtime invariants (e.g. required env vars). No non-null assertions (`!`) — use `assert` to narrow instead.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- Update all relevant CLAUDE.md files when conventions or patterns change. Do not repeat global conventions in subdirectory CLAUDE.md files.
- Run lint, format check, and test when major changes are done

## Commands

Check package.json.
