# τaotao's blog

A small public-learning notebook for robotics, AI, and the questions in between.

The active product, content principle, implementation boundaries, and branch rules are maintained in [PROJECT.md](PROJECT.md).

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

## Writing

Published records and their article pages come from `src/content/articles/*.article.md`. Each record declares one home-page state: `observing`, `building`, or `questioning`. See [the authoring guide](src/content/articles/README.md) for the required metadata and Markdown format.

The personal introduction draft lives in `src/content/about-me.md`. It is not yet connected to the visible home-page navigation.
