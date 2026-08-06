import * as THREE from 'three';
import {
  PAPER,
  createPaperTexture,
  makeBox,
  makeLabel,
  makePaperCard,
  makeRoughLine,
} from './textures.js';

function addStageGround(root, room, paper) {
  const floor = makePaperCard(28, 28, PAPER, paper);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.18;
  floor.material.map = paper.clone();
  floor.material.map.repeat.set(7, 7);
  floor.material.map.needsUpdate = true;
  root.add(floor);

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

  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: room.colorValue, roughness: 0.7 }),
  );
  pin.position.set(-1.45, -1.03, -0.38);
  root.add(pin);

  root.add(makeRoughLine([
    new THREE.Vector3(-1.25, -1.02, 0.15),
    new THREE.Vector3(-0.6, -1.01, 0.5),
    new THREE.Vector3(0.05, -1.01, -0.02),
    new THREE.Vector3(0.85, -1.01, 0.35),
  ], room.colorValue, 0.8));
}

function addGalleryWall(root, room) {
  [-1.85, 0, 1.85].forEach((z, index) => {
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

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 0.24, 24),
    new THREE.MeshStandardMaterial({ color: room.colorValue, roughness: 0.78 }),
  );
  disc.position.set(1.2, -1.0, -0.35);
  root.add(disc);

  const cube = makeBox(0.55, 0.55, 0.55, 0x303f39);
  cube.position.set(1.15, -0.62, 0.55);
  cube.rotation.set(0.25, 0.35, 0.08);
  root.add(cube);

  root.add(makeRoughLine([
    new THREE.Vector3(-1.45, -1.01, -0.32),
    new THREE.Vector3(-0.8, -1.0, 0.46),
    new THREE.Vector3(-0.12, -1.0, -0.42),
    new THREE.Vector3(0.52, -1.0, 0.28),
  ], room.colorValue, 0.9));
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
  const lampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.48, 0.55, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: room.colorValue, side: THREE.DoubleSide, roughness: 0.8 }),
  );
  lampShade.position.set(1.35, 0.22, 0.72);
  lampShade.rotation.x = Math.PI;
  root.add(lampShade);

  root.add(makeRoughLine([
    new THREE.Vector3(-1.15, -1.1, 0.28),
    new THREE.Vector3(-0.58, -1.1, -0.18),
    new THREE.Vector3(0.02, -1.1, 0.22),
  ], room.colorValue, 0.8));
}

const STAGE_BUILDERS = {
  workbench: addWorkbench,
  'gallery-wall': addGalleryWall,
  'project-table': addProjectTable,
  'message-desk': addMessageDesk,
};

export function createRoomStage(room, paper, corridorHalfWidth) {
  const root = new THREE.Group();
  root.position.set(room.side * (corridorHalfWidth + 4.4), 0, room.z);
  addStageGround(root, room, paper);
  STAGE_BUILDERS[room.stage]?.(root, room, paper);
  return root;
}
