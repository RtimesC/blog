# Spatial Portfolio — Design Reference

> Status: active living document  
> Last reviewed: 2026-08-04  
> Runtime source of truth: `src/rooms.js` for room data; this document records the human design intent behind it.

## 1. Purpose

This portfolio should be **entered, not browsed**. Its navigation is a small spatial narrative:

```text
paper threshold → archive corridor → one independent room at a time → return to corridor
```

The visual language is a paper archive: warm paper, pencil lines, worn edges, and practical objects. It should feel authored and unfinished in a productive way, not like a generic WebGL template or a game level.

### Non-negotiable rules

- Keep the experience original. Do not revive the retired poster/editorial, Mithril, HUD, or generated-copy directions from the former Astro project.
- A room is a place, not a full-page route or a card grid.
- Do not invent personal biography, project results, contact details, or research claims. Keep neutral placeholders until verified material is supplied.
- Use spatial movement as navigation, but always retain a visible keyboard-friendly map.

## 2. Experience model

| State | Visitor experience | Required behaviour |
| --- | --- | --- |
| Threshold | A single torn sheet introduces the portfolio. | `Open the threshold` lazily loads the Three.js scene, then moves focus to the map. |
| Corridor | A warm paper archive corridor with a continuous floor guide, numbered landmarks, four doors, and a paper-lit far wall. | Doors are spaced along the route; the first door must never crowd the initial camera view. |
| Room | Camera approaches a door, passes through it, and settles inside a self-contained micro-space. | Hide the corridor and every other room stage. Only the selected room, its paper shell, its objects, and its placard remain visible. |
| Return | The placard closes and the camera returns through the threshold. | Restore corridor visibility only after the camera reaches the room exit. |

The interaction is **guided camera choreography**, not free roaming. There is no WASD navigation, drag-to-walk control, audio, or mandatory scroll progression.

## 3. Spatial and visual language

### Corridor

- The corridor is warm and legible: paper floor, paper walls, warm paper ceiling, pencil guide lines, and diffuse warm fog.
- Its far end must resolve into a softly lit paper wall/arch, never a black void.
- The corridor remains calm and geometric. Animation is limited to subtle light/line movement and must disappear under reduced motion.
- Each door receives a unique accent colour, hand-drawn symbol, number, hover response, and nearby landmark label.

### Materials and typography

| Token | Role |
| --- | --- |
| `--paper` / warm procedural texture | Base surface for entrance, corridor, placards, and room shells. |
| `--ink` | Pencil lines, frames, and primary type. |
| room accent | Door sketch, room rule, placard edge, and small interaction cue. Never use it as a full-screen background. |
| `Source Serif 4` | Narrative headings and readable long-form text. |
| `DM Mono` | Labels, room numbers, map controls, metadata, and technical traces. |
| `DM Sans` | Supporting UI copy only. |

Avoid glossy glass, neon HUD panels, dark sci-fi UI, stock 3D assets, photo-real rooms, and heavy post-processing.

## 4. Room blueprint

The four room definitions live in `src/rooms.js`. Keep their number, ID, accent, symbol, stage type, camera path, and content skeleton in sync there.

| Room | Spatial metaphor | Accent / symbol | Content to migrate later |
| --- | --- | --- | --- |
| 01 / About | A workbench with notebook, pencil, pin, and loose note. | Coral / `◎` | Concise introduction, current direction, and questions worth following. |
| 02 / Gallery | A framed paper exhibition wall and bench. | Blue / `▧` | A selected project, its question, evidence, and a useful link or outcome. |
| 03 / Studio | A project table with trace, board, disc, and prototype block. | Green / `∷` | Process notes: question, constraints, experiments, evidence, and revisions. |
| 04 / Contact | A writing desk with postcard, envelope, pencil, and lamp. | Gold / `↗` | One maintained contact route and a short invitation to start a relevant conversation. |

### Room presentation rule

The HTML placard is part of the room, not a replacement for it:

- Desktop: a narrow paper placard sits beside the visible stage.
- Mobile: the same placard becomes a bottom reading sheet, leaving the upper scene visible.
- Each room has its own paper shell. Entering it must not show corridor doors, landmarks, or another room's objects.

## 5. Content migration workflow

When real materials are ready, migrate them one room at a time.

1. Gather verified source material first: project name, one-sentence question, visual evidence, links, dates, and any claims that need attribution.
2. Decide the single room it belongs to. Do not duplicate an item between Gallery and Studio unless one presents the result and the other documents the process.
3. Replace the matching `content` fields in `src/rooms.js`; preserve the room's visual metaphor unless a new object is genuinely needed.
4. Add only original or correctly licensed media. Optimise images/models before adding them and record the source/license in the relevant project note.
5. Check the 3D view, room placard, mobile layout, keyboard route, and `?mode=html` fallback before considering the update complete.

Content stays English-first. Technical writing can be concise, concrete, and evidence-led; Chinese explanations may be added later only when there is a deliberate bilingual strategy.

## 6. Interaction, accessibility, and performance

- **Map:** always reachable after entering; closes after a room is selected; `Escape` closes it or returns from an open room.
- **Focus:** entry sends focus to the map; an arriving room sends focus to its heading; returning sends focus back to the map.
- **Fallback:** `?mode=html` forces the no-WebGL route for review. The map and all room placards must remain usable.
- **Reduced motion:** camera jumps to its target and ambient motion is disabled when `prefers-reduced-motion: reduce` is set.
- **Loading:** Three.js is imported only after the threshold opens. The initial page must remain a small DOM/CSS bundle.
- **Responsive layout:** test the entrance, map, placard, and back action at 390 px and at a normal desktop viewport.

## 7. Implementation boundaries

The current architecture is intentionally small:

- `src/main.js` owns DOM state, map rendering, focus management, lazy scene loading, and fallback state.
- `src/rooms.js` is the single runtime configuration for rooms.
- `src/space.js` owns procedural scene construction, door picking, stage isolation, and camera transitions.
- `src/style.css` owns paper surfaces, responsive placards, and motion preferences.

Keep Vite and native Three.js. Do not add React, React Three Fiber, external models, texture packs, or a CMS merely to fill the current placeholders.

## 8. Change log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-08-04 | Replaced Astro with a Vite + native Three.js spatial prototype. | Space movement is the primary navigation model. |
| 2026-08-04 | Chose paper archive rooms and guided camera movement. | Keeps the experience personal, calm, lightweight, and mobile-safe. |
| 2026-08-04 | Added lazy WebGL loading, a map, keyboard flow, and `?mode=html`. | The spatial layer must never block readable content. |
| 2026-08-04 | Moved door 01 deeper, warmed the ceiling/far end, and isolated room stages. | The corridor must not feel like a dark void; rooms must feel genuinely independent. |

## 9. Update protocol

For every material design or content decision:

1. Update this document's relevant section and append one short change-log row.
2. Update `src/rooms.js` if the room's runtime data changes.
3. Build with `npm run build`.
4. Visually inspect the affected route in the local dev server, plus the HTML fallback if navigation/content changed.

This file is deliberately a reference, not a historical archive. Remove decisions that are explicitly superseded; preserve only the change-log note needed to explain the transition.
