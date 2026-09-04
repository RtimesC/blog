# Project

_Last reviewed: 2026-09-04_

## Purpose

`τaotao` is a public-learning notebook about the path from mechatronics to robotics and AI. It records real learning, experiments, technical decisions, small projects, and reflections in a form that is useful to its future author and legible to interested readers or collaborators.

The active product is the 2D React/Vite blog on `main`. The earlier 3D experiment is retained only in Git history and `codex/3d-pending`; it is neither a parallel product nor a deployment target.

## Content principle

One card is one independently readable record that can be understood in a few minutes. It should stay about one coherent thing, but it is not a fixed article template.

A card may document a project step, technical question, experiment, observation, failure, unresolved uncertainty, or viewpoint. It does not need to answer a prescribed set of questions, nor must it be a completed project. When a topic develops into a distinct new stage or idea, create another card instead of making the previous record carry unrelated material.

The homepage is for discovery, not taxonomy. Do not create content categories such as `Article`, `Question`, or `Memo`.

## Experience

- The homepage opens with the animated `Hi, I'm τaotao.` identity and an editable current-state statement.
- A centered collection of equal-sized cards follows. Cards are the primary entry surface.
- Each card has two faces: a full-bleed cover with title and keywords on the front, and an English `Abstract` on a translucent frosted back.
- A card opens `/articles/<slug>`, where the full Markdown record appears with its context, status, and scope note.
- The existing published card is `PhyAgent`, a local OPC competition POC. New cards are added only when real content is ready; no empty placeholders.
- Light and dark themes, keyboard focus, touch interaction, and reduced-motion support are implemented.

## Content model

Published records live at `src/content/articles/*.article.md`.

- The YAML front matter creates the homepage card and article header.
- The Markdown body creates the article itself.
- `src/content/articles.js` validates required fields, slugs, non-empty bodies, integer ordering, and unique slugs at build time.
- The exact authoring format is maintained in [src/content/articles/README.md](src/content/articles/README.md).

For content with factual or technical claims, distinguish clearly between `已实现`, `演示模拟`, and `待实测`. A local build, demo, or artifact is not evidence of production deployment or real-world validation.

## Implementation

- Stack: React, Vite, Tailwind CSS 4, and local shadcn/ui primitives.
- The homepage current-state copy is `currentState` in `src/App.jsx`.
- Article routes are client-rendered; `vercel.json` rewrites requests to `/index.html` so direct article visits and refreshes work on Vercel.
- Content is versioned Markdown. A private editor, database, and content-history interface are not part of the current product.
- The visual language is intentionally spare: the page background, card covers, card flip, shared gradient buttons, and day/night switch are established implementation choices rather than a design system to expand casually.

## Working rules

1. `main` is the sole active production branch for the 2D blog.
2. Create short-lived feature branches from `main` using the `codex/` prefix, then merge reviewed work back to `main`.
3. Do not merge `codex/3d-pending` into `main` unless a new product decision explicitly reopens the 3D direction.
4. Verify the active branch before work with `git branch --show-current`.
5. Run `npm run lint`, `npm run build`, and `git diff --check` for code or content-system changes. Visual acceptance remains Tao's decision.

## Open decisions

- Decide the language and publishing rhythm after several real records exist. The current card abstract is English; article bodies may follow the needs of their content.
- Replace the current factory-floor cover only with a more representative asset whose provenance is clear.
- Defer deeper navigation, cross-article relationships, and learning-trajectory views until the published cards reveal a real need.
- Keep a private editor and database as future options, not current requirements.

## Related documents

- [README.md](README.md): project entry and local commands.
- [src/content/articles/README.md](src/content/articles/README.md): article-file authoring contract.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md): third-party attribution and asset restrictions.
