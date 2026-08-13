import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DISPLAY_WIDTH = 128;
const DISPLAY_HEIGHT = 64;
const FRAME_WIDTH = 1.62;
const FRAME_HEIGHT = 0.94;
const SCREEN_WIDTH = 1.26;
const SCREEN_HEIGHT = 0.63;
const UPDATE_INTERVAL = 1 / 12;
const SCREEN_DARK = '#1e201d';
const SCREEN_MID = '#8d887d';
const SCREEN_LIGHT = '#f7f0e3';

const drawMaintenanceBot = (context, x, y, direction = 1, moving = false, toolRaised = false, blinking = false) => {
    const botX = Math.round(x);
    const botY = Math.round(y + (moving ? 1 : 0));

    context.fillStyle = SCREEN_LIGHT;
    // Original compact maintenance bot: low tracks, a camera pair and one waving tool arm.
    context.fillRect(botX - 14, botY + 7, 12, 7);
    context.fillRect(botX + 2, botY + 7, 12, 7);
    context.fillRect(botX - 10, botY + 1, 20, 8);
    context.fillRect(botX - 4, botY - 3, 8, 5);
    context.fillRect(botX - 13, botY - 13, 11, 10);
    context.fillRect(botX + 2, botY - 13, 11, 10);

    // A small articulated arm gives the greeting a recognisable silhouette.
    const shoulderX = direction > 0 ? botX + 10 : botX - 13;
    const elbowX = shoulderX + direction * 5;
    const handY = toolRaised ? botY - 13 : botY - 4;
    context.fillRect(shoulderX, botY + 1, 3, 5);
    context.fillRect(elbowX, toolRaised ? botY - 5 : botY, 4, 3);
    context.fillRect(elbowX + direction * 3, handY, 3, 7);
    context.fillRect(elbowX + direction * 2, handY - 2, 5, 2);

    context.fillStyle = SCREEN_DARK;
    // Tread grooves, chassis seam and a pair of recessed camera lenses.
    context.fillRect(botX - 12, botY + 10, 8, 2);
    context.fillRect(botX + 4, botY + 10, 8, 2);
    context.fillRect(botX - 7, botY + 3, 14, 2);
    context.fillRect(botX - 10, botY - 10, 5, blinking ? 1 : 5);
    context.fillRect(botX + 5, botY - 10, 5, blinking ? 1 : 5);

    context.fillStyle = SCREEN_LIGHT;
    if (!blinking) {
        context.fillRect(botX - 9, botY - 9, 1, 1);
        context.fillRect(botX + 8, botY - 9, 1, 1);
    }

    context.fillStyle = SCREEN_MID;
    context.fillRect(botX - 1, botY - 18, 2, 5);
    context.fillRect(botX, botY - 19, 1, 1);
    context.fillRect(botX - 1, botY + 5, 2, 2);
};

const drawSparkle = (context, x, y, bright = false) => {
    context.fillStyle = bright ? SCREEN_LIGHT : SCREEN_MID;
    context.fillRect(x, y - 2, 2, 6);
    context.fillRect(x - 2, y, 6, 2);
    context.fillRect(x - 1, y - 1, 4, 4);
};

const drawDisplay = (context, {
    mode,
    modeElapsed,
    time,
    reducedMotion,
}) => {
    context.fillStyle = SCREEN_DARK;
    context.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    context.imageSmoothingEnabled = false;

    context.fillStyle = SCREEN_MID;
    context.fillRect(5, 6, 20, 1);
    context.fillRect(5, 8, 13, 1);
    context.fillRect(108, 6, 15, 1);
    context.font = '7px monospace';
    context.textBaseline = 'top';
    context.fillText('WELCOME', 5, 12);

    const idleBob = reducedMotion ? 0 : Math.round(Math.sin(time * 2.5) * 0.5);
    const walkBob = reducedMotion ? false : Math.floor(time * 12) % 2 === 0;
    const blinking = !reducedMotion && Math.floor(time * 1.6) % 6 === 0;

    if (mode === 'idle') {
        drawMaintenanceBot(context, 55, 42 + idleBob, 1, false, true, blinking);
        context.fillStyle = SCREEN_MID;
        context.fillRect(47, 55, 18, 1);
        drawSparkle(context, 81, 30, false);
        return;
    }

    if (mode === 'wake') {
        const wakeDots = Math.min(4, Math.floor(modeElapsed * 8));
        Array.from({ length: wakeDots }, (_, index) => drawSparkle(context, 44 + index * 13, 49, true));
        drawMaintenanceBot(context, 55, 42, 1, false, true, false);
        return;
    }

    const greetingProgress = mode === 'settle'
        ? 1
        : Math.min(1, Math.max(0, (modeElapsed - 0.35) / 2.8));
    const robotX = 39 + greetingProgress * 18;
    drawMaintenanceBot(context, robotX, 42, 1, walkBob, true, blinking);
    drawSparkle(context, 84, 31, true);
    drawSparkle(context, 99, 43, mode === 'settle');

    if (mode === 'settle') {
        context.fillStyle = SCREEN_LIGHT;
        context.fillRect(88, 51, 18, 1);
        context.fillRect(92, 54, 10, 1);
    }
};

const OledGuide = ({ position = [10, -20, 30] }) => {
    const groupRef = useRef();
    const screenMaterialRef = useRef();
    const statusLightRef = useRef();
    const lastUpdate = useRef(-Infinity);
    const reducedMotion = useRef(false);

    const { texture, context } = useMemo(() => {
        const nextCanvas = document.createElement('canvas');
        nextCanvas.width = DISPLAY_WIDTH;
        nextCanvas.height = DISPLAY_HEIGHT;
        const nextContext = nextCanvas.getContext('2d');
        const nextTexture = new THREE.CanvasTexture(nextCanvas);
        nextTexture.colorSpace = THREE.SRGBColorSpace;
        nextTexture.magFilter = THREE.NearestFilter;
        nextTexture.minFilter = THREE.NearestFilter;
        nextTexture.generateMipmaps = false;

        return { canvas: nextCanvas, texture: nextTexture, context: nextContext };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const syncReducedMotion = () => {
            reducedMotion.current = mediaQuery.matches;
        };

        syncReducedMotion();
        mediaQuery.addEventListener('change', syncReducedMotion);

        return () => {
            mediaQuery.removeEventListener('change', syncReducedMotion);
            texture.dispose();
        };
    }, [texture]);

    useFrame((state) => {
        if (!groupRef.current || !context) return;

        const time = state.clock.getElapsedTime();
        // This is an ambient welcome loop, not a reward for stopping at a precise spot.
        const cycle = time % 6.4;
        let mode = 'settle';
        let modeElapsed = cycle;

        if (cycle < 0.6) mode = 'wake';
        else if (cycle < 4.5) mode = 'greet';

        if (reducedMotion.current) {
            mode = 'greet';
            modeElapsed = 3.2;
        }

        if (screenMaterialRef.current) {
            screenMaterialRef.current.opacity = 1;
        }
        if (statusLightRef.current) {
            statusLightRef.current.material.opacity = reducedMotion.current
                ? 0.7
                : 0.48 + Math.sin(time * 3) * 0.22;
        }

        const interval = reducedMotion.current ? 0.45 : UPDATE_INTERVAL;
        if (time - lastUpdate.current < interval) return;
        lastUpdate.current = time;

        drawDisplay(context, {
            mode,
            modeElapsed,
            time,
            reducedMotion: reducedMotion.current,
        });
        texture.needsUpdate = true;
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh position={[0, -0.02, 0]} renderOrder={1}>
                <boxGeometry args={[FRAME_WIDTH, FRAME_HEIGHT, 0.09]} />
                <meshStandardMaterial color="#242521" roughness={0.78} metalness={0.16} />
            </mesh>
            <mesh position={[0, -0.02, 0.051]} renderOrder={2}>
                <planeGeometry args={[1.48, 0.78]} />
                <meshBasicMaterial color="#cfc9bd" side={THREE.DoubleSide} />
            </mesh>
            <mesh
                position={[0, -0.02, 0.058]}
                renderOrder={3}
            >
                <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
                <meshBasicMaterial
                    ref={screenMaterialRef}
                    map={texture}
                    transparent
                    opacity={0.74}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {[
                [-0.66, 0.28],
                [0.66, 0.28],
                [-0.66, -0.32],
                [0.66, -0.32],
            ].map(([x, y]) => (
                <mesh key={`${x}-${y}`} position={[x, y - 0.02, 0.063]} renderOrder={4}>
                    <circleGeometry args={[0.027, 12]} />
                    <meshBasicMaterial color="#e8e1d5" side={THREE.DoubleSide} />
                </mesh>
            ))}

            <mesh ref={statusLightRef} position={[0.66, 0.35, 0.064]} renderOrder={4}>
                <circleGeometry args={[0.018, 12]} />
                <meshBasicMaterial color="#f7f0e3" transparent opacity={0.28} side={THREE.DoubleSide} />
            </mesh>

            {/* A shallow controller board and header pins make the screen read as a physical module. */}
            <mesh position={[0, -0.55, 0.014]}>
                <boxGeometry args={[1.16, 0.12, 0.11]} />
                <meshStandardMaterial color="#4b4a43" roughness={0.82} metalness={0.08} />
            </mesh>
            <mesh position={[-0.37, -0.55, 0.075]}>
                <boxGeometry args={[0.22, 0.066, 0.025]} />
                <meshBasicMaterial color="#181915" />
            </mesh>
            <mesh position={[0.29, -0.55, 0.077]}>
                <boxGeometry args={[0.18, 0.045, 0.024]} />
                <meshBasicMaterial color="#8d887d" />
            </mesh>
            {[-0.46, 0.46].map((x) => (
                <mesh key={x} position={[x, -0.68, -0.01]} rotation={[0, 0, x < 0 ? 0.06 : -0.06]}>
                    <boxGeometry args={[0.075, 0.22, 0.1]} />
                    <meshStandardMaterial color="#292a27" roughness={0.9} />
                </mesh>
            ))}
            {Array.from({ length: 6 }, (_, index) => (
                <mesh key={index} position={[-0.22 + index * 0.09, -0.61, 0.078]}>
                    <boxGeometry args={[0.018, 0.09, 0.025]} />
                    <meshStandardMaterial color="#c9c4b8" roughness={0.75} />
                </mesh>
            ))}
            {[-0.55, 0.55].map((x) => (
                <mesh key={`mount-${x}`} position={[x, -0.55, 0.078]}>
                    <circleGeometry args={[0.02, 10]} />
                    <meshBasicMaterial color="#242521" side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
};

export default OledGuide;
