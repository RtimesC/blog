# τaotao

A small public-learning notebook for robotics, AI, and the questions in between.

> `main` owns the active 2D Notes experience. The earlier 3D experiment is retained only in `codex/3d-pending`; see [BRANCHING.md](BRANCHING.md) before working with that snapshot.

## Stack

- React + Vite
- Tailwind CSS 4
- shadcn/ui primitives, kept in `src/components/ui/`
- Brand tokens, kept in `src/styles/app.css`

## Commands

- `npm run dev` — start the local workspace
- `npm run lint` — check source code
- `npm run build` — create a production build
- `npm run preview` — preview the production build

## Writing articles

Published cards and their article pages come from `src/content/articles/*.article.md`. See [the authoring guide](src/content/articles/README.md) for the required metadata and Markdown format.
