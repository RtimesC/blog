# Sousuke — Spatial Portfolio

An original, explorable 3D portfolio prototype. A torn-paper threshold leads into a hand-drawn corridor; each door leads the camera into a small paper archive room: a workbench, gallery wall, project table, or message desk.

The spatial interaction is the navigation. The HTML room content remains available for keyboard users and as a fallback if WebGL cannot start.

## Design reference

[`DESIGN.md`](./DESIGN.md) is the living reference for the spatial narrative, visual rules, room purpose, content migration, accessibility constraints, and design decisions. Update it whenever a material design or content decision changes.

## Stack

- Vite
- Three.js
- Procedural paper, pencil-line, and room materials; no third-party 3D models or textures

## Run

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

## Architecture

- `src/rooms.js` — one room configuration source for labels, colours, camera paths, staged spaces, and neutral content placeholders
- `src/main.js` — DOM state, lazy scene loading, room navigation, focus management, and WebGL fallback
- `src/space.js` — procedural Three.js corridor, room stages, door picking, and guided camera choreography
- `src/style.css` — paper threshold, in-space content placards, responsive reading layout, and fallback styling

Three.js loads only after the threshold is opened. The four room placards intentionally contain neutral structures rather than invented biography, projects, or contact information.

Append `?mode=html` during local review to force the no-WebGL path and verify the map/content fallback.
