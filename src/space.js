import * as THREE from 'three';
import { ROOM_BY_ID, ROOMS } from './rooms.js';

const INK = 0x171a20;
const PAPER = 0xe9e2d2;
const WALL = 0xd8d0bf;

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

function createLabelTexture(text, color, { wide = false, small = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = wide ? 1024 : 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = `${small ? '500 27px' : '600 38px'} ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.fillStyle = '#171a20';
  context.fillText(text, 34, small ? 67 : 70);
  context.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.lineWidth = small ? 3 : 5;
  context.beginPath();
  context.moveTo(34, small ? 84 : 91);
  context.lineTo(canvas.width - 38, small ? 84 : 91);
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeLabel(text, color, options = {}) {
  const texture = createLabelTexture(text, color, options);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const width = options.wide ? 7.1 : 4.6;
  const height = options.small ? 0.8 : 1.15;
  sprite.scale.set(width, height, 1);
  return sprite;
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

function createRoomStage(room, paper) {
  const root = new THREE.Group();
  root.position.set(room.side * 10.4, 0, room.z);
  addStageShell(root, room, paper);
  STAGE_BUILDERS[room.stage]?.(root, room, paper);
  return root;
}

function createDoor(room, paper) {
  const root = new THREE.Group();
  root.position.set(room.side * 5.88, 0.2, room.z);
  root.rotation.y = -room.side * Math.PI / 2;

  const pivot = new THREE.Group();
  pivot.position.x = -1.4;
  root.add(pivot);

  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(3.08, 5.08, 0.18)),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.88 }),
  );
  frame.position.x = 1.4;
  pivot.add(frame);

  const panel = makePaperCard(2.78, 4.78, new THREE.Color(room.colorValue).lerp(new THREE.Color(PAPER), 0.72), paper);
  panel.position.set(1.4, 0, 0.11);
  panel.userData.room = room.id;
  pivot.add(panel);

  const sketch = makeRoughLine([
    new THREE.Vector3(0.27, 1.48, 0.14),
    new THREE.Vector3(2.38, -1.48, 0.14),
    new THREE.Vector3(0.56, -1.7, 0.14),
    new THREE.Vector3(2.52, 1.23, 0.14),
  ], room.colorValue, 0.78);
  pivot.add(sketch);

  const mark = makeLabel(`${room.number} / ${room.symbol}`, room.colorValue, { small: true });
  mark.position.set(0, -3.25, 0.2);
  root.add(mark);

  return { room, root, pivot, panel, baseRotation: 0, hover: 0, open: 0 };
}

export function createSpace({ canvas, reducedMotion, onDoor, onHover, onUnavailable }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    onUnavailable();
    return { enterCorridor() {}, enterRoom() {}, returnToCorridor() {}, setReducedMotion() {} };
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x2b2d2c, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x5b584f, 29, 92);
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
  const doors = [];
  const doorMeshes = [];
  const stageById = new Map();
  const corridor = new THREE.Group();
  const stages = new THREE.Group();
  scene.add(corridor, stages);

  scene.add(new THREE.HemisphereLight(0xfff2dc, 0x3a3933, 1.72));
  const keyLight = new THREE.DirectionalLight(0xffefd1, 2.35);
  keyLight.position.set(0, 8, 8);
  scene.add(keyLight);
  const archiveLight = new THREE.PointLight(0xffd797, 11, 38, 2);
  archiveLight.position.set(0, 2.8, -68);
  scene.add(archiveLight);

  const floor = makePaperCard(12, 108, PAPER, paper);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -3.2, -26);
  corridor.add(floor);

  const ceiling = makePaperCard(12, 108, WALL, paper);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 5.45, -26);
  ceiling.material = new THREE.MeshBasicMaterial({
    color: 0xe8dfcf,
    map: paper,
    side: THREE.DoubleSide,
  });
  corridor.add(ceiling);

  [-1, 1].forEach((side) => {
    const wall = makePaperCard(108, 8.7, WALL, paper);
    wall.position.set(side * 5.96, 1.1, -26);
    wall.rotation.y = side * Math.PI / 2;
    corridor.add(wall);
  });

  for (let z = 13; z > -76; z -= 4) {
    corridor.add(makeRoughLine([
      new THREE.Vector3(-1.35, -3.12, z),
      new THREE.Vector3(1.35, -3.12, z - 1.9),
    ], 0x353941, 0.7));
  }

  [-5.82, 5.82].forEach((x) => {
    corridor.add(makeRoughLine([
      new THREE.Vector3(x, -3.1, 15),
      new THREE.Vector3(x, 5.35, -78),
    ], 0x30333a, 0.52));
  });

  for (let z = 12; z > -76; z -= 5) {
    corridor.add(makeRoughLine([
      new THREE.Vector3(-2, 5.27, z),
      new THREE.Vector3(2, 5.27, z),
    ], 0x34373d, 0.38));
  }

  const endFrame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4.8, 6.8, 0.2)),
    new THREE.LineBasicMaterial({ color: 0x6a6d71, transparent: true, opacity: 0.58 }),
  );
  endFrame.position.set(0, 0.1, -76);
  corridor.add(endFrame);
  const endWall = makePaperCard(11.7, 8.45, 0xe0d4bd, paper);
  endWall.position.set(0, 1.08, -76.15);
  endWall.material.map.repeat.set(2.8, 2.2);
  corridor.add(endWall);
  const endLabel = makeLabel('ARCHIVE CONTINUES', 0xb77d4d, { small: true, wide: true });
  endLabel.position.set(0, -1.4, -75.88);
  endLabel.scale.x = 3.3;
  corridor.add(endLabel);

  ROOMS.forEach((room) => {
    const door = createDoor(room, paper);
    doors.push(door);
    doorMeshes.push(door.panel);
    corridor.add(door.root);
    const stage = createRoomStage(room, paper);
    stage.visible = false;
    stageById.set(room.id, stage);
    stages.add(stage);

    const landmark = makeLabel(`${room.number}  ${room.label}`, room.colorValue, { small: true });
    landmark.position.set(-room.side * 3.55, 2.8, room.z + 0.65);
    landmark.scale.x = 2.9;
    corridor.add(landmark);
  });

  let entered = false;
  let roomActive = false;
  let activeRoomId = null;
  let motionReduced = reducedMotion;
  let hoverDoor = null;
  let pendingArrival = null;

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, motionReduced ? 1 : 1.55));
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
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

  function setDoorState() {
    doors.forEach((door) => {
      door.open = door.room.id === activeRoomId ? 1 : 0;
    });
  }

  function setStageVisibility(id = null) {
    stages.children.forEach((stage) => {
      stage.visible = stage === stageById.get(id);
    });
  }

  function enterCorridor() {
    entered = true;
    roomActive = false;
    activeRoomId = null;
    corridor.visible = true;
    setStageVisibility();
    setDoorState();
    moveTo([0, 0.1, 10.5], [0, 0, -6]);
  }

  function enterRoom(id, onArrive) {
    const room = ROOM_BY_ID.get(id);
    if (!room) return;
    roomActive = true;
    activeRoomId = room.id;
    corridor.visible = true;
    setStageVisibility(room.id);
    setDoorState();
    moveTo(room.camera.approach, room.camera.approachLook, () => {
      corridor.visible = false;
      moveTo(room.camera.position, room.camera.lookAt, onArrive);
    });
  }

  function returnToCorridor() {
    const room = ROOM_BY_ID.get(activeRoomId);
    if (!room) {
      enterCorridor();
      return;
    }

    roomActive = true;
    moveTo(room.camera.approach, room.camera.approachLook, () => {
      corridor.visible = true;
      setStageVisibility();
      activeRoomId = null;
      roomActive = false;
      setDoorState();
      moveTo([0, 0.1, 7], [0, 0, -10]);
    });
  }

  function setReducedMotion(value) {
    motionReduced = value;
    resize();
  }

  function pick(event, click = false) {
    if (!entered || roomActive) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(doorMeshes, false)[0]?.object ?? null;
    const next = hit?.userData.room ?? null;
    if (hoverDoor !== next) {
      hoverDoor = next;
      canvas.style.cursor = next ? 'pointer' : 'default';
      onHover(next);
    }
    if (click && next) onDoor(next);
  }

  canvas.addEventListener('pointermove', (event) => pick(event));
  canvas.addEventListener('pointerleave', () => {
    hoverDoor = null;
    canvas.style.cursor = 'default';
    onHover(null);
  });
  canvas.addEventListener('click', (event) => pick(event, true));
  window.addEventListener('resize', resize);
  resize();

  function render() {
    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.getElapsedTime();
    const blend = motionReduced ? 1 : 1 - Math.exp(-delta * 6.8);
    camera.position.lerp(cameraTarget, blend);
    cameraLook.lerp(lookTarget, blend);
    camera.lookAt(cameraLook);

    doors.forEach((door) => {
      const targetHover = hoverDoor === door.room.id && !roomActive ? 1 : 0;
      door.hover += (targetHover - door.hover) * (motionReduced ? 1 : 0.11);
      const targetOpen = door.open * door.room.side * 0.74 + door.hover * door.room.side * 0.075;
      door.pivot.rotation.y += (targetOpen - door.pivot.rotation.y) * (motionReduced ? 1 : 0.1);
      door.panel.material.emissive?.setHex(door.room.colorValue);
      door.panel.material.emissiveIntensity = door.hover * 0.22 + door.open * 0.1;
    });

    if (entered && !motionReduced && !roomActive) {
      corridor.rotation.y = Math.sin(elapsed * 0.16) * 0.012;
      keyLight.intensity = 1.78 + Math.sin(elapsed * 0.55) * 0.18;
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
  return { enterCorridor, enterRoom, returnToCorridor, setReducedMotion };
}
