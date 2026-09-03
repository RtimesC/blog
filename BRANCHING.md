# Branch boundaries

This repository intentionally maintains separate 2D and 3D experiences. They are not a staged migration of one application into the other.

## `main` — spatial 3D experience

- Owns the existing WebGL/React Three Fiber portfolio.
- Does not include Tailwind CSS or daisyUI.
- Changes here must preserve the 3D runtime, its asset policy, and its production checks.

## `codex/2dblog` — 2D workbench

- Owns the fresh 2D workbench and its `Frame → Build → Verify → Publish` workflow.
- Uses Tailwind CSS 4 and daisyUI 5, configured in `vite.config.js` and `src/styles/app.css`.
- Starts with no inherited portfolio or blog content; new work is defined inside this branch.

## `codex/3d-pending` — spatial snapshot

- Preserves the earlier switchable spatial/2D experiment for future reference.
- It is not the active 2D workbench branch and must not be treated as the daisyUI target.

## Working rules

1. Do not merge the 2D branch's Tailwind, daisyUI, package, Vite, or page changes into `main` by default.
2. A feature needed in both experiences is designed and implemented independently for each runtime.
3. Documentation that describes the branch boundary should be kept in both active branches; runtime-specific documentation stays with its owning branch.
4. Confirm the active branch before starting work:

   ```bash
   git branch --show-current
   ```
