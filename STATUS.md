# Current project status

_Last reviewed: 2026-08-13_

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
