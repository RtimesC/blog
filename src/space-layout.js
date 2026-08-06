import * as THREE from 'three';
import {
  DOOR_FRAME_HEIGHT,
  DOOR_OPENING_HEIGHT,
  DOOR_OPENING_WIDTH,
  createDoor,
  createLoopDoor,
  getDoorRootY,
} from './doors.js';
import { ROOMS } from './rooms.js';
import { createRoomStage } from './stages.js';
import {
  PAPER,
  createPaperTexture,
  makeLabel,
  makePaperCard,
  makeRoughLine,
} from './textures.js';

export const OPEN_FIELD = 0xd8d0bf;
export const MOBILE_CORRIDOR_POSITION = [0, 0.2, 13.5];
export const MOBILE_CORRIDOR_LOOK = [0, 0, -16];

const CORRIDOR_FLOOR_Y = -3.2;
const CORRIDOR_WALL_INSET = 0.04;

function makePaperWallWithOpenings(width, height, openings, texture) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(-width / 2, height / 2);
  shape.lineTo(width / 2, height / 2);
  shape.lineTo(width / 2, -height / 2);
  shape.closePath();

  openings.forEach(({ x, y, width: openingWidth, height: openingHeight }) => {
    const opening = new THREE.Path();
    opening.moveTo(x - openingWidth / 2, y - openingHeight / 2);
    opening.lineTo(x + openingWidth / 2, y - openingHeight / 2);
    opening.lineTo(x + openingWidth / 2, y + openingHeight / 2);
    opening.lineTo(x - openingWidth / 2, y + openingHeight / 2);
    opening.closePath();
    shape.holes.push(opening);
  });

  const geometry = new THREE.ShapeGeometry(shape);
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  for (let index = 0; index < positions.count; index += 1) {
    uvs.setXY(
      index,
      positions.getX(index) / width + 0.5,
      positions.getY(index) / height + 0.5,
    );
  }
  uvs.needsUpdate = true;

  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: PAPER, map: texture, side: THREE.DoubleSide }),
  );
}

function getWallOpenings({ side, wallCenterZ, wallAngle = 0, getScale }) {
  return ROOMS
    .filter((room) => room.side === side)
    .map((room) => {
      const scale = getScale(room);
      return {
        x: -side * (room.z - wallCenterZ) / Math.cos(wallAngle),
        y: getDoorRootY(scale, CORRIDOR_FLOOR_Y),
        width: DOOR_OPENING_WIDTH * scale,
        height: DOOR_OPENING_HEIGHT * scale,
      };
    });
}

function positionDoorAnnotations(door, isMobileViewport) {
  const corridorNormalX = Math.sin(door.root.rotation.y);
  const corridorNormalZ = Math.cos(door.root.rotation.y);
  const doorScale = door.root.scale.y;
  const frameHalfHeight = (DOOR_FRAME_HEIGHT / 2) * doorScale;
  const surfaceOffset = isMobileViewport ? 0.55 : 0.24;
  const lead = isMobileViewport ? 0.08 : 0.12;
  const anchorX = door.root.position.x + corridorNormalX * surfaceOffset;
  const anchorZ = door.root.position.z + corridorNormalZ * surfaceOffset + lead;
  const landmark = isMobileViewport ? door.mobileLandmark : door.landmark;

  landmark.position.set(
    anchorX,
    door.root.position.y + frameHalfHeight + 0.36 * doorScale,
    anchorZ,
  );
  landmark.scale.set(
    (isMobileViewport ? 3.2 : 2.15) * door.landmarkScale,
    (isMobileViewport ? 0.68 : 0.66) * door.landmarkScale,
    1,
  );

  door.mark.position.set(
    anchorX,
    door.root.position.y - frameHalfHeight + 0.17 * doorScale,
    anchorZ + 0.06,
  );
  door.mark.scale.set(1.55 * door.landmarkScale, 0.5 * door.landmarkScale, 1);
}

export function createSpaceLayout(scene) {
  const paper = createPaperTexture();
  paper.repeat.set(5, 12);

  const corridorWidth = 16;
  const corridorHalfWidth = corridorWidth / 2;
  const desktopWallHalfWidth = corridorHalfWidth - CORRIDOR_WALL_INSET;
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
  const mobileWallHeight = 8.7 * 1.28;
  const mobileWallCenterY = CORRIDOR_FLOOR_Y + mobileWallHeight / 2;
  const mobileDoorScale = 1.6;
  const mobileWallHalfWidthAt = (z) => (
    mobileWallCenterHalfWidth + mobileWallSlope * (z - corridorCenterZ)
  );

  const doors = [];
  const doorMeshes = [];
  const corridorWalls = [];
  const mobileCorridorWalls = [];
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
  floor.position.set(0, CORRIDOR_FLOOR_Y, corridorCenterZ);
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
    const desktopWallHeight = 8.7;
    const desktopWallCenterY = 1.1;
    const desktopOpenings = getWallOpenings({
      side,
      wallCenterZ: corridorCenterZ,
      getScale: (room) => room.doorScale ?? 1,
    }).map((opening) => ({
      ...opening,
      y: opening.y - desktopWallCenterY,
    }));
    const wall = makePaperWallWithOpenings(
      corridorLength + 3,
      desktopWallHeight,
      desktopOpenings,
      paper,
    );
    wall.position.set(side * desktopWallHalfWidth, desktopWallCenterY, corridorCenterZ);
    wall.rotation.y = side * Math.PI / 2;
    wall.userData.side = side;
    corridorWalls.push(wall);
    corridor.add(wall);

    const mobileOpenings = getWallOpenings({
      side,
      wallCenterZ: corridorCenterZ,
      wallAngle: mobileWallAngle,
      getScale: () => mobileDoorScale,
    }).map((opening) => ({
      ...opening,
      y: opening.y - mobileWallCenterY,
    }));
    const mobileWall = makePaperWallWithOpenings(
      mobileWallSpan,
      mobileWallHeight,
      mobileOpenings,
      paper,
    );
    mobileWall.position.set(
      side * mobileWallCenterHalfWidth,
      mobileWallCenterY,
      corridorCenterZ,
    );
    mobileWall.rotation.y = side * (Math.PI / 2 + mobileWallAngle);
    mobileWall.visible = false;
    mobileCorridorWalls.push(mobileWall);
    corridor.add(mobileWall);
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
  endScene.add(loopDoor.root);

  ROOMS.forEach((room) => {
    const door = createDoor(room, paper, desktopWallHalfWidth, CORRIDOR_FLOOR_Y);
    doors.push(door);
    doorMeshes.push(...door.pickTargets);
    corridor.add(door.root);

    const stage = createRoomStage(room, paper, corridorHalfWidth);
    stage.visible = false;
    stageById.set(room.id, stage);
    stages.add(stage);

    const landmark = makeLabel(`${room.number}  ${room.label}`, room.colorValue, { small: true, compact: true });
    const landmarkScale = room.landmarkScale ?? 1;
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
    corridor.add(door.mark);
  });

  function applyResponsiveLayout(isMobileViewport) {
    if (isMobileViewport) {
      const endScale = 0.86;
      const endZ = -42;
      const endThresholdY = loopDoor.doorY - 2.53;
      endScene.position.set(0, CORRIDOR_FLOOR_Y - endThresholdY * endScale, endZ);
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
      corridorWalls.forEach((wall) => { wall.visible = false; });
      mobileCorridorWalls.forEach((wall) => { wall.visible = true; });
    } else {
      endScene.position.set(0, 0, corridorEndZ);
      endScene.scale.set(1, 1, 1);
      loopDoor.wall.position.y = 1.1;
      loopDoor.wall.scale.set(1, 1, 1);
      archiveLight.position.set(0, 2.8, corridorEndZ + 7);
      ceiling.position.y = 5.45;
      ceilingLines.forEach((line) => { line.position.y = 0; });
      corridorWalls.forEach((wall) => {
        wall.visible = true;
        wall.position.x = wall.userData.side * desktopWallHalfWidth;
        wall.position.y = 1.1;
        wall.rotation.y = wall.userData.side * Math.PI / 2;
        wall.scale.y = 1;
      });
      mobileCorridorWalls.forEach((wall) => { wall.visible = false; });
    }

    doors.forEach((door) => {
      if (isMobileViewport) {
        const mobileRotation = -door.room.side * (Math.PI / 2 - mobileWallAngle);
        const wallHalfWidth = mobileWallHalfWidthAt(door.room.z);
        door.root.position.x = door.room.side * wallHalfWidth;
        door.root.position.y = getDoorRootY(mobileDoorScale, CORRIDOR_FLOOR_Y);
        door.root.position.z = door.room.z;
        door.root.rotation.y = mobileRotation;
        door.root.scale.setScalar(mobileDoorScale);
        door.landmark.visible = false;
        door.mobileLandmark.visible = true;
        door.mark.visible = false;
        positionDoorAnnotations(door, true);
        door.mobileHitTarget.visible = true;
        door.mobileHitTarget.scale.set(1.65, 1.25, 1);
      } else {
        door.root.position.x = door.basePositionX;
        door.root.position.y = door.basePositionY;
        door.root.position.z = door.room.z;
        door.root.rotation.y = -door.room.side * Math.PI / 2;
        door.root.scale.setScalar(door.baseScale);
        door.landmark.visible = true;
        door.mobileLandmark.visible = false;
        door.mark.visible = true;
        positionDoorAnnotations(door, false);
        door.mobileHitTarget.visible = false;
        door.mobileHitTarget.scale.set(1, 1, 1);
      }
    });
  }

  return {
    applyResponsiveLayout,
    corridor,
    doors,
    endScene,
    keyLight,
    loopDoor,
    pickMeshes: [...doorMeshes, ...loopDoor.pickTargets],
    stageById,
    stages,
  };
}
