import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import SkyChunk, { CHUNK_LENGTH, CORRIDOR_CLIP_Z, ROOM_Z } from './SkyChunk';
import { aboutMilestones } from '../../../../content/portfolio';

const STORY_CYCLE_LENGTH = 160;
const INK = '#1d2c2a';
const MUTED_INK = '#52615d';
const TEAL = '#5aaea5';

const InfiniteSkyManager = ({ scrollProgressRef }) => {
  const [activeChunks, setActiveChunks] = useState([-1, 0, 1, 2]);
  const [activeStoryCycles, setActiveStoryCycles] = useState([-1, 0, 1]);
  const worldRef = useRef();

  useFrame(() => {
    if (!worldRef.current) return;

    const progress = scrollProgressRef?.current || 0;
    worldRef.current.position.z = progress;

    const chunk = Math.floor(progress / CHUNK_LENGTH);
    const nextChunks = [chunk - 1, chunk, chunk + 1, chunk + 2];
    if (!sameValues(nextChunks, activeChunks)) setActiveChunks(nextChunks);

    const cycle = Math.floor(progress / STORY_CYCLE_LENGTH);
    const nextCycles = [cycle - 1, cycle, cycle + 1];
    if (!sameValues(nextCycles, activeStoryCycles)) setActiveStoryCycles(nextCycles);
  });

  return (
    <group ref={worldRef}>
      {activeChunks.map((chunkIndex) => (
        <SkyChunk key={`sky-${chunkIndex}`} chunkIndex={chunkIndex} seed={42} scrollProgressRef={scrollProgressRef} />
      ))}

      {activeStoryCycles.map((cycleIndex) => (
        <group key={`story-${cycleIndex}`}>
          <IntroMilestone z={-(cycleIndex * STORY_CYCLE_LENGTH + 15)} scrollProgressRef={scrollProgressRef} />
          <SystemsMilestone z={-(cycleIndex * STORY_CYCLE_LENGTH + 55)} scrollProgressRef={scrollProgressRef} />
          <PathMilestone z={-(cycleIndex * STORY_CYCLE_LENGTH + 95)} scrollProgressRef={scrollProgressRef} />
          <ToolsMilestone z={-(cycleIndex * STORY_CYCLE_LENGTH + 135)} scrollProgressRef={scrollProgressRef} />
        </group>
      ))}
    </group>
  );
};

const Milestone = ({ z, scrollProgressRef, children }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = scrollProgressRef?.current || 0;
    groupRef.current.visible = ROOM_Z + progress + z < CORRIDOR_CLIP_Z;
  });

  return <group ref={groupRef} position={[0, 0, z]}>{children}</group>;
};

const IntroMilestone = ({ z, scrollProgressRef }) => {
  const titleRef = useRef();
  const roleRef = useRef();
  const statementRef = useRef();

  useFrame((state) => {
    const progress = scrollProgressRef?.current || 0;
    const distance = z + progress - 55;
    const spread = THREE.MathUtils.smoothstep(distance, -70, -45);
    const time = state.clock.elapsedTime;

    if (titleRef.current) titleRef.current.position.x = -spread * 8;
    if (roleRef.current) roleRef.current.position.x = spread * 7;
    if (statementRef.current) {
      statementRef.current.position.y = 1.15 + Math.sin(time * 0.8) * 0.08 + spread * 1.5;
      statementRef.current.position.x = -spread * 2.5;
    }
  });

  return (
    <Milestone z={z} scrollProgressRef={scrollProgressRef}>
      <Text ref={titleRef} position={[0, 5, 0.1]} fontSize={1.15} color={INK} anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
        {aboutMilestones.intro.title}
      </Text>
      <Text ref={roleRef} position={[0, 4.02, 0.1]} fontSize={0.42} color={MUTED_INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
        {aboutMilestones.intro.label}
      </Text>
      <SignalOrbit position={[0, 2.25, 0]} size={1.35} phase={0} />
      <Text ref={statementRef} position={[0, 1.15, 0.1]} fontSize={0.32} color={TEAL} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
        {aboutMilestones.intro.statement}
      </Text>
    </Milestone>
  );
};

const SystemsMilestone = ({ z, scrollProgressRef }) => (
  <Milestone z={z} scrollProgressRef={scrollProgressRef}>
    <Text position={[0, 5.25, 0.1]} fontSize={0.94} color={INK} anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
      {aboutMilestones.systems.title}
    </Text>
    <Text position={[0, 4.35, 0.1]} fontSize={0.29} color={MUTED_INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
      {aboutMilestones.systems.label}
    </Text>
    <group position={[0, 1.85, 0]}>
      {aboutMilestones.systems.items.map((item, index) => (
        <SystemCard key={item.title} item={item} position={[(index - 1) * 3.55, 0, -index * 0.08]} phase={index * 0.8} />
      ))}
    </group>
  </Milestone>
);

const PathMilestone = ({ z, scrollProgressRef }) => (
  <Milestone z={z} scrollProgressRef={scrollProgressRef}>
    <Text position={[0, 5.25, 0.1]} fontSize={0.94} color={INK} anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
      {aboutMilestones.path.title}
    </Text>
    <Text position={[0, 4.35, 0.1]} fontSize={0.29} color={MUTED_INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
      {aboutMilestones.path.label}
    </Text>
    <group position={[0, 1.65, 0]}>
      {aboutMilestones.path.items.map((item, index) => (
        <PathMarker key={item.title} item={item} position={[(index - 1) * 3.8, index === 1 ? 0.55 : 0, -index * 0.1]} phase={index * 1.1} />
      ))}
    </group>
  </Milestone>
);

const ToolsMilestone = ({ z, scrollProgressRef }) => (
  <Milestone z={z} scrollProgressRef={scrollProgressRef}>
    <Text position={[0, 5.55, 0.1]} fontSize={0.94} color={INK} anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
      {aboutMilestones.tools.title}
    </Text>
    <Text position={[0, 4.65, 0.1]} fontSize={0.29} color={MUTED_INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
      {aboutMilestones.tools.label}
    </Text>
    <group position={[0, 2, 0]}>
      {aboutMilestones.tools.items.map((label, index) => (
        <SignalToken
          key={label}
          label={label}
          position={[
            Math.cos((index / aboutMilestones.tools.items.length) * Math.PI * 2) * 4.25,
            Math.sin((index / aboutMilestones.tools.items.length) * Math.PI * 2) * 1.5,
            -0.1
          ]}
          phase={index * 0.75}
        />
      ))}
    </group>
  </Milestone>
);

const SystemCard = ({ item, position, phase }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetScale = hovered ? 1.07 : 1;
    const scale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 8);
    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 + phase) * 0.08;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh>
        <planeGeometry args={[3.1, 1.75]} />
        <meshBasicMaterial color={hovered ? '#d8efea' : '#f5f0e4'} transparent opacity={0.94} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments position={[0, 0, 0.01]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(3.1, 1.75)]} />
        <lineBasicMaterial color="#4d7872" transparent opacity={0.65} />
      </lineSegments>
      <Text position={[0, 0.34, 0.03]} fontSize={0.28} color={INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
        {item.title}
      </Text>
      <Text position={[0, -0.17, 0.03]} fontSize={0.16} maxWidth={2.55} lineHeight={1.35} textAlign="center" color={MUTED_INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
        {item.text}
      </Text>
    </group>
  );
};

const PathMarker = ({ item, position, phase }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + phase) * 0.13;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 + phase) * 0.025;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <circleGeometry args={[1.05, 32]} />
        <meshBasicMaterial color="#edf5f2" transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.75, 0.79, 32]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.75} />
      </mesh>
      <Text position={[0, 0.11, 0.04]} fontSize={0.23} color={INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
        {item.title}
      </Text>
      <Text position={[0, -0.28, 0.04]} fontSize={0.12} maxWidth={1.45} lineHeight={1.3} textAlign="center" color={MUTED_INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
        {item.text}
      </Text>
    </group>
  );
};

const SignalToken = ({ label, position, phase }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(time * 0.85 + phase) * 0.16;
    groupRef.current.rotation.z = Math.sin(time * 0.45 + phase) * 0.05;
    const targetScale = hovered ? 1.13 : 1;
    const scale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 8);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        window.dispatchEvent(new CustomEvent('reader:open', { detail: 'selected' }));
      }}
      onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh>
        <circleGeometry args={[0.72, 24]} />
        <meshBasicMaterial color={hovered ? '#bfe8e1' : '#f7f2e6'} transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.52, 0.56, 24]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.85} />
      </mesh>
      <Text position={[0, 0, 0.03]} fontSize={0.15} maxWidth={1.05} textAlign="center" color={INK} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
        {label}
      </Text>
    </group>
  );
};

const SignalOrbit = ({ position, size, phase }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.16 + phase;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <ringGeometry args={[size * 0.75, size * 0.79, 48]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.82} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[size * 0.78, 0, 0.02]}>
        <circleGeometry args={[size * 0.16, 24]} />
        <meshBasicMaterial color="#9edbd2" transparent opacity={0.95} />
      </mesh>
      <mesh position={[-size * 0.58, size * 0.46, 0.03]}>
        <circleGeometry args={[size * 0.11, 24]} />
        <meshBasicMaterial color="#6da7cd" transparent opacity={0.92} />
      </mesh>
    </group>
  );
};

function sameValues(first, second) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

export default InfiniteSkyManager;
