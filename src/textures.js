import * as THREE from 'three';

export const INK = 0x171a20;
export const PAPER = 0xe9e2d2;

export function createPaperTexture({ ruled = true } = {}) {
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

export function createEndGlowTexture() {
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

export function makeLabel(text, color, options = {}) {
  const texture = createLabelTexture(text, color, options);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const width = options.wide ? 7.1 : 4.6;
  const height = options.small ? 0.94 : 1.15;
  sprite.scale.set(width, height, 1);
  return sprite;
}

export function makeDoorCaption(text, color, width, height) {
  const texture = createLabelTexture(text, color, { small: true, compact: true });
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}

export function makeRoughLine(points, color = INK, opacity = 0.86) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geometry, material);
}

export function makePaperCard(width, height, color = PAPER, texture = null) {
  const material = new THREE.MeshStandardMaterial({
    color,
    map: texture,
    roughness: 1,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}

export function makeBox(width, height, depth, color = PAPER) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.94 }),
  );
}
