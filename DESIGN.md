# Spatial Portfolio — Design Reference

> Status: active living document  
> Last reviewed: 2026-08-04  
> Runtime source of truth: `src/rooms.js` for room data; this document records the human design intent behind it.

## 1. Purpose

This portfolio should be **entered, not browsed**. Its navigation is a small spatial narrative:

```text
paper door → archive corridor → one independent room at a time → return or continue through ∞
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
| Threshold | `Taotao`, a concise introduction, and one closed paper door introduce the portfolio. A transparent portrait layer may sit behind the door when an approved asset exists. | The whole door is a focusable button. Opening it lazily loads Three.js, covers the handoff with warm paper, and moves focus to the map. With no portrait path, no placeholder or image request is created. |
| Corridor | A warm paper archive corridor with a continuous floor guide, numbered landmarks, four room doors, and a distant `∞` door. | Doors keep their room order and wall relationship. Desktop and mobile re-choreograph the same corridor without duplicating content or navigation state. |
| Room | Camera approaches a door, passes through it, and settles in an open paper field around the selected stage. | Hide the corridor and every other room stage. Only the selected ground plane, objects, and placard remain visible. |
| Return | The placard closes and the camera returns through the threshold. | Restore corridor visibility only after the camera reaches the room exit. |
| Continue | The distant `∞` door opens into warm paper fog and returns to the same corridor entrance. | Lock room, map, and repeated loop input during the transition. Reset the existing camera and door state; never clone rooms, map entries, or event listeners. |

The interaction is **guided camera choreography**, not free roaming. There is no WASD navigation, drag-to-walk control, audio, or mandatory scroll progression.

## 3. Spatial and visual language

### Corridor

- The corridor is warm and legible: paper floor, paper walls, warm paper ceiling, pencil guide lines, and diffuse warm fog.
- The floor and side walls share one warm white-yellow paper base; the ceiling stays only slightly lighter to hold the room open.
- Its far end resolves into a small paper door marked `∞`, set into the warm end wall with a restrained local glow. It is a spatial continuation, not a fifth room: it never enters `ROOMS`, the map, or visit progress.
- The corridor remains calm and geometric. Animation is limited to subtle light/line movement and must disappear under reduced motion.
- Each door receives a unique accent colour, hand-drawn symbol, number, layered pencil frame, matte handle, hover response, and labels anchored to the frame's top and threshold edges.
- Each side wall contains openings derived from the corresponding door's final scale and position. The opening, fixed frame, and threshold share the same vertical basis; no decorative frame floats in front of the opening.
- Door panels fit inside the wall opening with a narrow clearance on all four edges, and each hinge axis passes through the panel edge. Desktop and mobile use the same restrained outward arc while the frame and threshold stay fixed.
- Door interaction has a deliberate cadence: the handle depresses first, the panel follows on an explicit eased timeline, and only then does the camera move. Room-stage geometry remains hidden until the camera crosses the threshold and the corridor is hidden. Returning removes the stage before restoring the corridor, then closes the selected door to an exact final pose before input is restored.
- Door spacing opens gradually after the first threshold distance: room 01 stays clear of the entry camera, while 02 to 04 form a readable, unhurried sequence down the corridor.
- Distant doors may use small physical and larger landmark-scale compensation so labels stay legible without flattening the corridor into a menu.
- Desktop keeps a first-person corridor with long, parallel side walls and deep perspective.
- Mobile is the same portfolio and the same corridor logic, re-choreographed for a narrow viewport. It raises both side walls and opens the near end while tapering the far end inward, creating more wall area and separating doors on the same side without changing room content or order.
- Mobile room doors share one physical scale and one threshold height. Each door's position, rotation, wall opening, and vertical placement are derived from its original `z`, the tapered wall plane, and the shared corridor floor, keeping the fixed frame aligned with both the cut wall and floor.
- Mobile room labels use dedicated centred billboards whose `x`, `y`, and `z` are derived from the final door transform, with an inward safety inset for the near edge of a narrow viewport. Any wall, camera, or door adjustment must move its label with it.
- Mobile touch targeting is presentation-specific: project each visible door face into screen space, expand that rectangle for finger input, and resolve overlap by distance to the projected door centre. Activate only a `pointerdown` to `pointerup` gesture that travels no more than 10 px; dragging and cancellation never open a door. The visible door geometry must not be distorted merely to make it clickable.
- The `∞` door stays centred and distant on both devices. Mobile may move and scale the terminus independently, but it must remain visibly part of the same returning corridor.
- Each handle lever points toward its own hinge axis. Its hover turn keeps the same downward press on both walls.

### Materials and typography

| Token | Role |
| --- | --- |
| `--paper` / warm procedural texture | Base surface for entrance, corridor, placards, and open stage grounds. |
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
- Mobile: the same placard becomes a bottom reading sheet capped at 45% of the viewport and scrolls internally, leaving at least 55% for the room stage.
- The room number and a persistent `↩ Corridor` index tab stay at the top of the placard so returning never requires scrolling to the end.
- Each stage uses an extended paper ground without enclosing walls, a ceiling, or an arch. Entering it must not show corridor doors, landmarks, or another stage's objects.

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
- **Loop:** only the 3D `∞` door starts the continuation. While looping, room, map, and `Escape` input are locked; completion returns focus to the map.
- **Fallback:** `?mode=html` forces the no-WebGL route for review. The map and all room placards must remain usable.
- **Reduced motion:** remove entrance rotation, blur, camera interpolation, and ambient motion when `prefers-reduced-motion: reduce` is set; state changes remain complete and direct.
- **Loading:** Three.js is imported only after the entrance door opens. The initial page must remain a small DOM/CSS bundle and an empty portrait layer must not issue a request.
- **Responsive relationship:** room content, map entries, door order, loop state, and room isolation are shared. Camera paths, corridor wall composition, label placement, placard layout, and pointer/touch hit testing may differ by device.
- **Responsive review:** test the entrance, corridor, map, placard, back action, loop, and every room at 390 px and at a normal desktop viewport. A mobile change is incomplete until its labels are rechecked against the final door transforms.

## 7. Implementation boundaries

The current architecture is intentionally small:

- `src/main.js` owns DOM state, map rendering, focus management, lazy scene loading, and fallback state.
- `src/rooms.js` is the single runtime configuration for rooms.
- `src/textures.js` owns procedural textures, labels, and shared material primitives.
- `src/doors.js` owns room-door and continuation-door geometry.
- `src/stages.js` owns the four procedural stage builders.
- `src/space-layout.js` owns corridor construction, wall openings, landmarks, and responsive geometry.
- `src/space.js` owns scene state, door picking, stage isolation, camera transitions, and animation scheduling.
- `src/style.css` owns paper surfaces, responsive placards, and motion preferences.

Keep Vite and native Three.js. Do not add React, React Three Fiber, external models, texture packs, or a CMS merely to fill the current placeholders.

## 8. Change log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-08-04 | Replaced Astro with a Vite + native Three.js spatial prototype. | Space movement is the primary navigation model. |
| 2026-08-04 | Chose paper archive rooms and guided camera movement. | Keeps the experience personal, calm, lightweight, and mobile-safe. |
| 2026-08-04 | Added lazy WebGL loading, a map, keyboard flow, and `?mode=html`. | The spatial layer must never block readable content. |
| 2026-08-04 | Moved door 01 deeper, warmed the ceiling/far end, and isolated room stages. | The corridor must not feel like a dark void; rooms must feel genuinely independent. |
| 2026-08-04 | Promoted the Vite + native Three.js spatial portfolio to `main`. | The paper-archive experience is now the active project, replacing the former Astro architecture. |
| 2026-08-04 | Re-spaced the doors, aligned landmarks, and added layered door hardware with a warm-white end wall. | Improve corridor legibility and tactile wayfinding without turning navigation into free roaming. |
| 2026-08-04 | Compressed the distant door rhythm and added depth-aware label, door, fog, and render-resolution compensation. | Keep every room readable from the entry view without losing spatial depth. |
| 2026-08-04 | Widened the corridor, door faces, and room approach path; extended the end wall beyond the staggered door band and widened the mobile lens. | Give each door more readable area while retaining a stable rectangular terminus on mobile. |
| 2026-08-04 | Tested, then retired, a centre-biased mobile spread of front-facing door cards. | It improved label size but broke the physical relationship between doors and walls; the tapered-wall choreography supersedes it. |
| 2026-08-04 | Enlarged door bodies and labels, then opened the door rhythm to `-11 / -18 / -26 / -34`. | Restore legibility while giving each room a more distinct place along the archive route. |
| 2026-08-04 | Unified door hinge motion so every panel turns toward its own wall. | Keep hover and entry movement tactile without obstructing the corridor. |
| 2026-08-04 | Set door panels slightly clear of the wall and limited their inward hinge travel. | Preserve the inward-push cue without wall intersection or heavy doorway scenery. |
| 2026-08-04 | Unified the corridor floor and side walls, then reduced the warm-white terminus into responsive desktop and mobile paper rectangles. | Restore a continuous paper material while making the end feel farther away without extending the route. |
| 2026-08-04 | Pointed every handle lever toward its hinge and mirrored the hover turn in local space. | Keep the hardware mechanically consistent on both corridor walls. |
| 2026-08-04 | Replaced the torn-sheet threshold with a focusable CSS paper door and an optional empty portrait layer. | Make entering the portfolio a literal spatial action while preserving lazy Three.js loading. |
| 2026-08-04 | Replaced the static terminus with a clickable `∞` door that returns to the existing corridor. | Turn the far end into a repeatable spatial continuation without creating a fifth room or duplicate scene. |
| 2026-08-04 | Defined desktop and mobile as one shared content and state system with device-specific spatial choreography and hit testing. | Preserve one portfolio while allowing each viewport to solve composition and interaction on its own terms. |
| 2026-08-04 | Rebuilt the mobile corridor as raised walls that open near the viewer and taper inward at the far end; doors share one scale, sit flush to the wall plane, and own their label anchors. | Restore believable perspective, increase usable wall area, and keep same-wall doors separated without floating card geometry. |
| 2026-08-04 | Limited the mobile reading sheet to 45% and added per-room mobile camera targets. | Keep room objects visible in the upper scene while retaining readable, scrollable content. |
| 2026-08-05 | Reduced mobile door clearance to a near-zero gap backed by material depth bias, added an inward mobile label safety inset, and moved desktop labels above corridor depth. | Remove wall/door z-fighting without a floating near-door edge, and prevent labels or door-foot marks from being clipped by scene geometry. |
| 2026-08-05 | Sequenced handle, door, and camera motion; delayed closing until the corridor return completes; locked navigation during room transitions. | Give opening and closing physical cause-and-effect while preventing repeated input and mid-transition state conflicts. |
| 2026-08-05 | Cut desktop and mobile wall openings around fixed door frames and removed the enclosing room shells. | Prevent door panels from intersecting either wall system and reduce the sense of conventional rooms. |
| 2026-08-05 | Renamed the portfolio identity to `Taotao` and moved the corridor return action into a persistent placard index tab. | Use the chosen personal name and keep the close action within immediate reach. |
| 2026-08-05 | Derived every side-door vertical position from its scaled frame height and the shared corridor floor. | Keep the bottom of near, far, left, and right door frames on the same floor plane. |
| 2026-08-05 | Unified wall planes, door openings, fixed frames, thresholds, labels, and a restrained outward panel swing under shared geometry. | Keep both viewport layouts physically coordinated while avoiding wall intersections, excessive opening travel, and bright voids. |
| 2026-08-06 | Sized panels inside the wall opening, placed each hinge on the panel edge, replaced target chasing with an explicit eased timeline, and delayed stage visibility until the corridor handoff. | Remove panel, jamb, and room-object overlap throughout opening and closing rather than only at the final poses. |
| 2026-08-06 | Removed the detached coloured inner frame, enlarged the wall opening to clear the full panel, removed corridor sway, and eased the mobile lens state after closing. | Restore the visual hierarchy of wall opening, fixed frame, and hinged panel while preventing a one-frame shake at the end of closing. |
| 2026-08-06 | Split textures, doors, stages, and spatial layout into dedicated modules, leaving `space.js` as the scene orchestrator. | Keep geometry and presentation responsibilities independently maintainable without changing runtime behaviour. |
| 2026-08-06 | Re-anchored both door labels to the transformed frame edges and removed inherited door scaling from the threshold label. | Keep all four annotations attached to their doors across depth and responsive layout changes. |

## 9. Update protocol

For every material design or content decision:

1. Update this document's relevant section and append one short change-log row.
2. Update `src/rooms.js` if the room's runtime data changes.
3. Build with `npm run build`.
4. Visually inspect the affected route in the local dev server, plus the HTML fallback if navigation/content changed.

This file is deliberately a reference, not a historical archive. Remove decisions that are explicitly superseded; preserve only the change-log note needed to explain the transition.
