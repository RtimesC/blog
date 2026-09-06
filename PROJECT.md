# Project

_Last reviewed: 2026-09-04_

## Purpose

`τaotao` is a public-learning notebook about the path from mechatronics to robotics and AI. It records real learning, experiments, technical decisions, small projects, and reflections in a form that is useful to its future author and legible to interested readers or collaborators.

The active product is the 2D React/Vite blog on `main`. The earlier 3D experiment is retained only in Git history and `codex/3d-pending`; it is neither a parallel product nor a deployment target.

## Content principle

One article is one independently readable record that can be understood in a few minutes. It should stay about one coherent thing, but it is not a fixed article template.

An article may document a project step, technical question, experiment, observation, failure, unresolved uncertainty, or viewpoint. It does not need to answer a prescribed set of questions, nor must it be a completed project. When a topic develops into a distinct new stage or idea, create another article instead of making the previous record carry unrelated material.

The homepage is organized by working state rather than conventional content type:

- `observing`: material currently being learned or examined;
- `building`: authored work, experiments, and implementations;
- `questioning`: unresolved questions and uncertainties.

These states describe where a record sits in the learning process. They are not claims about completion or technical validation.

## Experience

- The homepage opens with the animated `Welcome τaotao's blog` identity. Its header keeps a normal-flow `About` entry at the far right and a theme selector.
- A wide Hero surface presents published article covers. One article uses a slow image drift; multiple articles form a continuous horizontal reel.
- A thin frosted navigation switches between `Observing`, `Building`, and `Questioning` without displaying artificial sequence numbers or content counts.
- The selected state shows large article cards with a 16:9 poster above a distinct title-and-keywords area. The entire card links to the article. Authors and abstracts appear only on article pages. Shared styles live in `src/styles/article-list.css`.
- Empty categories explicitly say that no articles are available.
- An article opens `/articles/<slug>`, where the full Markdown record appears with its context, status, and scope note.
- The existing published article is `PhyAgent`, a local OPC competition POC in the `building` state.
- Light and dark themes, keyboard focus, touch interaction, and reduced-motion support are implemented.

## Content model

Published records live at `src/content/articles/*.article.md`.

- The YAML front matter creates the homepage card and article header.
- The required `state` field drives home-page selection and filtering. It accepts only `observing`, `building`, or `questioning`.
- The Markdown body creates the article itself.
- `src/content/articles.js` validates states, required fields, slugs, non-empty bodies, integer ordering, and unique slugs at build time.
- The exact authoring format is maintained in [src/content/articles/README.md](src/content/articles/README.md).
- Article pages use a fixed paper-style template in `src/styles/article.css`. The template renders title, authors, abstract, keywords, body, and references. Visual parameters and author/AI editing boundaries are maintained in [ARTICLE_STYLE_GUIDE.md](ARTICLE_STYLE_GUIDE.md); the first implementation awaits Tao’s visual acceptance.

For content with factual or technical claims, distinguish clearly between `已实现`, `演示模拟`, and `待实测`. A local build, demo, or artifact is not evidence of production deployment or real-world validation.

## Implementation

- Stack: React, Vite, Tailwind CSS 4, and local shadcn/ui primitives.
- Article routes are client-rendered; `vercel.json` rewrites requests to `/index.html` so direct article visits and refreshes work on Vercel.
- Content is versioned Markdown. A private editor, database, and content-history interface are not part of the current product.
- `src/content/about-me.md` is a deliberately incomplete author draft. The homepage exposes its `/about` route from the far-right header entry; the entry scrolls away with the page, alongside the theme selector.
- The visual language uses a restrained background, editorial serif typography, lightly frosted state navigation, poster-and-title article cards, the animated identity, and the theme selector.

## Working rules

1. `main` is the sole active production branch for the 2D blog.
2. Create short-lived feature branches from `main` using the `codex/` prefix, then merge reviewed work back to `main`.
3. Do not merge `codex/3d-pending` into `main` unless a new product decision explicitly reopens the 3D direction.
4. Verify the active branch before work with `git branch --show-current`.
5. Run `npm run lint`, `npm run build`, and `git diff --check` for code or content-system changes. Visual acceptance remains Tao's decision.

## Open decisions

- Decide the language and publishing rhythm after several real records exist. Abstracts and article bodies may follow the needs of their content.
- Reassess Hero repetition and reel timing after more than one real article exists.
- Defer cross-article relationships and archive views until published records reveal a real need.
- Keep a private editor and database as future options, not current requirements.

## Related documents

- [README.md](README.md): project entry and local commands.
- [src/content/articles/README.md](src/content/articles/README.md): article-file authoring contract.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md): third-party attribution and asset restrictions.

## Theme behavior

All pages use the same header appearance control: Light, Dark, or Auto (system), with icons and a sliding selection highlight. With no valid saved choice the site follows system appearance. Manual choices persist locally; system changes update the effective theme only in system mode. Changes synchronize across tabs, and unavailable browser storage does not prevent switching for the current session. The control stays in normal header flow and has native button keyboard and touch behavior, visible focus, pressed states, and reduced-motion support; there is no scroll-direction hiding.
