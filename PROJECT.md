# Project

_Last reviewed: 2026-09-04_

## Purpose

A personal knowledge space built primarily for its author and open to readers. Learning, practice, and writing help form a knowledge system and gradually develop technical confidence. The independent name and identity copy remain provisional; do not infer identity from the local username or existing sample article.

## Experience and content model

- Homepage: compact identity introduction, then a single article stream, with a clear technical visual style. Neutral colors, sans-serif typography, restrained blue accents, and whitespace instead of card borders.
- Each article presents title/date, a 16:9 cover, then clickable keywords. Abstracts appear only on article pages.
- Topics are indexed from existing keywords. Search matches title, abstract, keywords, and body and combines with keyword filtering.
- Content is unified as articles with freely organized Markdown bodies. Required metadata: slug, title, publishedAt, abstract, keywords, cover. Authors and references are optional; no empty reference section appears. State is no longer required.
- Optional revisedAt records the most recent substantial revision. Sort descending by revisedAt or publishedAt, then slug. Each article appears once. Routine edits do not alter these dates.
- Article sources remain in src/content/articles/*.article.md. Their authoring contract is in src/content/articles/README.md.
- About content is existing material and still needs a separate identity review. Homepage name and introduction are provisional.
- Visual acceptance remains the author's decision.

## Implementation

- Stack: React, Vite, Tailwind CSS 4, and local shadcn/ui primitives.
- Article routes are client-rendered; `vercel.json` rewrites requests to `/index.html` so direct article visits and refreshes work on Vercel.
- Content is versioned Markdown. A private editor, database, and content-history interface are not part of the current product.
- `src/content/about-me.md` is a deliberately incomplete author draft. The homepage exposes its `/about` route from the far-right header entry; the entry scrolls away with the page, alongside the theme selector.
- The visual language uses a restrained background, sans-serif homepage typography, single-column article entries, a compact identity introduction, and the theme selector.

## Working rules

1. `main` is the sole active production branch for the 2D blog.
2. Create short-lived feature branches from `main` using the `codex/` prefix, then merge reviewed work back to `main`.
3. Do not merge `codex/3d-pending` into `main` unless a new product decision explicitly reopens the 3D direction.
4. Verify the active branch before work with `git branch --show-current`.
5. Run `npm run lint`, `npm run build`, and `git diff --check` for code or content-system changes. Visual acceptance remains Tao's decision.

## Open decisions

- Decide the language and publishing rhythm after several real records exist. Abstracts and article bodies may follow the needs of their content.
- Finalize the independent space name and introduction.
- Defer cross-article relationships and archive views until published records reveal a real need.
- Keep a private editor and database as future options, not current requirements.

## Related documents

- [README.md](README.md): project entry and local commands.
- [src/content/articles/README.md](src/content/articles/README.md): article-file authoring contract.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md): third-party attribution and asset restrictions.

## Theme behavior

All pages use the same header appearance control: Light, Dark, or Auto (system), with icons and a sliding selection highlight. With no valid saved choice the site follows system appearance. Manual choices persist locally; system changes update the effective theme only in system mode. Changes synchronize across tabs, and unavailable browser storage does not prevent switching for the current session. The control stays in normal header flow and has native button keyboard and touch behavior, visible focus, pressed states, and reduced-motion support; there is no scroll-direction hiding.
