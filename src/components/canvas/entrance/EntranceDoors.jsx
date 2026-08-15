import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useAchievements } from '../../../context/AchievementsContext';
import { isTouchDevice } from '../../../utils/deviceDetect';



/**
 * EntranceDoors Component - 3D Entrance to the Corridor
 * 
 * Doors that open and camera flies through.
 * EmptyCorridor provides the surrounding corridor context.
 */
const EntranceDoors = ({
    position = [0, 0, 22],
    onComplete,
    corridorHeight = 8, // Taller wall
    corridorWidth = 15 // Wider wall
}) => {
    const leftDoorRef = useRef();
    const rightDoorRef = useRef();
    const leftHandleRef = useRef();
    const rightHandleRef = useRef();
    const groupRef = useRef();
    const openingStartedRef = useRef(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { camera } = useThree();
    const { unlockAchievement } = useAchievements();

    const [isMobile] = useState(() => isTouchDevice() || window.innerWidth < 1000);

    const doorLeftTexture = useTexture('/textures/tao/doors/door_left_robotics-v1.jpg');
    const doorRightTexture = useTexture('/textures/tao/doors/door_right_embedded-v1.jpg');
    // Door dimensions keep the existing entrance proportions.
    const doorWidth = 0.94;
    const doorHeight = 2.4;
    const doorOpeningWidth = doorWidth * 2; // Both doors together
    const wallThickness = 0.07;

    const frameWidth = doorOpeningWidth + 0.16;
    const frameHeight = doorHeight + 0.12;

    // Floor Y must remain at standard level (-1.75) regardless of wall height
    const floorY = -1.75;
    const doorBottomY = floorY;
    const doorCenterY = doorBottomY + doorHeight / 2;
    const wallCenterY = floorY + corridorHeight / 2;
    const topWallHeight = corridorHeight - doorHeight;
    const topWallCenterY = doorBottomY + doorHeight + topWallHeight / 2;
    const sideWallWidth = (corridorWidth - doorOpeningWidth) / 2;
    // Handle click
    const handleClick = (e) => {
        e.stopPropagation();
        if (isOpen || isAnimating || openingStartedRef.current) return;

        // Pointer-leave can fire as the mesh starts to move. Lock it
        // synchronously so it cannot schedule a competing reset tween.
        openingStartedRef.current = true;

        // Reset cursor immediately on transition start
        document.body.style.cursor = "auto";

        setIsOpen(true);
        setIsAnimating(true);
        unlockAchievement('corridor_enter');

        const tl = gsap.timeline({
            onComplete: () => {
                onComplete?.();
            }
        });

        // Complete one restrained handle press before the leaves start moving.
        if (leftHandleRef.current) {
            tl.to(leftHandleRef.current.rotation, {
                z: 0.28,
                duration: 0.2,
                ease: 'power1.inOut',
                overwrite: true
            }, 0);
        }
        if (rightHandleRef.current) {
            tl.to(rightHandleRef.current.rotation, {
                z: -0.28,
                duration: 0.2,
                ease: 'power1.inOut',
                overwrite: true
            }, 0);
        }

        // Open doors - smoother angle (matches SegmentDoors)
        tl.to(leftDoorRef.current.rotation, {
            y: -Math.PI * 0.55,
            duration: 0.9,
            ease: 'power2.out',
            overwrite: true
        }, 0.18);

        tl.to(rightDoorRef.current.rotation, {
            y: Math.PI * 0.55,
            duration: 0.9,
            ease: 'power2.out',
            overwrite: true
        }, 0.18);

        // Camera flies through and stops near the corridor welcome mark.
        tl.to(camera.position, {
            z: 11,  // Closer stop point (was 11)
            y: 0.2, // Match hook's base Y position
            duration: 1.8,
            ease: 'power2.inOut'
        }, 0.3);
    };

    // Handle hover - doors slightly open to indicate interactivity
    const handlePointerEnter = () => {
        if (isOpen || isAnimating || openingStartedRef.current || isMobile) return;
        document.body.style.cursor = "pointer";

        // Slightly open doors on hover
        gsap.to(leftDoorRef.current.rotation, {
            y: -0.08,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });
        gsap.to(rightDoorRef.current.rotation, {
            y: 0.08,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });

        // Rotate handles down slightly (hint effect)
        if (leftHandleRef.current) {
            gsap.to(leftHandleRef.current.rotation, {
                z: 0.1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleRef.current) {
            gsap.to(rightHandleRef.current.rotation, {
                z: -0.1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }

    };

    const handlePointerLeave = () => {
        if (isOpen || isAnimating || openingStartedRef.current || isMobile) return;
        document.body.style.cursor = "auto";

        // Close doors back
        gsap.to(leftDoorRef.current.rotation, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });
        gsap.to(rightDoorRef.current.rotation, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });

        // Reset handles
        if (leftHandleRef.current) {
            gsap.to(leftHandleRef.current.rotation, {
                z: 0,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleRef.current) {
            gsap.to(rightHandleRef.current.rotation, {
                z: 0,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }

    };

    // Frame center Y - aligned with doors
    const frameCenterY = doorBottomY + frameHeight / 2;

    const pathWidth = frameWidth + 0.4;
    const pathLength = 5.62;

    return (
        <group ref={groupRef} position={[position[0], 0, position[2]]}>

            {/* Neutral approach floor. */}
            <mesh
                position={[0, floorY + 0.02, pathLength / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <planeGeometry args={[pathWidth, pathLength]} />
                <meshBasicMaterial color="#b9b8b2" roughness={1} />
            </mesh>


            {/* LEFT WALL PANEL */}
            <mesh position={[-(doorOpeningWidth / 2 + sideWallWidth / 2), wallCenterY, 0]}>
                <boxGeometry args={[sideWallWidth, corridorHeight, wallThickness]} />
                <meshBasicMaterial color="#d7d6d1" roughness={0.95} />
            </mesh>

            {/* RIGHT WALL PANEL */}
            <mesh position={[(doorOpeningWidth / 2 + sideWallWidth / 2), wallCenterY, 0]}>
                <boxGeometry args={[sideWallWidth, corridorHeight, wallThickness]} />
                <meshBasicMaterial color="#d7d6d1" roughness={0.95} />
            </mesh>

            {/* TOP WALL PANEL */}
            <mesh position={[0, topWallCenterY, 0]}>
                <boxGeometry args={[doorOpeningWidth, topWallHeight, wallThickness]} />
                <meshBasicMaterial color="#d7d6d1" roughness={0.95} />
            </mesh>

            {/* Minimal geometric door frame. */}
            <mesh position={[-doorOpeningWidth / 2 - 0.06, frameCenterY, 0.08]}>
                <boxGeometry args={[0.12, frameHeight, 0.12]} />
                <meshBasicMaterial color="#30343b" />
            </mesh>
            <mesh position={[doorOpeningWidth / 2 + 0.06, frameCenterY, 0.08]}>
                <boxGeometry args={[0.12, frameHeight, 0.12]} />
                <meshBasicMaterial color="#30343b" />
            </mesh>
            <mesh position={[0, doorBottomY + frameHeight - 0.06, 0.08]}>
                <boxGeometry args={[frameWidth, 0.12, 0.12]} />
                <meshBasicMaterial color="#30343b" />
            </mesh>

            {/* LEFT DOOR */}
            <group
                ref={leftDoorRef}
                position={[-doorWidth, doorCenterY, 0]}
                onClick={handleClick}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
            >
                <mesh
                    position={[doorWidth / 2, 0, 0.06]}
                >
                    <boxGeometry args={[doorWidth, doorHeight, 0.08]} />
                    <meshBasicMaterial color="#30343b" roughness={0.9} />
                </mesh>

                {/* Tao-owned door artwork. */}
                <mesh position={[doorWidth / 2, 0, 0.101]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <meshBasicMaterial color="#ffffff"
                        map={doorLeftTexture}
                        roughness={0.8}
                    />
                </mesh>

                {/* Low-profile pull: fixed escutcheon plus a movable horizontal grip. */}
                <group position={[doorWidth / 2 + 0.357, -0.099, 0.112]}>
                    <mesh>
                        <boxGeometry args={[0.095, 0.255, 0.018]} />
                        <meshBasicMaterial color="#8e6634" />
                    </mesh>
                    <mesh position={[0, 0, 0.012]}>
                        <boxGeometry args={[0.058, 0.205, 0.012]} />
                        <meshBasicMaterial color="#4a301b" />
                    </mesh>
                </group>
                <group ref={leftHandleRef} position={[doorWidth / 2 + 0.357, -0.099, 0.145]}>
                    <mesh position={[-0.09, 0, 0]}>
                        <boxGeometry args={[0.18, 0.034, 0.052]} />
                        <meshBasicMaterial color="#c0924d" />
                    </mesh>
                    <mesh position={[-0.09, 0, 0.03]}>
                        <boxGeometry args={[0.13, 0.014, 0.01]} />
                        <meshBasicMaterial color="#5a3920" />
                    </mesh>
                </group>
            </group>

            {/* RIGHT DOOR */}
            <group
                ref={rightDoorRef}
                position={[doorWidth, doorCenterY, 0]}
                onClick={handleClick}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
            >
                <mesh
                    position={[-doorWidth / 2, 0, 0.06]}
                >
                    <boxGeometry args={[doorWidth, doorHeight, 0.08]} />
                    <meshBasicMaterial color="#30343b" roughness={0.9} />
                </mesh>

                {/* Tao-owned door artwork. */}
                <mesh position={[-doorWidth / 2, 0, 0.101]}>
                    <planeGeometry args={[doorWidth, doorHeight]} />
                    <meshBasicMaterial color="#ffffff"
                        map={doorRightTexture}
                        roughness={0.8}
                    />
                </mesh>

                {/* Low-profile pull: fixed escutcheon plus a movable horizontal grip. */}
                <group position={[-doorWidth / 2 - 0.357, -0.099, 0.112]}>
                    <mesh>
                        <boxGeometry args={[0.095, 0.255, 0.018]} />
                        <meshBasicMaterial color="#8e6634" />
                    </mesh>
                    <mesh position={[0, 0, 0.012]}>
                        <boxGeometry args={[0.058, 0.205, 0.012]} />
                        <meshBasicMaterial color="#4a301b" />
                    </mesh>
                </group>
                <group ref={rightHandleRef} position={[-doorWidth / 2 - 0.357, -0.099, 0.145]}>
                    <mesh position={[0.09, 0, 0]}>
                        <boxGeometry args={[0.18, 0.034, 0.052]} />
                        <meshBasicMaterial color="#c0924d" />
                    </mesh>
                    <mesh position={[0.09, 0, 0.03]}>
                        <boxGeometry args={[0.13, 0.014, 0.01]} />
                        <meshBasicMaterial color="#5a3920" />
                    </mesh>
                </group>
            </group>

            {/* Warm lighting - WYLACZONE */}
            {/* <pointLight
                position={[0, doorBottomY + doorHeight + 1, 1]}
                intensity={0.8}
                color="#fff8e8"
                distance={10}
            /> */}
            {/* Abstract sensor signal replaces the source portrait in the window. */}
            <group position={[3.5, 0, 0.04]}>
                <mesh>
                    <ringGeometry args={[0.34, 0.37, 24]} />
                    <meshBasicMaterial color="#65d8c3" transparent opacity={0.9} side={THREE.DoubleSide} />
                </mesh>
                {[0, 1, 2].map((index) => (
                    <mesh key={index} rotation={[0, 0, (index * Math.PI) / 3]}>
                        <planeGeometry args={[0.78, 0.025]} />
                        <meshBasicMaterial color="#e9fbf6" side={THREE.DoubleSide} />
                    </mesh>
                ))}
                <Text
                    position={[0, -0.54, 0.02]}
                    font="/fonts/CabinSketch-Bold.ttf"
                    fontSize={0.12}
                    color="#e9fbf6"
                    anchorX="center"
                    anchorY="middle"
                >
                    SIGNAL ONLINE
                </Text>
            </group>

        </group>
    );
};

export default EntranceDoors;
