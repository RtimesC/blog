import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// A code-native entrance sign retains the suspended, wind-driven motion while
// replacing the source project's branded sign artwork.
const SignSystem = (props) => {
    const signRef = useRef();
    const timeOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        if (!signRef.current) return;
        signRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2 + timeOffset) * 0.05;
        signRef.current.rotation.y = 0;
    });

    return (
        <group {...props}>
            <mesh position={[-0.05, 2.05, 0.65]}>
                <boxGeometry args={[2.7, 0.16, 0.08]} />
                <meshStandardMaterial color="#294d47" roughness={0.78} />
            </mesh>
            <group ref={signRef} position={[0, 1.9, 0.6]}>
                {[-0.68, 0.68].map((x) => (
                    <mesh key={x} position={[x, -0.23, 0]} rotation={[0, 0, x < 0 ? -0.08 : 0.08]}>
                        <boxGeometry args={[0.025, 0.48, 0.025]} />
                        <meshStandardMaterial color="#294d47" roughness={0.75} />
                    </mesh>
                ))}
                <mesh position={[0, -0.55, 0]}>
                    <boxGeometry args={[2.05, 0.9, 0.07]} />
                    <meshStandardMaterial color="#effbf7" roughness={0.9} />
                </mesh>
                <mesh position={[0, -0.55, 0.041]}>
                    <planeGeometry args={[1.8, 0.62]} />
                    <meshBasicMaterial color="#d9f2ec" side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, -0.56, 0.05]}
                    fontSize={0.2}
                    letterSpacing={0.025}
                    anchorX="center"
                    anchorY="middle"
                    color="#163d37"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    Hi,this is Tao!
                </Text>
            </group>
        </group>
    );
};

export default SignSystem;
