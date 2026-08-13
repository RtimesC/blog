import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// A code-native signal buoy. It retains the original floating social-object
// interaction but does not use the source project's barrel artwork.
const SocialBarrel = ({ position, rotation = [0, 0, 0], label, onClick, paintOnBeforeCompile }) => {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);
    const shellMaterial = useMemo(() => {
        const material = new THREE.MeshStandardMaterial({ color: '#183d39', roughness: 0.52, metalness: 0.28 });
        material.onBeforeCompile = paintOnBeforeCompile;
        material.customProgramCacheKey = () => 'tao-contact-buoy-shell';
        material.transparent = true;
        material.needsUpdate = true;
        return material;
    }, [paintOnBeforeCompile]);
    const signalMaterial = useMemo(() => {
        const material = new THREE.MeshBasicMaterial({ color: '#3fd3bf' });
        material.onBeforeCompile = paintOnBeforeCompile;
        material.customProgramCacheKey = () => 'tao-contact-buoy-signal';
        material.transparent = true;
        material.needsUpdate = true;
        return material;
    }, [paintOnBeforeCompile]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();
        const phase = position[0] * 0.5;
        groupRef.current.position.y = position[1] + Math.sin(time * 0.8 + phase) * 0.16;
        groupRef.current.position.x = position[0] + Math.sin(time * 0.4 + phase) * 0.2;
        groupRef.current.rotation.z = rotation[2] + Math.sin(time * 0.6 + phase) * 0.05;
        const scale = hovered ? 1.08 : 1;
        groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), Math.min(delta * 8, 1));
    });

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation}
            onClick={(event) => {
                event.stopPropagation();
                onClick?.();
            }}
            onPointerOver={() => {
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
            }}
        >
            <mesh material={shellMaterial}>
                <cylinderGeometry args={[0.68, 0.8, 1.25, 16]} />
            </mesh>
            <mesh position={[0, 0.47, 0]} material={signalMaterial}>
                <cylinderGeometry args={[0.46, 0.46, 0.08, 16]} />
            </mesh>
            <mesh position={[0, 0.67, 0]} material={signalMaterial}>
                <sphereGeometry args={[0.12, 12, 12]} />
            </mesh>
            <Text
                position={[0, 0.05, 0.82]}
                fontSize={0.16}
                maxWidth={1.5}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                color="#effbf7"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                {label}
            </Text>
        </group>
    );
};

export default SocialBarrel;
