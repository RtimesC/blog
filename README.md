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

## Content & Writing

文章的共用排版、作者与 AI 的编辑分工、预览和发布流程见 [Article 视觉排版与编辑规范](ARTICLE_STYLE_GUIDE.md)。

- **Technical Articles**: Published records and their article pages come from `src/content/articles/*.article.md`. See [the authoring guide](src/content/articles/README.md) for the required metadata and Markdown format.
- **IELTS Study Space**: A lightweight preparation workbench at `/ielts` focusing on Listening, Reading, and Writing.
  - Configuration & External Resources: `src/content/ielts/data.js`
  - Notes & Method Summaries: `src/content/ielts/notes/*.md` (YAML front matter + Markdown body)
- **About**: Personal introduction lives in `src/content/about-me.md`, connected to the top navigation at `/about`.
