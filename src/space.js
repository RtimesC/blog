import * as THREE from 'three';
import { ROOM_BY_ID, ROOMS } from './rooms.js';

const INK = 0x171a20;
const PAPER = 0xe9e2d2;
const WALL = 0xd8d0bf;
const MOBILE_CORRIDOR_POSITION = [0, 0.2, 13.5];
const MOBILE_CORRIDOR_LOOK = [0, 0, -16];
const DOOR_LATCH_DELAY = 0.11;
const DOOR_OPEN_SETTLE = 0.38;
const DOOR_CLOSE_SETTLE = 0.34;

function createPaperTexture({ ruled = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  context.fillStyle = '#e9e2d2';
  context.fillRect(0, 0, 256, 256);

  for (let index = 0; index < 1600; index += 1) {
    const tone = 190 + Math.floor(Math.random() * 42);
    context.fillStyle = `rgba(${tone}, ${tone - 5}, ${tone - 16}, ${Math.random() * 0.08})`;
    context.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }

  if (ruled) {
    context.strokeStyle = 'rgba(24, 26, 32, .12)';
    context.lineWidth = 0.7;
    for (let y = 20; y < 256; y += 44) {
      context.beginPath();
      for (let x = 0; x <= 256; x += 6) {
        const wobble = Math.sin((x + y) * 0.12) * 1.2;
        if (x === 0) context.moveTo(x, y + wobble);
        else context.lineTo(x, y + wobble);
      }
      context.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createEndGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const context = canvas.getContext('2d');
  const image = context.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const horizontal = Math.abs((x / (canvas.width - 1)) * 2 - 1);
      const vertical = Math.abs((y / (canvas.height - 1)) * 2 - 1);
      const edge = Math.max(horizontal, vertical);
      const fade = edge <= 0.58 ? 1 : Math.max(0, 1 - ((edge - 0.58) / 0.42) ** 2);
      const offset = (y * canvas.width + x) * 4;
      image.data[offset] = 255;
      image.data[offset + 1] = 246;
      image.data[offset + 2] = 228;
      image.data[offset + 3] = Math.round(68 * fade);
    }
  }

  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createLabelTexture(text, color, { wide = false, small = false, compact = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = wide ? 2048 : (compact ? 768 : 1024);
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = `${small ? (compact ? '600 96px' : '600 86px') : '600 108px'} ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.fillStyle = '#171a20';
  context.textAlign = compact ? 'center' : 'left';
  context.fillText(text, compact ? canvas.width / 2 : 68, compact ? 152 : (small ? 148 : 154));
  context.textAlign = 'left';
  context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.lineWidth = small ? 7 : 11;
  context.beginPath();
  context.moveTo(68, compact ? 190 : (small ? 186 : 194));
  context.lineTo(canvas.width - 76, compact ? 190 : (small ? 186 : 194));
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function makeLabel(text, color, options = {}) {
  const texture = createLabelTexture(text, color, options);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const width = options.wide ? 7.1 : 4.6;
  const height = options.small ? 0.94 : 1.15;
  sprite.scale.set(width, height, 1);
  return sprite;
}

function makeDoorCaption(text, color, width, height) {
  const texture = createLabelTexture(text, color, { small: true, compact: true });
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}

function makeRoughLine(points, color = INK, opacity = 0.86) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geometry, material);
}

function makePaperCard(width, height, color = PAPER, texture = null) {
  const material = new THREE.MeshStandardMaterial({
    color,
    map: texture,
    roughness: 1,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}

function makeBox(width, height, depth, color = PAPER) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.94 }),
  );
}

function addStageShell(root, room, paper) {
  const floor = makePaperCard(8.8, 8.8, PAPER, paper);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.18;
  floor.material.map.repeat.set(2.5, 2.5);
  root.add(floor);

  const backWall = makePaperCard(8.7, 8.6, WALL, paper);
  backWall.position.set(room.side * 3.2, 1.05, 0);
  backWall.rotation.y = -room.side * Math.PI / 2;
  backWall.material.map.repeat.set(1.7, 1.7);
  root.add(backWall);

  [-1, 1].forEach((side) => {
    const sideWall = makePaperCard(6.7, 8.6, WALL, paper);
    sideWall.position.set(0, 1.05, side * 4.18);
    sideWall.material.map.repeat.set(1.7, 1.7);
    root.add(sideWall);
  });

  const ceiling = makePaperCard(8.8, 8.8, 0xe3dac9, paper);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.2;
  ceiling.material.map.repeat.set(2.5, 2.5);
  root.add(ceiling);

  const arch = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(6.2, 7.1, 6.9)),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.48 }),
  );
  arch.position.set(room.side * 0.25, 0.25, 0);
  root.add(arch);

  const roomTag = makeLabel(`${room.number} / ${room.label}`, room.colorValue, { small: true, wide: true });
  roomTag.position.set(room.side * 3.1, 3.35, -2.35);
  roomTag.scale.x = 3.25;
  root.add(roomTag);
}

function addWorkbench(root, room, paper) {
  const desk = makeBox(4.8, 0.22, 2.55, 0x665b4c);
  desk.position.set(0, -1.25, 0.25);
  root.add(desk);

  [-1.9, 1.9].forEach((x) => {
    [-0.85, 0.85].forEach((z) => {
      const leg = makeBox(0.16, 2.05, 0.16, 0x413c35);
      leg.position.set(x, -2.35, z + 0.25);
      root.add(leg);
    });
  });

  const notebook = makePaperCard(2.05, 1.42, 0xf2eadb, paper);
  notebook.rotation.x = -Math.PI / 2;
  notebook.rotation.z = -0.12;
  notebook.position.set(-0.4, -1.11, 0.22);
  root.add(notebook);

  const note = makePaperCard(0.92, 0.65, 0xf0d28b);
  note.rotation.x = -Math.PI / 2;
  note.rotation.z = 0.2;
  note.position.set(1.25, -1.1, -0.3);
  root.add(note);

  const pencil = makeBox(0.09, 0.08, 1.75, room.colorValue);
  pencil.rotation.y = 0.9;
  pencil.position.set(0.5, -1.03, 0.65);
  root.add(pencil);

  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), new THREE.MeshStandardMaterial({ color: room.colorValue, roughness: 0.7 }));
  pin.position.set(-1.45, -1.03, -0.38);
  root.add(pin);

  const line = makeRoughLine([
    new THREE.Vector3(-1.25, -1.02, 0.15),
    new THREE.Vector3(-0.6, -1.01, 0.5),
    new THREE.Vector3(0.05, -1.01, -0.02),
    new THREE.Vector3(0.85, -1.01, 0.35),
  ], room.colorValue, 0.8);
  root.add(line);
}

function addGalleryWall(root, room, paper) {
  const framePositions = [-1.85, 0, 1.85];
  framePositions.forEach((z, index) => {
    const frame = makeBox(0.18, 2.45, 1.35, 0x282a2d);
    frame.position.set(room.side * 2.87, 0.35, z);
    root.add(frame);

    const artTexture = createPaperTexture({ ruled: false });
    const canvas = artTexture.image.getContext('2d');
    canvas.strokeStyle = room.color;
    canvas.lineWidth = 5;
    canvas.beginPath();
    canvas.moveTo(26, 80 + index * 14);
    canvas.bezierCurveTo(82, 34, 142, 180, 230, 52 + index * 17);
    canvas.stroke();
    artTexture.needsUpdate = true;

    const artwork = makePaperCard(1.14, 2.16, PAPER, artTexture);
    artwork.position.set(room.side * 2.75, 0.35, z);
    artwork.rotation.y = -room.side * Math.PI / 2;
    root.add(artwork);
  });

  const bench = makeBox(2.8, 0.32, 0.72, 0x665b4c);
  bench.position.set(-room.side * 0.15, -2.35, 0);
  root.add(bench);
  [-1, 1].forEach((x) => {
    const support = makeBox(0.14, 1.15, 0.14, 0x413c35);
    support.position.set(x, -2.95, 0);
    root.add(support);
  });
}

function addProjectTable(root, room, paper) {
  const table = makeBox(4.35, 0.24, 2.8, 0x5d625e);
  table.position.set(0, -1.25, 0);
  root.add(table);

  const board = makePaperCard(2.15, 1.5, 0xe7eedf, paper);
  board.rotation.x = -Math.PI / 2;
  board.rotation.z = 0.08;
  board.position.set(-0.72, -1.1, 0.12);
  root.add(board);

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.24, 24), new THREE.MeshStandardMaterial({ color: room.colorValue, roughness: 0.78 }));
  disc.position.set(1.2, -1.0, -0.35);
  root.add(disc);

  const cube = makeBox(0.55, 0.55, 0.55, 0x303f39);
  cube.position.set(1.15, -0.62, 0.55);
  cube.rotation.set(0.25, 0.35, 0.08);
  root.add(cube);

  const trace = makeRoughLine([
    new THREE.Vector3(-1.45, -1.01, -0.32),
    new THREE.Vector3(-0.8, -1.0, 0.46),
    new THREE.Vector3(-0.12, -1.0, -0.42),
    new THREE.Vector3(0.52, -1.0, 0.28),
  ], room.colorValue, 0.9);
  root.add(trace);
}

function addMessageDesk(root, room, paper) {
  const desk = makeBox(3.8, 0.22, 2.25, 0x695e4d);
  desk.position.set(-0.2, -1.35, 0.1);
  root.add(desk);

  const card = makePaperCard(1.72, 1.12, 0xf1eadc, paper);
  card.rotation.x = -Math.PI / 2;
  card.rotation.z = -0.14;
  card.position.set(-0.55, -1.21, 0.08);
  root.add(card);

  const envelope = makePaperCard(0.94, 0.6, 0xe1c76d);
  envelope.rotation.x = -Math.PI / 2;
  envelope.rotation.z = 0.16;
  envelope.position.set(0.95, -1.2, -0.24);
  root.add(envelope);

  const lampStem = makeBox(0.08, 1.45, 0.08, 0x3e3a34);
  lampStem.position.set(1.35, -0.55, 0.72);
  root.add(lampStem);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.55, 20, 1, true), new THREE.MeshStandardMaterial({ color: room.colorValue, side: THREE.DoubleSide, roughness: 0.8 }));
  lampShade.position.set(1.35, 0.22, 0.72);
  lampShade.rotation.x = Math.PI;
  root.add(lampShade);

  const noteLine = makeRoughLine([
    new THREE.Vector3(-1.15, -1.1, 0.28),
    new THREE.Vector3(-0.58, -1.1, -0.18),
    new THREE.Vector3(0.02, -1.1, 0.22),
  ], room.colorValue, 0.8);
  root.add(noteLine);
}

const STAGE_BUILDERS = {
  workbench: addWorkbench,
  'gallery-wall': addGalleryWall,
  'project-table': addProjectTable,
  'message-desk': addMessageDesk,
};

function createRoomStage(room, paper, corridorHalfWidth) {
  const root = new THREE.Group();
  root.position.set(room.side * (corridorHalfWidth + 4.4), 0, room.z);
  addStageShell(root, room, paper);
  STAGE_BUILDERS[room.stage]?.(root, room, paper);
  return root;
}

function createDoor(room, paper, corridorHalfWidth) {
  const doorWidth = 3.38;
  const doorHalfWidth = doorWidth / 2;
  const doorWallInset = 0.72;
  const root = new THREE.Group();
  root.position.set(room.side * (corridorHalfWidth - doorWallInset), 0.2, room.z);
  root.rotation.y = -room.side * Math.PI / 2;
  root.scale.setScalar(room.doorScale ?? 1);

  const pivot = new THREE.Group();
  pivot.position.x = -doorHalfWidth;
  root.add(pivot);

  const outerFrameMaterial = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.78 });
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(doorWidth + 0.3, 5.08, 0.18)),
    outerFrameMaterial,
  );
  frame.position.x = doorHalfWidth;
  pivot.add(frame);

  const insetFrameMaterial = new THREE.LineBasicMaterial({ color: room.colorValue, transparent: true, opacity: 0.48 });
  const insetFrame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(doorWidth - 0.18, 4.48, 0.08)),
    insetFrameMaterial,
  );
  insetFrame.position.set(doorHalfWidth, 0, 0.2);
  pivot.add(insetFrame);

  const panel = makePaperCard(doorWidth, 4.78, new THREE.Color(room.colorValue).lerp(new THREE.Color(PAPER), 0.72), paper);
  panel.material.polygonOffset = true;
  panel.material.polygonOffsetFactor = -1;
  panel.material.polygonOffsetUnits = -1;
  panel.position.set(doorHalfWidth, 0, 0.11);
  panel.userData.room = room.id;
  pivot.add(panel);

  const mobileHitTarget = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 6.6),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  mobileHitTarget.position.set(0, 0.25, 0.42);
  mobileHitTarget.userData.room = room.id;
  mobileHitTarget.visible = false;
  root.add(mobileHitTarget);

  const threshold = makeBox(doorWidth + 0.38, 0.08, 0.2, 0xcfc1aa);
  threshold.position.set(doorHalfWidth, -2.5, 0.12);
  pivot.add(threshold);

  const headerSlip = makePaperCard(2.08, 0.2, 0xf4ecdc);
  headerSlip.position.set(doorHalfWidth, 1.98, 0.2);
  pivot.add(headerSlip);
  pivot.add(makeRoughLine([
    new THREE.Vector3(0.65, 1.98, 0.22),
    new THREE.Vector3(2.73, 1.98, 0.22),
  ], room.colorValue, 0.52));

  const sketch = makeRoughLine([
    new THREE.Vector3(0.32, 1.48, 0.14),
    new THREE.Vector3(2.9, -1.48, 0.14),
    new THREE.Vector3(0.7, -1.7, 0.14),
    new THREE.Vector3(3.08, 1.23, 0.14),
  ], room.colorValue, 0.78);
  pivot.add(sketch);

  const handle = new THREE.Group();
  handle.position.set(doorWidth - 0.35, -0.14, 0.24);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x86755e, roughness: 0.84 });
  const escutcheon = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.055, 16), handleMaterial);
  escutcheon.rotation.x = Math.PI / 2;
  escutcheon.userData.room = room.id;
  handle.add(escutcheon);

  const lever = makeBox(0.36, 0.065, 0.08, 0x756652);
  // The pivot's local negative x-axis is the hinge side for every door.
  lever.position.set(-0.16, 0, 0.08);
  lever.userData.room = room.id;
  handle.add(lever);
  pivot.add(handle);

  const mark = makeLabel(`${room.number} / ${room.symbol}`, room.colorValue, { small: true });
  mark.position.set(doorHalfWidth, -3.25, 0.2);
  mark.material.depthTest = false;
  mark.renderOrder = 5;
  root.add(mark);

  return {
    room,
    root,
    pivot,
    panel,
    handle,
    frameMaterials: [outerFrameMaterial, insetFrameMaterial],
    pickTargets: [panel, escutcheon, lever, mobileHitTarget],
    basePositionX: room.side * (corridorHalfWidth - doorWallInset),
    baseScale: room.doorScale ?? 1,
    mark,
    mobileHitTarget,
    // Both walls use the same shallow inward hinge travel without crossing the wall plane.
    restAngle: 0,
    openAngle: 0.12,
    hover: 0,
    latch: 0,
    open: 0,
  };
}

function createLoopDoor(paper, corridorWidth) {
  const root = new THREE.Group();

  const wall = makePaperCard(corridorWidth - 0.2, 8.7, PAPER, paper);
  wall.material = new THREE.MeshBasicMaterial({ color: PAPER, map: paper, side: THREE.DoubleSide });
  wall.position.set(0, 1.1, -0.3);
  root.add(wall);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 6.5),
    new THREE.MeshBasicMaterial({
      color: 0xfff1d7,
      map: createEndGlowTexture(),
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  glow.position.set(0, -0.22, -0.08);
  root.add(glow);

  const doorWidth = 3.2;
  const doorHalfWidth = doorWidth / 2;
  const doorY = -0.36;
  const frameMaterial = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.76 });
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(doorWidth + 0.34, 5.2, 0.18)),
    frameMaterial,
  );
  frame.position.set(0, doorY, 0.04);
  root.add(frame);

  const insetFrameMaterial = new THREE.LineBasicMaterial({ color: 0xb68b5c, transparent: true, opacity: 0.5 });
  const insetFrame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(doorWidth - 0.18, 4.54, 0.08)),
    insetFrameMaterial,
  );
  insetFrame.position.set(0, doorY, 0.12);
  root.add(insetFrame);

  const pivot = new THREE.Group();
  pivot.position.set(-doorHalfWidth, doorY, 0.08);
  root.add(pivot);

  const panel = makePaperCard(doorWidth, 4.86, 0xe3d8c4, paper);
  panel.position.set(doorHalfWidth, 0, 0.08);
  panel.userData.loop = true;
  pivot.add(panel);

  const infinityMark = makeDoorCaption('∞', 0xb77d4d, 1.42, 1.05);
  infinityMark.position.set(doorHalfWidth, 0.4, 0.18);
  infinityMark.userData.loop = true;
  pivot.add(infinityMark);

  const continueLabel = makeDoorCaption('CONTINUE', 0xb77d4d, 2.42, 0.55);
  continueLabel.position.set(doorHalfWidth, -1.62, 0.18);
  continueLabel.userData.loop = true;
  pivot.add(continueLabel);

  const handle = new THREE.Group();
  handle.position.set(doorWidth - 0.38, -0.14, 0.22);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x806f59, roughness: 0.86 });
  const escutcheon = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.055, 16), handleMaterial);
  escutcheon.rotation.x = Math.PI / 2;
  escutcheon.userData.loop = true;
  handle.add(escutcheon);
  const lever = makeBox(0.34, 0.065, 0.08, 0x756652);
  lever.position.set(-0.15, 0, 0.08);
  lever.userData.loop = true;
  handle.add(lever);
  pivot.add(handle);

  const threshold = makeBox(doorWidth + 0.42, 0.08, 0.22, 0xcfc1aa);
  threshold.position.set(0, doorY - 2.53, 0.1);
  root.add(threshold);

  const hitTarget = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 6.5),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hitTarget.position.set(0, doorY, 0.34);
  hitTarget.userData.loop = true;
  root.add(hitTarget);

  return {
    root,
    wall,
    pivot,
    panel,
    handle,
    frameMaterials: [frameMaterial, insetFrameMaterial],
    pickTargets: [hitTarget, panel, infinityMark, continueLabel, escutcheon, lever],
    restAngle: 0,
    openAngle: 1.08,
    hover: 0,
    latch: 0,
    open: 0,
    doorY,
  };
}

export function createSpace({ canvas, reducedMotion, onDoor, onHover, onLoop, onLoopHover, onUnavailable }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    onUnavailable();
    return { enterCorridor() {}, enterRoom() {}, returnToCorridor() {}, loopCorridor: async () => {}, setReducedMotion() {} };
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xf3eee3, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf3eee3, 54, 90);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.2, 17);
  const cameraTarget = camera.position.clone();
  const cameraLook = new THREE.Vector3(0, 0, 0);
  const lookTarget = cameraLook.clone();
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const paper = createPaperTexture();
  paper.repeat.set(5, 12);
  const corridorWidth = 16;
  const corridorHalfWidth = corridorWidth / 2;
  const corridorStartZ = 14;
  const corridorEndZ = Math.min(...ROOMS.map((room) => room.z)) - 27;
  const corridorLength = corridorStartZ - corridorEndZ;
  const corridorCenterZ = (corridorStartZ + corridorEndZ) / 2;
  const mobileWallSpan = corridorLength + 3;
  const mobileWallNearHalfWidth = 6.4;
  const mobileWallFarHalfWidth = 3.2;
  const mobileWallCenterHalfWidth = (mobileWallNearHalfWidth + mobileWallFarHalfWidth) / 2;
  const mobileWallSlope = (mobileWallNearHalfWidth - mobileWallFarHalfWidth) / mobileWallSpan;
  const mobileWallAngle = Math.atan(mobileWallSlope);
  const mobileWallScaleY = 1.28;
  const mobileWallHeight = 8.7 * mobileWallScaleY;
  const mobileWallCenterY = -3.2 + mobileWallHeight / 2;
  const mobileWallHalfWidthAt = (z) => (
    mobileWallCenterHalfWidth + mobileWallSlope * (z - corridorCenterZ)
  );
  const doors = [];
  const doorMeshes = [];
  const corridorWalls = [];
  const ceilingLines = [];
  const stageById = new Map();
  const corridor = new THREE.Group();
  const stages = new THREE.Group();
  scene.add(corridor, stages);

  scene.add(new THREE.HemisphereLight(0xfff6e7, 0x8a8377, 2.05));
  const keyLight = new THREE.DirectionalLight(0xffefd1, 2.35);
  keyLight.position.set(0, 8, 8);
  scene.add(keyLight);
  const archiveLight = new THREE.PointLight(0xfff7e8, 9, 32, 2);
  archiveLight.position.set(0, 2.8, corridorEndZ + 7);
  scene.add(archiveLight);

  const floor = makePaperCard(corridorWidth, corridorLength + 3, PAPER, paper);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -3.2, corridorCenterZ);
  corridor.add(floor);

  const ceiling = makePaperCard(corridorWidth, corridorLength + 3, 0xe8dfcf, paper);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 5.45, corridorCenterZ);
  ceiling.material = new THREE.MeshBasicMaterial({
    color: 0xe8dfcf,
    map: paper,
    side: THREE.DoubleSide,
  });
  corridor.add(ceiling);

  [-1, 1].forEach((side) => {
    const wall = makePaperCard(corridorLength + 3, 8.7, PAPER, paper);
    // Keep the side walls visually on the same warm paper stock as the floor;
    // directional lighting otherwise turns the vertical planes grey.
    wall.material = new THREE.MeshBasicMaterial({ color: PAPER, map: paper, side: THREE.DoubleSide });
    wall.position.set(side * (corridorHalfWidth - 0.04), 1.1, corridorCenterZ);
    wall.rotation.y = side * Math.PI / 2;
    wall.userData.side = side;
    corridorWalls.push(wall);
    corridor.add(wall);
  });

  for (let z = corridorStartZ - 1; z > corridorEndZ + 1; z -= 4) {
    corridor.add(makeRoughLine([
      new THREE.Vector3(-1.35, -3.12, z),
      new THREE.Vector3(1.35, -3.12, z - 1.9),
    ], 0x353941, 0.7));
  }

  for (let z = corridorStartZ - 2; z > corridorEndZ + 1; z -= 5) {
    const ceilingLine = makeRoughLine([
      new THREE.Vector3(-2, 5.27, z),
      new THREE.Vector3(2, 5.27, z),
    ], 0x34373d, 0.38);
    ceilingLines.push(ceilingLine);
    corridor.add(ceilingLine);
  }

  const endScene = new THREE.Group();
  endScene.position.z = corridorEndZ;
  corridor.add(endScene);
  const loopDoor = createLoopDoor(paper, corridorWidth);
  const loopMeshes = loopDoor.pickTargets;
  endScene.add(loopDoor.root);

  ROOMS.forEach((room) => {
    const door = createDoor(room, paper, corridorHalfWidth);
    doors.push(door);
    doorMeshes.push(...door.pickTargets);
    corridor.add(door.root);
    const stage = createRoomStage(room, paper, corridorHalfWidth);
    stage.visible = false;
    stageById.set(room.id, stage);
    stages.add(stage);

    const landmark = makeLabel(`${room.number}  ${room.label}`, room.colorValue, { small: true });
    const landmarkScale = room.landmarkScale ?? 1;
    landmark.position.set(
      door.root.position.x - room.side * 1.5,
      door.root.position.y + 2.9 * door.baseScale,
      room.z + 0.65,
    );
    landmark.scale.set(2.9 * landmarkScale, 0.8 * landmarkScale, 1);
    landmark.material.depthTest = false;
    landmark.renderOrder = 5;
    door.landmark = landmark;
    door.landmarkScale = landmarkScale;
    corridor.add(landmark);

    const mobileLandmark = makeLabel(`${room.number}  ${room.label}`, room.colorValue, { small: true, compact: true });
    mobileLandmark.visible = false;
    mobileLandmark.material.depthTest = false;
    mobileLandmark.renderOrder = 5;
    door.mobileLandmark = mobileLandmark;
    corridor.add(mobileLandmark);
  });
  const pickMeshes = [...doorMeshes, ...loopMeshes];

  let entered = false;
  let roomActive = false;
  let loopActive = false;
  let activeRoomId = null;
  let motionReduced = reducedMotion;
  let hoverDoor = null;
  let hoverLoop = false;
  let pendingArrival = null;
  let pendingDoorAction = null;
  let isMobileViewport = false;
  let pointerStart = null;

  function setCameraLens() {
    camera.fov = isMobileViewport ? (roomActive ? 58 : 56) : 42;
    camera.updateProjectionMatrix();
  }

  function applyResponsiveCorridorLayout() {
    if (isMobileViewport) {
      const endScale = 0.86;
      const endZ = -42;
      const endThresholdY = loopDoor.doorY - 2.53;
      endScene.position.set(0, -3.2 - endThresholdY * endScale, endZ);
      endScene.scale.set(endScale, endScale, 1);
      loopDoor.wall.scale.set(
        (mobileWallHalfWidthAt(endZ) * 2) / ((corridorWidth - 0.2) * endScale),
        mobileWallHeight / (8.7 * endScale),
        1,
      );
      loopDoor.wall.position.y = (mobileWallCenterY - endScene.position.y) / endScale;
      archiveLight.position.set(0, 3, -37);
      ceiling.position.y = 7.75;
      ceilingLines.forEach((line) => { line.position.y = 2.3; });
      corridorWalls.forEach((wall) => {
        wall.position.x = wall.userData.side * mobileWallCenterHalfWidth;
        wall.position.y = mobileWallCenterY;
        wall.rotation.y = wall.userData.side * (Math.PI / 2 + mobileWallAngle);
        wall.scale.y = mobileWallScaleY;
      });
    } else {
      endScene.position.set(0, 0, corridorEndZ);
      endScene.scale.set(1, 1, 1);
      loopDoor.wall.position.y = 1.1;
      loopDoor.wall.scale.set(1, 1, 1);
      archiveLight.position.set(0, 2.8, corridorEndZ + 7);
      ceiling.position.y = 5.45;
      ceilingLines.forEach((line) => { line.position.y = 0; });
      corridorWalls.forEach((wall) => {
        wall.position.x = wall.userData.side * (corridorHalfWidth - 0.04);
        wall.position.y = 1.1;
        wall.rotation.y = wall.userData.side * Math.PI / 2;
        wall.scale.y = 1;
      });
    }

    doors.forEach((door) => {
      if (isMobileViewport) {
        const mobileScale = 1.6;
        const mobileRotation = -door.room.side * (Math.PI / 2 - mobileWallAngle);
        const panelNormalX = Math.sin(mobileRotation);
        const panelNormalZ = Math.cos(mobileRotation);
        const wallHalfWidth = mobileWallHalfWidthAt(door.room.z);
        const scaledPanelOffset = 0.11 * mobileScale;
        const surfaceClearance = 0.004;
        const rootNormalOffset = scaledPanelOffset - surfaceClearance;
        // Keep the physical gap visually negligible; polygon offset stabilises
        // the coplanar-looking paper surfaces without making the door float.
        door.root.position.x = door.room.side * wallHalfWidth - panelNormalX * rootNormalOffset;
        door.root.position.y = -3.2 + 2.5 * mobileScale;
        door.root.position.z = door.room.z - panelNormalZ * rootNormalOffset;
        door.root.rotation.y = mobileRotation;
        door.root.scale.setScalar(mobileScale);
        door.landmark.visible = false;
        door.mobileLandmark.visible = true;
        const mobileLabelInset = 1.3;
        door.mobileLandmark.position.set(
          door.root.position.x - door.room.side * mobileLabelInset,
          door.root.position.y + 2.9 * mobileScale,
          door.root.position.z + 0.35,
        );
        door.mobileLandmark.scale.set(4.3 * door.landmarkScale, 0.87 * door.landmarkScale, 1);
        door.mark.visible = false;
        door.mobileHitTarget.visible = true;
        door.mobileHitTarget.scale.set(1.65, 1.25, 1);
      } else {
        door.root.position.x = door.basePositionX;
        door.root.position.y = 0.2;
        door.root.position.z = door.room.z;
        door.root.rotation.y = -door.room.side * Math.PI / 2;
        door.root.scale.setScalar(door.baseScale);
        door.landmark.visible = true;
        door.mobileLandmark.visible = false;
        door.landmark.position.set(
          door.root.position.x - door.room.side * 1.5,
          door.root.position.y + 2.9 * door.baseScale,
          door.room.z + 0.65,
        );
        door.landmark.scale.set(2.9 * door.landmarkScale, 0.94 * door.landmarkScale, 1);
        door.mark.visible = true;
        door.mobileHitTarget.visible = false;
        door.mobileHitTarget.scale.set(1, 1, 1);
      }
    });
  }

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, motionReduced ? 1 : 2));
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    isMobileViewport = camera.aspect < 0.72;
    setCameraLens();
    applyResponsiveCorridorLayout();
  }

  function moveTo(position, lookAt, onArrive = null) {
    cameraTarget.set(...position);
    lookTarget.set(...lookAt);
    if (motionReduced) {
      camera.position.copy(cameraTarget);
      cameraLook.copy(lookTarget);
      onArrive?.();
      return;
    }
    pendingArrival = { onArrive, elapsed: 0 };
  }

  function setDoorState(openActive = true) {
    doors.forEach((door) => {
      door.open = openActive && door.room.id === activeRoomId ? 1 : 0;
      if (!door.open) door.latch = 0;
    });
  }

  function setDoorPoseImmediately(door, open) {
    door.open = open ? 1 : 0;
    door.latch = 0;
    door.pivot.rotation.y = door.restAngle + door.open * door.openAngle;
    door.handle.rotation.z = door.open * 0.07;
  }

  function startDoorAction(door, opening, onComplete) {
    if (!door) {
      onComplete?.();
      return;
    }

    if (pendingDoorAction) pendingDoorAction.door.latch = 0;
    pendingDoorAction = null;

    if (motionReduced) {
      setDoorPoseImmediately(door, opening);
      onComplete?.();
      return;
    }

    door.open = 0;
    door.latch = opening ? 1 : 0;
    pendingDoorAction = { door, opening, elapsed: 0, onComplete };
  }

  function advanceDoorAction(delta) {
    const action = pendingDoorAction;
    if (!action) return;

    action.elapsed += delta;
    if (action.opening && action.elapsed >= DOOR_LATCH_DELAY) action.door.open = 1;

    const duration = action.opening ? DOOR_OPEN_SETTLE : DOOR_CLOSE_SETTLE;
    if (action.elapsed < duration) return;

    action.door.open = action.opening ? 1 : 0;
    action.door.latch = 0;
    pendingDoorAction = null;
    action.onComplete?.();
  }

  function setStageVisibility(id = null) {
    stages.children.forEach((stage) => {
      stage.visible = stage === stageById.get(id);
    });
  }

  function enterCorridor() {
    pendingDoorAction = null;
    entered = true;
    roomActive = false;
    loopActive = false;
    activeRoomId = null;
    corridor.visible = true;
    setStageVisibility();
    setDoorState(false);
    setCameraLens();
    moveTo(
      isMobileViewport ? MOBILE_CORRIDOR_POSITION : [0, 0.1, 10.5],
      isMobileViewport ? MOBILE_CORRIDOR_LOOK : [0, 0, -6],
    );
  }

  function getRoomApproach(room) {
    if (!isMobileViewport) {
      return { position: room.camera.approach, lookAt: room.camera.approachLook };
    }

    const door = doors.find((candidate) => candidate.room.id === room.id);
    return {
      position: [room.side * 0.45, 0.05, room.z + 4.2],
      lookAt: [door.root.position.x, door.root.position.y, door.root.position.z],
    };
  }

  function enterRoom(id, onArrive) {
    const room = ROOM_BY_ID.get(id);
    if (!room || loopActive) return;
    const door = doors.find((candidate) => candidate.room.id === room.id);
    roomActive = true;
    activeRoomId = room.id;
    corridor.visible = true;
    setStageVisibility(room.id);
    setDoorState(false);
    startDoorAction(door, true, () => {
      const approach = getRoomApproach(room);
      moveTo(approach.position, approach.lookAt, () => {
        corridor.visible = false;
        setCameraLens();
        const finalCamera = isMobileViewport ? (room.camera.mobile ?? room.camera) : room.camera;
        moveTo(finalCamera.position, finalCamera.lookAt, onArrive);
      });
    });
  }

  function returnToCorridor(onArrive) {
    const room = ROOM_BY_ID.get(activeRoomId);
    if (!room) {
      enterCorridor();
      onArrive?.();
      return;
    }

    const door = doors.find((candidate) => candidate.room.id === room.id);
    roomActive = true;
    const approach = getRoomApproach(room);
    moveTo(approach.position, approach.lookAt, () => {
      corridor.visible = true;
      setStageVisibility();
      moveTo(
        isMobileViewport ? MOBILE_CORRIDOR_POSITION : [0, 0.1, 7],
        isMobileViewport ? MOBILE_CORRIDOR_LOOK : [0, 0, -10],
        () => {
          startDoorAction(door, false, () => {
            activeRoomId = null;
            roomActive = false;
            setDoorState(false);
            setCameraLens();
            onArrive?.();
          });
        },
      );
    });
  }

  function loopCorridor({ cover, reveal } = {}) {
    if (!entered || roomActive || loopActive) return Promise.resolve();
    loopActive = true;
    hoverDoor = null;
    hoverLoop = false;
    onHover?.(null);
    onLoopHover?.(false);
    canvas.style.cursor = 'default';
    setStageVisibility();
    const doorZ = endScene.position.z;
    const doorY = endScene.position.y + loopDoor.doorY * endScene.scale.y;
    const approach = [0, doorY, doorZ + (isMobileViewport ? 7 : 8.5)];
    const threshold = [0, doorY, doorZ - 0.72];
    const entrancePosition = isMobileViewport ? MOBILE_CORRIDOR_POSITION : [0, 0.1, 10.5];
    const entranceLook = isMobileViewport ? MOBILE_CORRIDOR_LOOK : [0, 0, -6];

    return new Promise((resolve) => {
      startDoorAction(loopDoor, true, () => {
        moveTo(approach, [0, doorY, doorZ], () => {
          moveTo(threshold, [0, doorY, doorZ - 5], () => {
            void (async () => {
              await cover?.();
              camera.position.set(...entrancePosition);
              cameraTarget.copy(camera.position);
              cameraLook.set(...entranceLook);
              lookTarget.copy(cameraLook);
              corridor.rotation.y = 0;
              setDoorPoseImmediately(loopDoor, false);
              loopDoor.hover = 0;
              await reveal?.();
              loopActive = false;
              resolve();
            })();
          });
        });
      });
    });
  }

  function setReducedMotion(value) {
    motionReduced = value;
    if (motionReduced && pendingDoorAction) {
      const action = pendingDoorAction;
      pendingDoorAction = null;
      setDoorPoseImmediately(action.door, action.opening);
      action.onComplete?.();
    }
    resize();
  }

  function getMobileDoorAt(clientX, clientY, bounds) {
    let closest = null;

    doors.forEach((door) => {
      const { width, height } = door.panel.geometry.parameters;
      const corners = [
        [-width / 2, -height / 2],
        [width / 2, -height / 2],
        [width / 2, height / 2],
        [-width / 2, height / 2],
      ].map(([x, y]) => {
        const point = door.panel.localToWorld(new THREE.Vector3(x, y, 0)).project(camera);
        return {
          x: bounds.left + ((point.x + 1) / 2) * bounds.width,
          y: bounds.top + ((1 - point.y) / 2) * bounds.height,
        };
      });

      const minX = Math.min(...corners.map((point) => point.x)) - 18;
      const maxX = Math.max(...corners.map((point) => point.x)) + 18;
      const minY = Math.min(...corners.map((point) => point.y)) - 14;
      const maxY = Math.max(...corners.map((point) => point.y)) + 14;
      if (clientX < minX || clientX > maxX || clientY < minY || clientY > maxY) return;

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const score = ((clientX - centerX) / (maxX - minX)) ** 2
        + ((clientY - centerY) / (maxY - minY)) ** 2;
      if (!closest || score < closest.score) closest = { id: door.room.id, score };
    });

    return closest?.id ?? null;
  }

  function pick(event, click = false) {
    if (!entered || roomActive || loopActive) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickMeshes, false)
      .find(({ object }) => object.visible !== false)?.object ?? null;
    const next = isMobileViewport
      ? (getMobileDoorAt(event.clientX, event.clientY, bounds) ?? hit?.userData.room ?? null)
      : (hit?.userData.room ?? null);
    const nextLoop = hit?.userData.loop === true;
    if (hoverDoor !== next) {
      hoverDoor = next;
      onHover?.(next);
    }
    if (hoverLoop !== nextLoop) {
      hoverLoop = nextLoop;
      onLoopHover?.(nextLoop);
    }
    canvas.style.cursor = next || nextLoop ? 'pointer' : 'default';
    if (click && next) onDoor?.(next);
    else if (click && nextLoop) onLoop?.();
  }

  canvas.addEventListener('pointermove', (event) => pick(event));
  canvas.addEventListener('pointerdown', (event) => {
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const travel = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (travel <= 10) pick(event, true);
  });
  canvas.addEventListener('pointercancel', () => { pointerStart = null; });
  canvas.addEventListener('pointerleave', () => {
    hoverDoor = null;
    hoverLoop = false;
    pointerStart = null;
    canvas.style.cursor = 'default';
    onHover?.(null);
    onLoopHover?.(false);
  });
  window.addEventListener('resize', resize);
  resize();

  function render() {
    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.getElapsedTime();
    const blend = motionReduced ? 1 : 1 - Math.exp(-delta * 6.8);
    camera.position.lerp(cameraTarget, blend);
    cameraLook.lerp(lookTarget, blend);
    camera.lookAt(cameraLook);

    advanceDoorAction(delta);

    const hoverBlend = motionReduced ? 1 : 1 - Math.exp(-delta * 9.5);
    const panelBlend = motionReduced ? 1 : 1 - Math.exp(-delta * 11.5);
    const handleBlend = motionReduced ? 1 : 1 - Math.exp(-delta * 15);
    doors.forEach((door) => {
      const targetHover = hoverDoor === door.room.id && !roomActive && !loopActive ? 1 : 0;
      door.hover += (targetHover - door.hover) * hoverBlend;
      const targetOpen = door.restAngle + door.open * door.openAngle + door.hover * 0.035;
      door.pivot.rotation.y += (targetOpen - door.pivot.rotation.y) * panelBlend;
      const interaction = Math.max(door.hover, door.latch);
      const targetHandle = 0.24 * interaction + 0.07 * door.open;
      door.handle.rotation.z += (targetHandle - door.handle.rotation.z) * handleBlend;
      door.frameMaterials.forEach((material, index) => {
        material.opacity = (index === 0 ? 0.78 : 0.48) + interaction * 0.16;
      });
      door.panel.material.emissive?.setHex(door.room.colorValue);
      door.panel.material.emissiveIntensity = interaction * 0.14 + door.open * 0.07;
    });

    const targetLoopHover = hoverLoop && !roomActive && !loopActive ? 1 : 0;
    loopDoor.hover += (targetLoopHover - loopDoor.hover) * hoverBlend;
    const loopInteraction = Math.max(loopDoor.hover, loopDoor.latch);
    const loopOpen = loopDoor.open * loopDoor.openAngle + loopDoor.hover * 0.06;
    loopDoor.pivot.rotation.y += (loopOpen - loopDoor.pivot.rotation.y) * panelBlend;
    const loopHandle = 0.22 * loopInteraction + 0.07 * loopDoor.open;
    loopDoor.handle.rotation.z += (loopHandle - loopDoor.handle.rotation.z) * handleBlend;
    loopDoor.frameMaterials.forEach((material, index) => {
      material.opacity = (index === 0 ? 0.76 : 0.5) + loopInteraction * 0.18;
    });
    loopDoor.panel.material.emissive?.setHex(0xd9b36f);
    loopDoor.panel.material.emissiveIntensity = loopInteraction * 0.16 + loopDoor.open * 0.08;

    if (entered && !motionReduced && !roomActive && !loopActive) {
      corridor.rotation.y = Math.sin(elapsed * 0.16) * 0.012;
      keyLight.intensity = 1.78 + Math.sin(elapsed * 0.55) * 0.18;
    } else if (motionReduced) {
      corridor.rotation.y = 0;
      keyLight.intensity = 1.78;
    } else {
      corridor.rotation.y *= 0.9;
    }

    if (pendingArrival) {
      pendingArrival.elapsed += delta;
      if (pendingArrival.elapsed > 0.24 && camera.position.distanceTo(cameraTarget) < 0.085 && cameraLook.distanceTo(lookTarget) < 0.1) {
        const { onArrive } = pendingArrival;
        pendingArrival = null;
        onArrive?.();
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
  return { enterCorridor, enterRoom, returnToCorridor, loopCorridor, setReducedMotion };
}
