# Contributing to NovaMarket Frontend

This guide keeps four developers working on the same baseline without surprises.

## Setup

```bash
nvm use # or install Node 24, matching `.nvmrc` and `engines`
npm install
npm run dev
```

## Branch naming

Create work on a short-lived branch from `main`:

- `feat/<topic>` — new behavior
- `fix/<topic>` — bug fixes
- `chore/<topic>` — tooling, config, maintenance
- `docs/<topic>` — documentation only

Never commit or push directly from `main`. The local `pre-push` hook blocks it,
but local hooks are bypassable (`--no-verify`) and no server-side branch
protection is configured yet, so treat this as a team agreement, not a guarantee.

## Commits

Write Conventional Commit messages (`type(scope): summary`), for example
`feat(pages): add product listing`. The `commit-msg` hook validates every message
with commitlint; keep the subject short and imperative.

## Before pushing

The `pre-push` hook runs the full local verification on your branch:

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

You can run the same commands by hand at any time. `pre-commit` runs
lint-staged (ESLint `--fix` plus Prettier) on staged files only, so keep commits
focused and let the hook fix style, not logic.

## Formatting and linting

- Prettier is the formatter (`npm run format` writes, `npm run format:check` verifies).
- ESLint (flat config) covers TypeScript, React, and React Hooks (`npm run lint`).
- EditorConfig sets UTF-8, LF line endings, and 2-space indentation; most editors
  pick it up automatically.
