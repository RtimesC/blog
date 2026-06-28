export interface Category {
  id: string;
  name: string;
  blurb: string;
}

/** Single source of truth for the blog's 4 top-level categories. */
export const CATEGORIES = [
  {
    id: 'robotics-slam',
    name: 'Robotics & SLAM',
    blurb: 'Robots, visual navigation, SLAM, state estimation, and control.',
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning',
    blurb: 'Neural networks, training notes, and learning-based perception.',
  },
  {
    id: 'embedded-fpv',
    name: 'Embedded & FPV',
    blurb: 'Microcontrollers, circuits, flight stacks, and low-level systems.',
  },
  {
    id: 'notes',
    name: 'Notes',
    blurb: 'Essays, learning logs, paper notes, and thinking out loud.',
  },
] as const satisfies readonly Category[];

export type CategoryId = (typeof CATEGORIES)[number]['id'];

/** Tuple form for `z.enum()` in the content schema. */
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [
  CategoryId,
  ...CategoryId[],
];

export const categoryName = (id: string): string =>
  CATEGORIES.find((c) => c.id === id)?.name ?? id;
