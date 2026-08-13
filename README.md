# Tao — Embodied AI Spatial Portfolio

An interactive portfolio for Tao, a mechatronics student building embodied AI systems. It preserves the spatial corridor, camera choreography, room transitions, and paper interactions from the original code architecture while replacing the public-facing content and assets with Tao's own work.

## Current experience

- **Entrance** — a neutral code-native shell frames Tao's two door illustrations. The opening-door interaction remains and the sign reads `Hi,this is Tao!`.
- **Corridor** — the central welcome mark is a code-native 128×64 OLED control console running an ambient `WELCOME` loop. It has no external image dependency, mouse, click, or navigation behavior.
- **Selected Work** — three repository-backed projects: language-to-motion navigation, Habitat-Lab validation work, and an STM32 OLED driver. The original card interactions remain, while the illustrations live in `public/textures/tao/gallery/`.
- **Field Notes** — the original monitor-room rhythm now presents three local technical notes.
- **About** — retains the flight camera and infinite-scroll structure, but introduces Tao through robotics, simulation, embedded interfaces, and visual storytelling.
- **GitHub / Source** — retains the sea-room interaction and points only to [RtimesC](https://github.com/RtimesC). The former email form and social directory are removed.

## Reading without the 3D tour

The reading panel is the fastest way to reach the portfolio content. It can be opened with **Read selected work** or directly by URL:

- `?read=selected` — all selected work
- `?work=vln` — language-to-motion navigation
- `?work=habitat-vln` — Habitat-Lab validation work
- `?work=stm32-oled` — STM32 OLED driver

The panel is keyboard accessible and the work copy can be selected and copied. The OLED console is deliberately decorative: it does not open work or alter the URL.

## Content and asset editing

All active portfolio copy is local and version controlled:

- [`src/content/portfolio.js`](src/content/portfolio.js) — profile, project metadata, reader sections, field notes, and About-room copy.
- [`src/components/canvas/corridor/OledGuide.jsx`](src/components/canvas/corridor/OledGuide.jsx) — the procedural OLED casing, 1-bit display, and welcome animation. It has no external image dependency.
- `public/textures/tao/` — Tao-specific door and project artwork.

Keep project claims tied to evidence in the linked repositories. In particular, the Habitat-Lab item is validation work built on the upstream platform, not a claim of authorship of Habitat-Lab itself.

## Current status and visual review

See [STATUS.md](STATUS.md) for the current local review state, asset boundaries, rejected experiments, and the required approval gate for future artwork. All corridor frames are intentionally empty until original or licensed artwork is approved.

## Local development

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For a production check:

```bash
npm run build
git diff --check
```

## Attribution and license

The original code architecture is adapted from [ITom Dev | Interactive 3D WebGL Portfolio](https://github.com/ITomPoland/portfolio-itom) under its MIT license. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the boundary between reusable code and original personal assets/copy.
