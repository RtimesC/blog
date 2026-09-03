# Current project status

_Last reviewed: 2026-09-03_

## Current 2D blog direction

This branch is a personal technical blog for recording a move from mechatronics toward robotics and AI. It serves two purposes at once: keeping a clear record of self-directed learning, and sharing that record with potential collaborators or readers interested in robotics and AI.

The blog should feel like a living notebook of learning and making, not a formal application site. Content may include technical study notes, viewpoints, reflections, and occasional small projects. The homepage begins with discovery: read the current state, choose the card that interests the reader, and then enter it. Cards are the core entry surface, not a taxonomy.

The phrase "convergent boundary" describes the current design principle: each card gathers one future piece of work into a self-contained boundary. Its exact meaning is still being explored, so it should guide the structure without becoming a fixed slogan or publishing rule. In particular, the homepage must not invent or restore `Article`, `Question`, or `Memo` categories.

## Confirmed homepage structure

- Keep the animated `Hi, I'm τaotao.` title as the opening identity and primary visual moment.
- Place a short, editable current-state statement beneath the title, roughly centered in the page and allowed to unfold naturally with the available width.
- The current-state area has no visible date, label, status bar, border, or artificial text-column constraint. Its copy can change as Tao's learning stage, interests, or current work changes.
- The current-state copy uses the same serif family as the title, in a slightly smaller italic style, and appears after the title-writing animation.
- Follow the introduction with a horizontal collection of equal-sized cards. Every card is the same visual unit, size, and baseline; each one is an independent boundary rather than a different content type.
- Each card has two intentional faces. The front is a full-bleed cover with the title and keywords overlaid in reserved positions. The back is a translucent, softly blurred English `Abstract` surface for the summary. Both faces are part of the card; neither is decorative waste.
- The only homepage card now carries the PhyAgent OPC project: `PhyAgent` with `OPC / Physical AI / Evidence` keywords, an English abstract, and a locally cropped factory-floor cover showing the mounter line and Rover-01. Empty placeholder cards have been removed; new cards will be added only when real content is decided.
- Keep the homepage simple: introduction first, then direct card entry points. Complex article relationships and a learning-trajectory view are future work.

## Current implementation

- The current-state copy is the `currentState` constant in `src/App.jsx`.
- `entries` in `src/App.jsx` contains only the real `phyagent-opc` boundary; it does not encode `Article / Question / Memo` types.
- The homepage renders the single real `.taotao-flip-card` centered in the page. Additional cards will be introduced only with real notes or works.
- The card front uses the cropped `public/assets/phyagent-opc-cover.png` cover, with separated keyword and title positions; the keyword line has a translucent dark contrast band for legibility. Its reverse side uses a frosted-glass abstract surface with a readable divider and body text.
- Article-page `Back to notes` links use the shared animated gradient button treatment while remaining semantic links through `Button asChild`.
- The grid uses a constrained centered container on desktop and collapses to one column below `800px`, so the card group no longer appears left-biased when the viewport is wide.
- On desktop, hovering anywhere inside the outer card flips it and keeps it flipped while the pointer remains within that card. Moving out returns it to the front. Keyboard focus uses the same flip state; touch devices keep the card as a direct link into the project note.
- The card keeps the adapted Uiverse-style `preserve-3d` rotation as its core motion, with restrained edge, shadow, image-cover, and elevation layers added in `src/styles/app.css`. The implementation does not depend on the previous static card style.
- Each card links to `/articles/<boundary-id>`. `/articles/phyagent-opc` opens the first project note with the evidence loop, implementation boundary, and local-delivery status; future destinations can remain intentionally blank until real content exists.
- Visual acceptance is performed by Tao directly; screenshot or browser-based visual QA is not a completion requirement for this card work. Code-level checks remain required.
- The page is still a static React/Vite surface. Timestamped snapshots of current-state edits are a planned content-history feature, not yet a backend capability.
- `npm run build`, `npm run lint`, and `git diff --check` pass for the current shell.

## Homepage content update (2026-09-02)

- Removed the temporary eight-card visual tuning grid; only the first real card remains.
- Replaced the temporary blue/red/yellow cover treatments with a portrait crop from the provided factory-floor image, keeping the mounter line and Rover-01 in frame.
- The centered grid and narrow-screen fallback remain available for future real cards, while the current page stays a single direct entry point.

## Interaction and theme update (2026-09-03)

- The global light background is `#e8e8e8`. The card front and its factory-floor cover remain visually independent of the page theme.
- The shared gradient button was rebuilt around the supplied layered source structure: light bar, seven independently timed gradient layers, interactive button/link layer, and a separate visual text overlay. It remains available through `Button`, including semantic links via `asChild`.
- Button sizing now has a true compact variant: its wrapper, gradient layer, and text overlay scale together. The article `Back to notes` control uses this compact form instead of the former presentation-sized button.
- Theme state is controlled in `src/App.jsx`, stored under `localStorage.theme`, and reflected on the document as `data-theme="light"` or `data-theme="dark"`. The browser theme-color meta tag updates with the selected mode.
- Dark mode uses `#212121` as its page background. Text, dividers, focus outlines, article metadata, and the card reverse side have dedicated dark values; the reverse side becomes a dark translucent frosted-glass surface rather than retaining white glass.
- The supplied day/night switch was adapted as a local React component without adding `styled-components`. Its SVG star path was checked character-for-character against the supplied source. The native checkbox remains visually hidden rather than removed, preserving keyboard focus and accessible toggling.
- The switch is reduced to a `20px` visual base, approximately `113 × 50px`. It is part of page flow rather than fixed to the viewport: on the homepage it sits beside the title; on article pages it shares a toolbar with the back control. On narrow screens, the homepage title and switch stack to prevent overlap.
- The switch, title-writing sequence, button layers, and card rotation respect `prefers-reduced-motion` by removing or shortening motion.
- Tao performs visual acceptance directly; no screenshot or browser-based visual QA is required for this work. The current implementation passed `npm run lint`, `npm run build`, and `git diff --check` after the theme and control-layout changes.

## Open decisions

- Decide whether article and work content should live in Markdown/MDX tracked by Git, or in a future private editing interface and database.
- Review the integrated factory-floor crop visually and replace it only if a more representative, provenance-checked project asset is selected.
- Decide the typography hierarchy and metadata that may eventually occupy the reserved title, keyword, and abstract areas; do not fill them with invented content in the meantime.
- Populate the first real notes and works before designing deeper navigation or learning-trajectory views.
- Decide the language and publishing workflow after the first real content is drafted.

The sections below preserve the earlier spatial-portfolio and source-asset cleanup record. They are historical context for the 3D experience, not requirements for the current 2D blog surface.

## Historical 3D project record

## Working baseline

- Branch: `codex/itom-direct`
- `npm run build` and `git diff --check` pass for the minimum launch shell.
- Desktop and 1024 x 768 tablet production previews confirm that the entrance opens, the corridor and geometric room doors render, and the Field Notes door still enters its room without console errors.
- The rendered page requests only Tao artwork and local fonts; no legacy `/images`, `/sounds`, or non-Tao `/textures` asset URL is requested.

## Completed Tao-facing work

- The entrance sign says `Hi,this is Tao!`.
- The original spatial flow remains: entrance doors, corridor camera, room transitions, and paper interaction.
- The corridor contains the code-native OLED welcome console. It is decorative, runs autonomously, and has no hover, click, or proximity requirement.
- Selected Work, Field Notes, About, GitHub, and the direct reading panel use Tao-specific local content.

## Entrance cleanup

- The source project's cat, tree, hanging-mouse, rubber-duck planter, window sketch, insect, ink splash, and their related interactions have been removed.
- Tao door artwork, entrance sign, and opening-door interaction remain.
- The entrance and corridor shell now use neutral code-native geometry and solid colours. Only the two Tao entrance-door images remain as visual textures.

## Automatic source-asset cleanup

- All 412 tracked original image, texture, map, and sound files under `public/images`, `public/sounds`, and `public/textures` (outside `textures/tao`) have been removed, recovering about 96 MiB.
- Runtime loading blocks legacy `/textures/`, `/images/`, and `/sounds/` paths as a compatibility guard; only `public/textures/tao/` artwork can render normally.
- The source background-music path is disabled pending an original or licensed soundtrack.
- Corridor doodles, wall-frame decorations, and end-of-segment source-art doors have been removed from source.
- The entry window, insect, ink-splash, and their click interaction are removed.
- The retained public assets are Tao artwork, local fonts, and a code-native favicon. The untracked character reference image remains excluded from the experience and public release.

## Minimum launch shell

- The four corridor room entrances use solid geometric doors, geometric frames, and code-native text labels while preserving their camera, teleport, hover, open, room-load, and exit flows.
- The visible audio button, audio settings panel, entrance sound toggle, and now-unused audio-control component have been removed. Internal compatibility code remains silent and is not exposed in the interface.
- Decorative corridor artwork is intentionally deferred until after the minimum launch version is stable.

## Corridor frames

- All four corridor frames are deliberately empty: their image, hover-inspect, and legacy contact-copy content has been removed from the scene.
- `tmp/local-reference/zorti-corridor-portrait-v2.png` remains untracked locally for reference only. It is not loaded or displayed, and it must stay out of a release until its source, author, licence or permission, and required attribution are documented.
- The character may be integrated after that provenance record is added; keep a prepared replacement or removal path in case the permission basis changes.

## Explicitly rejected and reverted

The following experimental direction is not part of the current experience:

- Generic circuit-board entrance wall replacing the brick facade.
- An invented SLAM rover without a repository- or hardware-backed sensor configuration.
- An invented STM32/OLED connection illustration, including decorative screws and unsupported board details.

The corridor architecture remains in place; the original brick wall texture has been removed and is represented by a neutral surface until it is replaced.

## Design and implementation gate

For every future visual replacement, use this order:

1. Verify technical and ownership basis from Tao's repository, hardware photograph, or licensed/original source.
2. Produce a standalone composition preview only; do not add it to `public/` or scene code yet.
3. Obtain Tao's visual approval.
4. Integrate only the approved version, then run the production build and visual QA.

No generic AI technology imagery, inferred hardware connections, or recognizable third-party characters may enter the public portfolio by default.

## Release checklist

- Keep the local character portrait out of `public/` until its source and redistribution basis are documented.
- Check every future external image, icon, typeface, and sound for a redistribution-compatible license and record attribution where required.
- Re-run `npm run build`, `git diff --check`, desktop/mobile visual checks, keyboard flow checks, and the HTML/WebGL fallback.
