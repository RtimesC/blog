import './style.css';
import { ROOMS, ROOM_BY_ID } from './rooms.js';

const body = document.body;
const entrance = document.querySelector('.entrance');
const header = document.querySelector('.site-header');
const enterButton = document.querySelector('#enter-space');
const entryDoorPanel = document.querySelector('.entry-door__panel');
const paperVeil = document.querySelector('#paper-veil');
const mapToggle = document.querySelector('.map-toggle');
const roomMap = document.querySelector('#room-map');
const sceneStatus = document.querySelector('#scene-status');
const doorHint = document.querySelector('#door-hint');
const roomPanel = document.querySelector('#room-panel');
const roomPanelPaper = roomPanel.querySelector('.room-panel__paper');
const panelNumber = document.querySelector('[data-room-number]');
const panelLabel = document.querySelector('[data-room-label]');
const panelKicker = document.querySelector('[data-room-kicker]');
const panelTitle = document.querySelector('[data-room-title]');
const panelCopy = document.querySelector('[data-room-copy]');
const panelFields = document.querySelector('[data-room-fields]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const htmlOnly = new URLSearchParams(window.location.search).get('mode') === 'html';

let activeRoom = null;
let entered = false;
let space = null;
let spaceLoading = null;
let looping = false;
let roomTransitioning = false;

const copy = {
  entrance: ['Behind the paper: four rooms.', 'Open the threshold to begin.'],
  corridor: ['The corridor is a map, not a menu.', 'Choose a door in the corridor, or open the map.'],
  looping: ['The corridor folds back on itself.', 'Passing through the archive…'],
};

function transitionState(element, change, timeout = 900) {
  if (reduceMotion.matches) {
    change();
    return new Promise((resolve) => requestAnimationFrame(resolve));
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      element.removeEventListener('transitionend', finish);
      window.clearTimeout(fallback);
      resolve();
    };
    const fallback = window.setTimeout(finish, timeout);
    element.addEventListener('transitionend', finish);
    change();
  });
}

function coverWithPaper() {
  return transitionState(paperVeil, () => { body.dataset.veil = 'covered'; }, 760);
}

function revealFromPaper() {
  return transitionState(paperVeil, () => { delete body.dataset.veil; }, 760);
}

function setSceneCopy(key, hint = null) {
  if (copy[key]) {
    sceneStatus.textContent = copy[key][0];
    doorHint.textContent = hint ?? copy[key][1];
    return;
  }

  const room = ROOM_BY_ID.get(key);
  if (!room) return;
  sceneStatus.textContent = `Room ${room.number} / ${room.label}`;
  doorHint.textContent = hint ?? 'The paper on the wall is ready to be filled.';
}

function closeMap() {
  mapToggle.setAttribute('aria-expanded', 'false');
  roomMap.hidden = true;
}

function setRoomTransitioning(active) {
  roomTransitioning = active;
  mapToggle.disabled = active;
  if (active) body.dataset.roomTransition = 'true';
  else delete body.dataset.roomTransition;
}

function renderMap() {
  const items = document.createDocumentFragment();
  ROOMS.forEach((room) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.roomTarget = room.id;
    button.textContent = `${room.number} / ${room.label}`;
    items.append(button);
  });
  roomMap.replaceChildren(items);
}

function renderRoomPanel(room) {
  roomPanelPaper.scrollTop = 0;
  roomPanel.style.setProperty('--room-signal', room.color);
  roomPanel.dataset.room = room.id;
  panelNumber.textContent = room.number;
  panelLabel.textContent = room.label;
  panelKicker.textContent = `ROOM / ${room.number}`;
  panelTitle.textContent = room.content.title;
  panelCopy.textContent = room.content.description;

  const fields = document.createDocumentFragment();
  room.content.fields.forEach(([term, detail]) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = detail;
    row.append(dt, dd);
    fields.append(row);
  });
  panelFields.replaceChildren(fields);
}

function revealEnteredState() {
  entered = true;
  body.dataset.entered = 'true';
  entrance.setAttribute('aria-hidden', 'true');
  header.dataset.visible = 'true';
  setSceneCopy('corridor');
}

function showUnavailableState() {
  body.dataset.webgl = 'unavailable';
  delete body.dataset.scene;
  doorHint.textContent = 'The spatial view is unavailable here. Use the map to explore the four rooms.';
}

async function ensureSpace() {
  if (space) return space;
  if (htmlOnly) {
    showUnavailableState();
    return null;
  }
  if (!spaceLoading) {
    body.dataset.scene = 'loading';
    spaceLoading = import('./space.js')
      .then(({ createSpace }) => {
        space = createSpace({
          canvas: document.querySelector('#space'),
          reducedMotion: reduceMotion.matches,
          onDoor: (id) => { void openRoom(id); },
          onHover: (id) => {
            if (activeRoom || roomTransitioning || looping) return;
            const room = ROOM_BY_ID.get(id);
            doorHint.textContent = room ? `Enter ${room.label.toLowerCase()} ${room.symbol} →` : copy.corridor[1];
          },
          onLoop: () => { void loopCorridor(); },
          onLoopHover: (active) => {
            if (activeRoom || looping) return;
            doorHint.textContent = active ? 'Continue through the archive ∞ →' : copy.corridor[1];
          },
          onUnavailable: showUnavailableState,
        });
        delete body.dataset.scene;
        return space;
      })
      .catch(() => {
        showUnavailableState();
        return null;
      });
  }
  return spaceLoading;
}

async function enter() {
  if (entered) return space;
  enterButton.disabled = true;
  enterButton.querySelector('.entry-door__label').textContent = 'Preparing the corridor';
  const entryTransition = transitionState(entryDoorPanel, () => { body.dataset.entry = 'opening'; }, 900);
  const [nextSpace] = await Promise.all([ensureSpace(), entryTransition]);
  await coverWithPaper();
  revealEnteredState();
  if (body.dataset.webgl === 'unavailable') showUnavailableState();
  else nextSpace?.enterCorridor();
  delete body.dataset.entry;
  await revealFromPaper();
  requestAnimationFrame(() => mapToggle.focus({ preventScroll: true }));
  return nextSpace;
}

function revealRoom(room) {
  if (activeRoom !== room.id) return;
  renderRoomPanel(room);
  roomPanel.hidden = false;
  body.dataset.room = room.id;
  setSceneCopy(room.id);
  requestAnimationFrame(() => {
    panelTitle.focus({ preventScroll: true });
    roomPanelPaper.scrollTop = 0;
  });
}

async function openRoom(id) {
  const room = ROOM_BY_ID.get(id);
  if (!room || looping || roomTransitioning) return;

  if (!entered) await enter();
  if (activeRoom === room.id) {
    closeMap();
    requestAnimationFrame(() => panelTitle.focus({ preventScroll: true }));
    return;
  }

  const previousRoom = activeRoom;
  activeRoom = room.id;
  closeMap();
  roomPanel.hidden = true;
  delete body.dataset.room;
  setSceneCopy(room.id, `Walking through the ${room.label.toLowerCase()} door…`);

  if (space && !body.dataset.webgl) {
    setRoomTransitioning(true);
    const enterSelectedRoom = () => {
      activeRoom = room.id;
      space.enterRoom(room.id, () => {
        setRoomTransitioning(false);
        revealRoom(room);
      });
    };
    if (previousRoom) space.returnToCorridor(enterSelectedRoom);
    else enterSelectedRoom();
  } else {
    revealRoom(room);
  }
}

async function loopCorridor() {
  if (!space || activeRoom || looping || roomTransitioning || body.dataset.webgl === 'unavailable') return;
  looping = true;
  closeMap();
  body.dataset.looping = 'true';
  setSceneCopy('looping');

  await space.loopCorridor({
    cover: coverWithPaper,
    reveal: async () => {
      setSceneCopy('corridor');
      await revealFromPaper();
    },
  });

  delete body.dataset.looping;
  looping = false;
  requestAnimationFrame(() => mapToggle.focus({ preventScroll: true }));
}

function returnToCorridor({ focusMap = true } = {}) {
  if (!entered || looping || roomTransitioning) return;
  activeRoom = null;
  roomPanel.hidden = true;
  delete body.dataset.room;
  closeMap();
  setSceneCopy('corridor');
  if (space && !body.dataset.webgl) {
    setRoomTransitioning(true);
    space.returnToCorridor(() => {
      setRoomTransitioning(false);
      if (focusMap) requestAnimationFrame(() => mapToggle.focus({ preventScroll: true }));
    });
  } else if (focusMap) {
    requestAnimationFrame(() => mapToggle.focus({ preventScroll: true }));
  }
}

renderMap();

enterButton.addEventListener('click', () => { void enter(); });

mapToggle.addEventListener('click', () => {
  if (looping || roomTransitioning) return;
  const isOpen = mapToggle.getAttribute('aria-expanded') === 'true';
  mapToggle.setAttribute('aria-expanded', String(!isOpen));
  roomMap.hidden = isOpen;
  if (!isOpen) roomMap.querySelector('button')?.focus({ preventScroll: true });
});

roomMap.addEventListener('click', (event) => {
  if (looping || roomTransitioning) return;
  const button = event.target.closest('[data-room-target]');
  if (button) void openRoom(button.dataset.roomTarget);
});

document.querySelector('.back-button').addEventListener('click', () => returnToCorridor());

document.querySelector('[data-action="home"]')?.addEventListener('click', (event) => {
  event.preventDefault();
  returnToCorridor({ focusMap: false });
});

document.addEventListener('keydown', (event) => {
  if (looping || roomTransitioning) return;
  if (event.key === 'Escape' && activeRoom) {
    returnToCorridor();
  } else if (event.key === 'Escape' && !roomMap.hidden) {
    closeMap();
    mapToggle.focus({ preventScroll: true });
  }
});

reduceMotion.addEventListener('change', (event) => space?.setReducedMotion(event.matches));
