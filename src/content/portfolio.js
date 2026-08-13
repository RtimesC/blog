// Local, version-controlled content for the portfolio. Keep project claims
// tied to evidence available in the linked repositories.
export const profile = {
  name: 'Tao',
  role: 'Mechatronics student building embodied AI systems',
  githubUrl: 'https://github.com/RtimesC',
  interests: ['embodied intelligence', 'robotics', 'animation', 'anime']
};

export const works = [
  {
    slug: 'vln',
    title: 'LANGUAGE TO MOTION',
    summary: 'A Jetson vehicle runtime that connects camera input and language-guided navigation to bounded ROS 2 motion commands.',
    role: 'Deployment, ROS 2 integration, and command-interface design',
    system: 'Camera input → remote navigation service → bounded /cmd_vel pulse → STM32 serial bridge',
    evidence: [
      'The runtime consumes camera input and publishes motion through ROS 2.',
      'The command path clamps motion, times out stale commands, and explicitly publishes a zero Twist after an action.',
      'The STM32 bridge accepts compact serial vehicle commands.'
    ],
    stack: ['Python', 'ROS 2', 'Jetson', 'NaVIDA', 'STM32'],
    repoUrl: 'https://github.com/RtimesC/VLN',
    artwork: '/textures/tao/gallery/vln-navigation.webp',
    readerSections: [
      { heading: 'Question', body: 'How can language-guided visual navigation reach a physical vehicle without sending unrestricted commands to its actuators?' },
      { heading: 'System design', body: 'The deployment connects the camera stream to a remote navigation service, then converts the response into a short ROS 2 /cmd_vel pulse before sending compact serial commands to the STM32 vehicle bridge.' },
      { heading: 'Command handling', body: 'Motion is clamped, stale commands time out, and the runtime sends an explicit zero Twist after each action or failure path.' }
    ]
  },
  {
    slug: 'habitat-vln',
    title: 'SIMULATION CHECKS',
    summary: 'Navigation validation work built on Habitat-Lab, used to inspect embodied-agent behaviour before carrying ideas into the physical stack.',
    role: 'Environment setup, validation workflow, and experiment support',
    system: 'Habitat scene and task configuration → agent run → trajectory and failure inspection',
    evidence: [
      'The work uses Habitat-Lab as the upstream simulation platform.',
      'It focuses on validation and experiment workflow rather than claiming authorship of Habitat-Lab.',
      'Simulation gives a controlled place to inspect route choices and failure cases before hardware deployment.'
    ],
    stack: ['Python', 'Habitat-Lab', 'navigation validation'],
    repoUrl: 'https://github.com/RtimesC/habitat-lab',
    artwork: '/textures/tao/gallery/habitat-validation.webp',
    readerSections: [
      { heading: 'Scope', body: 'This is validation work built on Habitat-Lab, not a claim of having developed the upstream simulator.' },
      { heading: 'System design', body: 'Configured scenes and tasks make it possible to run navigation experiments, examine trajectories, and isolate failure modes in a repeatable environment.' },
      { heading: 'Why it matters', body: 'The simulation loop is a lower-risk checkpoint between an idea and a physical robot test.' }
    ]
  },
  {
    slug: 'stm32-oled',
    title: 'SMALL DISPLAY, CLEAR STATE',
    summary: 'An STM32F10x OLED driver that exposes a compact display interface through software I²C and an SSD1306 controller.',
    role: 'Embedded interface implementation',
    system: 'STM32F10x GPIO → software I²C on PB8/PB9 → SSD1306 OLED module',
    evidence: [
      'The repository targets STM32F10x hardware and an SSD1306 OLED controller.',
      'The default software I²C pins are PB8 and PB9.',
      'It keeps hardware-facing display communication small and inspectable.'
    ],
    stack: ['C', 'STM32F10x', 'software I²C', 'SSD1306'],
    repoUrl: 'https://github.com/RtimesC/OLED1',
    artwork: '/textures/tao/gallery/stm32-oled.webp',
    readerSections: [
      { heading: 'Question', body: 'How can a compact embedded system expose state without adding a heavy display dependency?' },
      { heading: 'System design', body: 'The driver uses software I²C on PB8/PB9 to communicate with an SSD1306 OLED from an STM32F10x target.' },
      { heading: 'Boundary', body: 'The project is intentionally a focused display interface, not a full embedded application framework.' }
    ]
  }
];

export const galleryProjects = works.map(({ slug, title, summary, stack, repoUrl, artwork }) => ({
  id: slug,
  title,
  description: summary,
  stack,
  url: repoUrl,
  front: artwork,
  painted: artwork
}));

export const fieldNotes = [
  {
    id: 'vehicle-command-path',
    workSlug: 'vln',
    title: 'From camera input to a bounded command',
    description: 'Camera input, a remote navigation service, a ROS 2 velocity pulse, and the STM32 bridge form a deliberately constrained command path.',
    date: '2026-08-10'
  },
  {
    id: 'simulation-validation',
    workSlug: 'habitat-vln',
    title: 'Use simulation to inspect failures first',
    description: 'Habitat-Lab provides the controlled environment for validating trajectories before real-world tests.',
    date: '2026-08-10'
  },
  {
    id: 'oled-interface',
    workSlug: 'stm32-oled',
    title: 'A focused I²C display interface',
    description: 'The OLED driver keeps the device boundary legible: STM32F10x, PB8/PB9, software I²C, SSD1306.',
    date: '2026-08-10'
  }
];

export const aboutMilestones = {
  intro: {
    title: 'TAO',
    label: 'mechatronics · embodied AI',
    statement: 'robotics · simulation · embedded systems'
  },
  systems: {
    title: 'WORKING SYSTEMS',
    label: 'Small projects with clear, inspectable boundaries.',
    items: [
      { title: 'NAVIGATION', text: 'camera input and ROS 2 motion commands' },
      { title: 'SIMULATION', text: 'repeatable checks in Habitat-Lab' },
      { title: 'EMBEDDED', text: 'STM32 display and vehicle interfaces' }
    ]
  },
  path: {
    title: 'FIELD PATH',
    label: 'A route from controlled experiments to physical systems.',
    items: [
      { title: 'SIMULATION', text: 'inspect trajectories and failure cases' },
      { title: 'ROBOT RUNTIME', text: 'connect camera input to vehicle control' },
      { title: 'EMBEDDED EDGE', text: 'keep hardware interfaces explicit' }
    ]
  },
  tools: {
    title: 'TOOLS IN MOTION',
    label: 'Click a signal to open the selected work notes.',
    items: ['ROS 2', 'Python', 'Jetson', 'Habitat-Lab', 'STM32', 'Animation / Anime']
  }
};

export const getWork = (slug) => works.find((work) => work.slug === slug);
