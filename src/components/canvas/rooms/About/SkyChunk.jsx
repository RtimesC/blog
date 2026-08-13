import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CHUNK_LENGTH = 40;
export const CORRIDOR_CLIP_Z = -8.0;
export const ROOM_Z = -25;

const CHUNK_WIDTH = 20;
const CHUNK_HEIGHT = 12;

const SkyChunk = ({ chunkIndex = 0, seed = 0, scrollProgressRef }) => {
  const signals = useMemo(() => {
    const random = seededRandom(seed + chunkIndex * 1000);
    return Array.from({ length: 20 }, (_, index) => ({
      id: `${chunkIndex}-${index}`,
      position: [
        (random() - 0.5) * CHUNK_WIDTH,
        (random() - 0.5) * CHUNK_HEIGHT,
        -(chunkIndex * CHUNK_LENGTH) - 15 - random() * CHUNK_LENGTH
      ],
      scale: 0.45 + random() * 1.15,
      opacity: 0.08 + random() * 0.16,
      phase: random() * Math.PI * 2,
      drift: 0.16 + random() * 0.25
    }));
  }, [chunkIndex, seed]);

  return (
    <group>
      {signals.map((signal) => (
        <PaperCloud key={signal.id} {...signal} scrollProgressRef={scrollProgressRef} />
      ))}
    </group>
  );
};

const PaperCloud = ({ position, scale, opacity, phase, drift, scrollProgressRef }) => {
  const groupRef = useRef();
  const materialRefs = useRef([]);
  const basePosition = useRef(position);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const scrollProgress = scrollProgressRef?.current || 0;
    const worldZ = ROOM_Z + scrollProgress + basePosition.current[2];
    const nearFactor = THREE.MathUtils.clamp((worldZ + 60) / 52, 0, 1);
    const side = basePosition.current[0] >= 0 ? 1 : -1;

    groupRef.current.position.set(
      basePosition.current[0] + Math.sin(time * drift + phase) * 0.45 + nearFactor * side * 7,
      basePosition.current[1] + Math.cos(time * drift * 0.7 + phase) * 0.2,
      basePosition.current[2]
    );
    groupRef.current.rotation.z = Math.sin(time * drift + phase) * 0.08;

    const targetOpacity = worldZ < CORRIDOR_CLIP_Z ? opacity : 0;
    materialRefs.current.forEach((material, index) => {
      if (material) material.opacity = targetOpacity * (index === 0 ? 1 : index === 1 ? 0.9 : 0.8);
    });
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh>
        <circleGeometry args={[1.1, 24]} />
        <meshBasicMaterial ref={(material) => { materialRefs.current[0] = material; }} color="#f8f4e8" transparent opacity={opacity} depthWrite={false} />
      </mesh>
      <mesh position={[0.82, -0.08, -0.01]}>
        <circleGeometry args={[0.72, 24]} />
        <meshBasicMaterial ref={(material) => { materialRefs.current[1] = material; }} color="#e1f0ed" transparent opacity={opacity * 0.9} depthWrite={false} />
      </mesh>
      <mesh position={[-0.84, -0.18, -0.02]}>
        <circleGeometry args={[0.62, 24]} />
        <meshBasicMaterial ref={(material) => { materialRefs.current[2] = material; }} color="#e6edf4" transparent opacity={opacity * 0.8} depthWrite={false} />
      </mesh>
    </group>
  );
};

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = Math.sin(state * 9999) * 10000;
    return state - Math.floor(state);
  };
}

export default SkyChunk;
