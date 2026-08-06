import * as THREE from 'three';
import {
  INK,
  PAPER,
  createEndGlowTexture,
  makeBox,
  makeDoorCaption,
  makeLabel,
  makePaperCard,
  makeRoughLine,
} from './textures.js';

const DOOR_WIDTH = 3.38;
export const DOOR_PANEL_HEIGHT = 4.78;
export const DOOR_FRAME_WIDTH = DOOR_WIDTH + 0.3;
export const DOOR_FRAME_HEIGHT = 5.08;
export const DOOR_OPENING_WIDTH = DOOR_WIDTH - 0.18;
export const DOOR_OPENING_HEIGHT = DOOR_PANEL_HEIGHT + 0.12;
export const DOOR_PANEL_WIDTH = DOOR_OPENING_WIDTH - 0.08;
const DOOR_HINGE_DEPTH = 0.11;
const DOOR_OPEN_ANGLE = Math.PI * 0.08;

export const getDoorRootY = (scale, floorY) => floorY + (DOOR_FRAME_HEIGHT / 2) * scale;

export function createDoor(room, paper, wallHalfWidth, floorY) {
  const doorPanelHalfWidth = DOOR_PANEL_WIDTH / 2;
  const doorScale = room.doorScale ?? 1;
  const root = new THREE.Group();
  root.position.set(
    room.side * wallHalfWidth,
    getDoorRootY(doorScale, floorY),
    room.z,
  );
  root.rotation.y = -room.side * Math.PI / 2;
  root.scale.setScalar(doorScale);

  const pivot = new THREE.Group();
  pivot.position.set(-doorPanelHalfWidth, 0, DOOR_HINGE_DEPTH);
  root.add(pivot);

  const outerFrameMaterial = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.78 });
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(DOOR_FRAME_WIDTH, DOOR_FRAME_HEIGHT, 0.18)),
    outerFrameMaterial,
  );
  root.add(frame);

  const panel = makePaperCard(DOOR_PANEL_WIDTH, DOOR_PANEL_HEIGHT, new THREE.Color(room.colorValue).lerp(new THREE.Color(PAPER), 0.72), paper);
  panel.material.polygonOffset = true;
  panel.material.polygonOffsetFactor = -1;
  panel.material.polygonOffsetUnits = -1;
  panel.position.set(doorPanelHalfWidth, 0, 0);
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

  const threshold = makeBox(DOOR_WIDTH + 0.38, 0.08, 0.2, 0xcfc1aa);
  threshold.position.set(0, -2.5, 0.12);
  root.add(threshold);

  const headerSlip = makePaperCard(2.08, 0.2, 0xf4ecdc);
  headerSlip.position.set(doorPanelHalfWidth, 1.98, 0.2 - DOOR_HINGE_DEPTH);
  pivot.add(headerSlip);
  pivot.add(makeRoughLine([
    new THREE.Vector3(doorPanelHalfWidth - 1.04, 1.98, 0.22 - DOOR_HINGE_DEPTH),
    new THREE.Vector3(doorPanelHalfWidth + 1.04, 1.98, 0.22 - DOOR_HINGE_DEPTH),
  ], room.colorValue, 0.52));

  const sketch = makeRoughLine([
    new THREE.Vector3(DOOR_PANEL_WIDTH * 0.1, 1.48, 0.14 - DOOR_HINGE_DEPTH),
    new THREE.Vector3(DOOR_PANEL_WIDTH * 0.86, -1.48, 0.14 - DOOR_HINGE_DEPTH),
    new THREE.Vector3(DOOR_PANEL_WIDTH * 0.21, -1.7, 0.14 - DOOR_HINGE_DEPTH),
    new THREE.Vector3(DOOR_PANEL_WIDTH * 0.91, 1.23, 0.14 - DOOR_HINGE_DEPTH),
  ], room.colorValue, 0.78);
  pivot.add(sketch);

  const handle = new THREE.Group();
  handle.position.set(DOOR_PANEL_WIDTH - 0.35, -0.14, 0.24 - DOOR_HINGE_DEPTH);
  const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x86755e, roughness: 0.84 });
  const escutcheon = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.055, 16), handleMaterial);
  escutcheon.rotation.x = Math.PI / 2;
  escutcheon.userData.room = room.id;
  handle.add(escutcheon);

  const lever = makeBox(0.36, 0.065, 0.08, 0x756652);
  lever.position.set(-0.16, 0, 0.08);
  lever.userData.room = room.id;
  handle.add(lever);
  pivot.add(handle);

  const mark = makeLabel(`${room.number} / ${room.symbol}`, room.colorValue, { small: true, compact: true });
  mark.material.depthTest = false;
  mark.renderOrder = 5;

  return {
    room,
    root,
    pivot,
    panel,
    handle,
    frameMaterials: [outerFrameMaterial],
    pickTargets: [panel, escutcheon, lever, mobileHitTarget],
    basePositionX: room.side * wallHalfWidth,
    basePositionY: getDoorRootY(doorScale, floorY),
    baseScale: doorScale,
    mark,
    mobileHitTarget,
    restAngle: 0,
    openAngle: DOOR_OPEN_ANGLE,
    hover: 0,
    latch: 0,
    open: 0,
    motion: 0,
  };
}

export function createLoopDoor(paper, corridorWidth) {
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
