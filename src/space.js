import * as THREE from 'three';
import { ROOM_BY_ID } from './rooms.js';
import {
  MOBILE_CORRIDOR_LOOK,
  MOBILE_CORRIDOR_POSITION,
  OPEN_FIELD,
  createSpaceLayout,
} from './space-layout.js';

const DOOR_LATCH_DELAY = 0.11;
const DOOR_OPEN_SETTLE = 0.38;
const DOOR_CLOSE_SETTLE = 0.34;

const smoothstep = (value) => value * value * (3 - 2 * value);

export function createSpace({ canvas, reducedMotion, onDoor, onHover, onLoop, onLoopHover, onUnavailable }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    onUnavailable();
    return { enterCorridor() {}, enterRoom() {}, returnToCorridor() {}, loopCorridor: async () => {}, setReducedMotion() {} };
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(OPEN_FIELD, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(OPEN_FIELD, 54, 90);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.2, 17);
  const cameraTarget = camera.position.clone();
  const cameraLook = new THREE.Vector3(0, 0, 0);
  const lookTarget = cameraLook.clone();
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const {
    applyResponsiveLayout,
    corridor,
    doors,
    endScene,
    keyLight,
    loopDoor,
    pickMeshes,
    stageById,
    stages,
  } = createSpaceLayout(scene);

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
  let cameraFovTarget = camera.fov;

  function setCameraLens({ immediate = false } = {}) {
    cameraFovTarget = isMobileViewport ? (roomActive ? 58 : 56) : 42;
    if (immediate || motionReduced) {
      camera.fov = cameraFovTarget;
      camera.updateProjectionMatrix();
    }
  }

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, motionReduced ? 1 : 2));
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    isMobileViewport = camera.aspect < 0.72;
    setCameraLens({ immediate: true });
    applyResponsiveLayout(isMobileViewport);
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
      door.motion = door.open;
      if (!door.open) door.latch = 0;
    });
  }

  function setDoorPoseImmediately(door, open) {
    door.open = open ? 1 : 0;
    if (Number.isFinite(door.motion)) door.motion = door.open;
    door.latch = 0;
    door.pivot.rotation.y = door.restAngle + (door.motion ?? door.open) * door.openAngle;
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

    const tracksMotion = Number.isFinite(door.motion);
    let motionFrom = tracksMotion ? door.motion : 0;
    if (tracksMotion && opening && door.hover > 0) {
      motionFrom = THREE.MathUtils.clamp(
        motionFrom + (door.hover * 0.035) / door.openAngle,
        0,
        1,
      );
      door.motion = motionFrom;
      door.hover = 0;
    }
    door.open = tracksMotion ? (opening ? 1 : 0) : 0;
    door.latch = opening ? 1 : 0;
    pendingDoorAction = {
      door,
      opening,
      elapsed: 0,
      from: motionFrom,
      to: opening ? 1 : 0,
      onComplete,
    };
  }

  function advanceDoorAction(delta) {
    const action = pendingDoorAction;
    if (!action) return;

    action.elapsed += delta;
    const duration = action.opening ? DOOR_OPEN_SETTLE : DOOR_CLOSE_SETTLE;

    if (Number.isFinite(action.door.motion)) {
      const delay = action.opening ? DOOR_LATCH_DELAY : 0;
      const progress = THREE.MathUtils.clamp(
        (action.elapsed - delay) / Math.max(duration - delay, 0.001),
        0,
        1,
      );
      action.door.motion = THREE.MathUtils.lerp(action.from, action.to, smoothstep(progress));
    } else if (action.opening && action.elapsed >= DOOR_LATCH_DELAY) {
      action.door.open = 1;
    }

    if (action.elapsed < duration) return;

    action.door.open = action.opening ? 1 : 0;
    if (Number.isFinite(action.door.motion)) action.door.motion = action.to;
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
    setStageVisibility();
    setDoorState(false);
    startDoorAction(door, true, () => {
      const approach = getRoomApproach(room);
      moveTo(approach.position, approach.lookAt, () => {
        corridor.visible = false;
        setStageVisibility(room.id);
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
    const nextFov = THREE.MathUtils.lerp(camera.fov, cameraFovTarget, blend);
    if (Math.abs(nextFov - camera.fov) > 0.0001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(cameraLook);

    advanceDoorAction(delta);

    const hoverBlend = motionReduced ? 1 : 1 - Math.exp(-delta * 9.5);
    const loopPanelBlend = motionReduced ? 1 : 1 - Math.exp(-delta * 11.5);
    const handleBlend = motionReduced ? 1 : 1 - Math.exp(-delta * 15);
    doors.forEach((door) => {
      const targetHover = hoverDoor === door.room.id && !roomActive && !loopActive ? 1 : 0;
      door.hover += (targetHover - door.hover) * hoverBlend;
      const targetOpen = door.restAngle + door.motion * door.openAngle + door.hover * 0.035;
      door.pivot.rotation.y = targetOpen;
      const interaction = Math.max(door.hover, door.latch);
      const targetHandle = 0.24 * interaction + 0.07 * door.open;
      door.handle.rotation.z += (targetHandle - door.handle.rotation.z) * handleBlend;
      door.frameMaterials.forEach((material) => {
        material.opacity = 0.78 + interaction * 0.16;
      });
      door.panel.material.setPaintProgress?.(interaction);
    });

    const targetLoopHover = hoverLoop && !roomActive && !loopActive ? 1 : 0;
    loopDoor.hover += (targetLoopHover - loopDoor.hover) * hoverBlend;
    const loopInteraction = Math.max(loopDoor.hover, loopDoor.latch);
    const loopOpen = loopDoor.open * loopDoor.openAngle + loopDoor.hover * 0.06;
    loopDoor.pivot.rotation.y += (loopOpen - loopDoor.pivot.rotation.y) * loopPanelBlend;
    const loopHandle = 0.22 * loopInteraction + 0.07 * loopDoor.open;
    loopDoor.handle.rotation.z += (loopHandle - loopDoor.handle.rotation.z) * handleBlend;
    loopDoor.frameMaterials.forEach((material, index) => {
      material.opacity = (index === 0 ? 0.76 : 0.5) + loopInteraction * 0.18;
    });
    loopDoor.panel.material.emissive?.setHex(0xd9b36f);
    loopDoor.panel.material.emissiveIntensity = loopInteraction * 0.16 + loopDoor.open * 0.08;

    const corridorIdle = entered && !motionReduced && !roomActive && !loopActive;
    const ambientBlend = motionReduced ? 1 : 1 - Math.exp(-delta * 3.5);
    corridor.rotation.y = 0;
    const lightTarget = corridorIdle ? 1.78 + Math.sin(elapsed * 0.55) * 0.18 : 1.78;
    keyLight.intensity += (lightTarget - keyLight.intensity) * ambientBlend;

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
