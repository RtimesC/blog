# Branch boundaries

`main` is the single active production line for the 2D learning notebook. The earlier spatial experiment is retained only as a future reference; it is not a parallel product or deployment target.

## `main` — active 2D blog

- Owns the React/Vite learning notebook, its Markdown articles, and the production deployment.
- Receives reviewed feature work through pull requests.
- Uses Tailwind CSS 4 and the local UI primitives in `src/components/ui/`.

## `codex/*` — short-lived feature branches

- Start feature work from `main`, for example `codex/home-link`.
- Open a pull request back to `main` after local verification and preview review.
- Delete the feature branch after it has merged.

## `codex/3d-pending` — retained spatial snapshot

- Preserves the earlier spatial experiment for recovery and future exploration.
- Is not deployed and must not receive routine 2D blog work.
- A future 3D restart requires an explicit product decision, a separate deployment target, and a new verification plan before code is reused.

## Working rules

1. Make all current blog changes against `main` through a short-lived feature branch.
2. Do not merge `codex/3d-pending` into `main` by default.
3. Configure the 2D Vercel project to use `main` as its production branch.
4. Confirm the active branch before starting work:

   ```bash
   git branch --show-current
   ```
