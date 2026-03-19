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
└── api/            # External service communication
```

Layers only depend on downward: Router → Service → API. Never reverse.

## Conventions

- No default exports (config files exempted)
- Import order enforced
- Relative imports use `.js` extension (nodenext resolution)
- Use `@/*` alias for `src/` when importing across modules. In-module imports use relative paths.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- Update all relevant CLAUDE.md files when conventions or patterns change
- Run lint, format check, and test when major changes are done

## Commands

Check package.json.
