# NovaMarket Frontend

React 19 + TypeScript + Vite single-page application for the NovaMarket storefront.

This project is **already scaffolded**. Clone it and install dependencies — do **not**
run `npm create vite` over it.

## Quick path

First-time setup from an existing checkout. Replace `REPOSITORY_URL` with the
actual repository URL, then clone:

```bash
REPOSITORY_URL="paste-the-repository-url-here"
git clone "$REPOSITORY_URL"
cd novamarket-frontend
```

Next, get Node 24 + npm 11. With `nvm`:

```bash
nvm install # installs Node 24 per `.nvmrc` if not already installed
nvm use # selects Node 24 per `.nvmrc`
```

Without `nvm`, install Node 24 and npm 11 with your own version manager and
skip the two commands above. Then, in both cases, verify and start:

```bash
node --version # expect v24.x
npm --version # expect 11.x
npm ci
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). `Ctrl+C` stops the server.

`npm ci` installs exactly what `package-lock.json` pins. The `prepare` script
(`husky`) installs the Git hooks automatically on a fresh `npm ci` / `npm install`.

## Prerequisites

- Node.js 24 — `.nvmrc` contains `24`; `package.json` `engines` requires
  `"node": ">=24"`.
- npm 11 — `engines` requires `"npm": ">=11"`. Use the npm bundled with Node 24;
  do not use yarn/pnpm for this repo.
- `nvm` (or equivalent) is recommended so `nvm use` picks up `.nvmrc`, but any
  install providing Node 24 + npm 11 works. Verify with the commands above.

Stack baseline (see `package.json`): React 19 + React DOM 19, React Router 7
declarative SPA (`BrowserRouter` in `src/main.tsx`, `Routes` in
`src/routes/AppRoutes.tsx`), Vite 6, TypeScript ~5.7, Tailwind CSS 4 via the
Vite plugin, Vitest 3 + React Testing Library + jsdom. The HTTP client and the
UI component library are **undecided** — do not add either without a team decision.

## Install guidance

| Situation                                            | Command                                                   |
| ---------------------------------------------------- | --------------------------------------------------------- |
| Clean checkout (first clone, CI, new machine)        | `npm ci`                                                  |
| Intentionally adding/removing/upgrading a dependency | `npm install PACKAGE_NAME` / `npm uninstall PACKAGE_NAME` |

Replace `PACKAGE_NAME` with the agreed registry package name (e.g.
`npm install zod`).

Rules:

- Prefer `npm ci` for setup. It requires the committed `package-lock.json` and
  fails fast if manifest and lockfile disagree.
- Use `npm install` only when you mean to change dependencies. When you do,
  commit **both** `package.json` **and** `package-lock.json` in the same commit.
- Never commit `node_modules/` or `dist/` (both are git-ignored).

## Configuration and environment

There is nothing to configure yet:

- No `.env` file, no `VITE_*` variable, and no API endpoint is required to run,
  test, lint, or build. No `tailwind.config.*` file is required either (see
  Styling below).
- Consequently there are no secrets to obtain or export. If backend integration
  later introduces environment variables, this section must name each variable,
  its purpose, and a safe local value — never commit real secrets.

## Scripts

All scripts come from `package.json`:

| Command                | What it does                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with hot reload.                                               |
| `npm run build`        | Type-check (`tsc -b`) then emit the production bundle to `dist/`. Fails on type errors.  |
| `npm run preview`      | Serve the production `dist/` build locally for a final check. Run `npm run build` first. |
| `npm test`             | Run Vitest in **watch** mode (re-runs on file changes).                                  |
| `npm test -- --run`    | Run the test suite **once** (CI / pre-push equivalent).                                  |
| `npm run typecheck`    | Type-check with `tsc --noEmit` (no output files).                                        |
| `npm run lint`         | Lint the repo with ESLint (`eslint .`).                                                  |
| `npm run lint:fix`     | Lint and auto-fix what ESLint can fix safely.                                            |
| `npm run format`       | Rewrite every supported file with Prettier (`prettier --write .`).                       |
| `npm run format:check` | Verify Prettier formatting without changing files (`prettier --check .`).                |

There is no single combined script. The full local verification sequence is the
one `CONTRIBUTING.md` and the `pre-push` hook define:

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

## Project structure

Entry points and tested behavior live at the top of `src/`:

- `src/main.tsx` — mounts `<App />` inside `<BrowserRouter>` under `StrictMode`.
- `src/App.tsx` — renders the route tree.
- `src/App.test.tsx` — landing-page behavior test (2 tests, pass via `--run`).
- `src/index.css` — single `@import 'tailwindcss';` entry (Tailwind v4).
- `src/vite-env.d.ts` — Vite client types.
- `src/test/setup.ts` — Vitest/jsdom setup (referenced by `vite.config.ts`).

Feature folders and their responsibilities:

| Folder            | Present today                              | Responsibility                                                         |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| `src/pages/`      | `HomePage.tsx`                             | Route-level pages (one component per route).                           |
| `src/routes/`     | `AppRoutes.tsx` (`/` and `*` → `HomePage`) | React Router route definitions only, no data-fetching or layout logic. |
| `src/components/` | Empty scaffold                             | Shared, reusable UI components.                                        |
| `src/context/`    | Empty scaffold                             | React context providers.                                               |
| `src/hooks/`      | Empty scaffold                             | Shared React hooks.                                                    |
| `src/services/`   | Empty scaffold                             | API and external-service modules (client TBD).                         |
| `src/types/`      | Empty scaffold                             | Shared TypeScript types.                                               |
| `src/utils/`      | Empty scaffold                             | Small pure helper modules.                                             |

Only `pages/` and `routes/` contain behavior so far; the other folders are
reserved empty scaffolds so the team grows into them instead of inventing new
top-level locations.

Tooling and docs at the repo root: `vite.config.ts` (React + Tailwind plugins,
Vitest jsdom config), `tsconfig.app.json`, `eslint.config.js`,
`.prettierrc.json`, `.editorconfig`, `lint-staged.config.js`,
`commitlint.config.js`, `.husky/`, `CONTRIBUTING.md`, `.nvmrc`.

## Team conventions and quality gates

> Read this section before your first commit. Some items below are automated
> checks from checked-in configs and hooks; others are team workflow guidance
> (branching, commit size, review flow) that rely on agreement, not tooling.
> All hooks are **local**: they can be bypassed with `--no-verify`, and no
> server-side branch protection or CI is configured yet.

### Code style: what ESLint actually checks

`eslint.config.js` (flat config, `**/*.{ts,tsx}` only, ignores
`dist`, `coverage`, `node_modules`):

- `js.configs.recommended` — base JavaScript correctness rules.
- `typescript-eslint` `recommended` — the shared recommended TypeScript rule
  set (see the `typescript-eslint` docs for what that set covers).
- `eslint-plugin-react` `recommended` + `jsx-runtime` — React rules; the classic
  `react/prop-types` rule is **off** (TypeScript props cover it) and the React
  version is auto-detected.
- `eslint-plugin-react-hooks` `recommended-latest` — hooks rules of hooks and
  exhaustive deps.
- `react-refresh/only-export-components` (`warn`, `allowConstantExport: true`) —
  warns when a fast-refresh file mixes component and non-component exports.

Check it with `npm run lint`; auto-fix with `npm run lint:fix`.

### Formatting: Prettier + Tailwind class order

`.prettierrc.json` sets exactly:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Everything else is Prettier defaults. The Tailwind plugin additionally **sorts
Tailwind CSS classes** inside `className` attributes on every Prettier run, so
class order churn in diffs is expected and correct — do not reorder by hand.

`npm run format` writes; `npm run format:check` verifies (CI-style, no writes).

### Line endings and indentation: EditorConfig

`.editorconfig` (`root = true`) sets UTF-8, `lf` line endings, 2-space indent,
final newline, and trimmed trailing whitespace — picked up automatically by most
editors. The one exception: `[*.md]` keeps trailing whitespace (`trim_trailing_whitespace = false`)
because Markdown uses trailing double-space for hard line breaks.

### Types: strict TypeScript

`tsconfig.app.json` compiles `src` with `strict: true`,
`noUnusedLocals: true`, `noUnusedParameters: true`,
`noFallthroughCasesInSwitch: true`, and `noUncheckedSideEffectImports: true`
(target ES2022, `jsx: react-jsx`, `moduleResolution: bundler`,
`verbatimModuleSyntax: true`). Unused variables/parameters and implicit `any`
fail both `npm run typecheck` (`tsc --noEmit`) and `npm run build`
(`tsc -b && vite build`).

### Pre-commit: lint-staged on staged files only

`.husky/pre-commit` runs `npx --no-install lint-staged`. `lint-staged.config.js`:

```js
export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{js,json,css,md}': ['prettier --write'],
};
```

Only **staged** files are touched, and lint-staged automatically stages the
fixes its tasks apply — do not run `git add` yourself for them. Keep commits
focused and let the hook fix style, not logic — after the hook runs, inspect
what will be committed with `git diff --cached` before finalizing.

### Commit messages: Conventional Commits via commitlint

`.husky/commit-msg` runs `npx --no-install commitlint --edit "$1"` against
`commitlint.config.js`, which extends `@commitlint/config-conventional`.
Format: `type(scope): short imperative summary`, e.g.:

```bash
feat(pages): add product listing
fix(routes): redirect unknown paths to home
chore(tooling): pin eslint 9 for react plugin peer range
docs(readme): expand onboarding and quality gates
```

Valid types include `feat`, `fix`, `chore`, `docs`, `test`, `refactor`,
`style`, `perf`, `ci`, `build`, `revert`. Keep the subject short, imperative,
and lowercase at the start (`add`, not `adds`/`Added`). A message like
`wip stuff` is rejected (exit 1) and blocks the commit.

### Branches and pre-push: what runs and what blocks

`.husky/pre-push` enforces, in order:

1. **Branch guard** — pushing from `main` is blocked (exit 1). Only
   `feat/*`, `fix/*`, `chore/*`, `docs/*` may push; any other branch name is
   blocked (exit 1).
2. **Full verification** — `npm run typecheck`, `npm run lint`,
   `npm test -- --run`, `npm run build`. Any failure blocks the push.

```bash
# Branch name is illustrative; use feat/*, fix/*, chore/*, or docs/*
git switch -c feat/product-catalog
# ... small conventional commits ...
git push -u origin feat/product-catalog
```

These are local hooks: `git push --no-verify` (or `--no-verify` on commit)
skips them, and no remote branch protection exists yet. Treat `main` as
protected by **team agreement**, not by the server.

### Styling: Tailwind v4, no config file

`vite.config.ts` registers the official `@tailwindcss/vite` plugin alongside
`@vitejs/plugin-react`, and `src/index.css` contains only
`@import 'tailwindcss';`. That is the whole Tailwind setup: utilities are
generated from CSS usage, so **no `tailwind.config.*` file is required or
present**. Do not add one unless the team explicitly decides to; prefer CSS
`@theme` customization per the Tailwind v4 docs when that day comes.

### Routing deployment note: SPA fallback

The app is a client-only SPA: `BrowserRouter` owns the URL after the initial
page load. Any host serving the production `dist/` build must rewrite unknown
paths (e.g. a refresh on `/products`) back to `index.html` so the router can
resolve them — otherwise deep links return 404. How to configure that rewrite
depends on the (not yet selected) hosting setup.

## Recommended team workflow

1. `git switch main && git pull` (once a remote exists), then
   `git switch -c feat/product-catalog` (branch name is illustrative; use
   `feat/*`, `fix/*`, `chore/*`, or `docs/*`).
2. Make small, focused changes; keep each commit one work unit with tests/docs
   for that unit included.
3. Commit with a Conventional Commit message (the `commit-msg` hook validates).
4. Before pushing — or just push and let the hook do it — run the four
   verification commands listed in Scripts.
5. `git push -u origin feat/product-catalog` (branch name is illustrative;
   never push `main` directly), open a PR,
   wait for checks/review, merge. Small PRs review faster than large ones.

## Troubleshooting

| Symptom                                        | Likely cause and fix                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Wrong Node/npm version                         | `nvm install` then `nvm use` (or install Node 24 manually). `engines` requires Node ≥ 24, npm ≥ 11.                        |
| `npm ci` fails on lockfile mismatch            | Someone changed `package.json` without committing the lockfile. Run `npm install` to re-resolve, then commit both files.   |
| `npm run build` fails on types but `dev` works | Vite dev transpiles without full type-checking; `tsc -b` is stricter. Run `npm run typecheck` and fix the reported errors. |
| Commit blocked by commitlint                   | Message is not Conventional Commits. Reword to `type(scope): summary` (see examples above).                                |
| Push blocked from `main` or odd branch name    | Branch off with an allowed name: `git switch -c feat/product-catalog`; never force-push `main`.                            |
| Push blocked by typecheck/lint/tests/build     | Fix the failing command locally and push again. Do not `--no-verify` to silence a real failure.                            |
| Prettier keeps reordering classes              | Expected: `prettier-plugin-tailwindcss` sorts Tailwind classes. Accept its order.                                          |
| Deep link 404 on a deployed build              | Host is not rewriting unknown paths to `index.html` (SPA fallback). Configure the rewrite on the host.                     |

See `CONTRIBUTING.md` for the short contributor version of the branch, commit,
and hook rules.
