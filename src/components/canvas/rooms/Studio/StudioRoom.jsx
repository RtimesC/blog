import { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { CONTENT_DATA, PLATFORM_CONFIG } from './contentData';
import { useScene } from '../../../../context/SceneContext';
import { useAchievements } from '../../../../context/AchievementsContext';
import { useAudio } from '../../../../context/AudioManager';
import FloatingCodeParticles from './FloatingCodeParticles';
import { usePaintMaterial } from '../Gallery/usePaintMaterial';
import { SILENT_AUDIO } from '../../../../config/assetPolicy';

// Keep the original monitor-tower choreography, while using locally generated
// terminal surfaces instead of the source project's social-media artwork.
const STUDIO_PAINT_CONFIG = {
    dirX: 0.0,
    dirY: -1.0,
    dirZ: 0.0,
    startDist: -10.0,
    endDist: 10.0,
    noiseAxes: 'xz'
};

const CAMERA_Y_OFFSET = -6;
const CAMERA_ZOOM_DISTANCE = 3;
const CAMERA_PAN_RIGHT = 1;
const TOWER_RADIUS = 2.2;
const MONITORS_PER_RING = 4;
const FALL_SPEED = 0.3;
const TOWER_HEIGHT = 12;
const VERTICAL_SPACING = 2.5;
const TOWER_Y_START = -5;
const TOWER_Z_START = -10;
const AUDIO_SETTINGS = { volume: 1, distance: 2, rolloff: 1 };

const StudioRoom = ({ showRoom, onReady, isExiting, isWarmup }) => {
    const groupRef = useRef();
    const towerRef = useRef();
    const { camera, size } = useThree();
    const { openOverlay, overlayContent, isTeleporting } = useScene();
    const { showTutorial, unlockAchievement, hidePopup } = useAchievements();
    const { globalVolume, isMuted } = useAudio();
    const effectiveVolume = isMuted ? 0 : AUDIO_SETTINGS.volume * globalVolume;
    const audioRef = useRef();

    const responsiveParams = useMemo(() => {
        const isMobile = size.width < 768;
        const isTablet = size.width < 1024 && !isMobile;

        return {
            zoomDistance: isMobile ? 2 : isTablet ? 3 : CAMERA_ZOOM_DISTANCE,
            panRight: isMobile ? 0 : isTablet ? 0.5 : Math.max(0.3, (size.width / 1920) * CAMERA_PAN_RIGHT),
            panDown: isMobile ? 9.7 : 0,
            yOffset: isMobile ? 2.5 : isTablet ? -3 : CAMERA_Y_OFFSET,
            towerRadius: isMobile ? 1.5 : (isTablet ? 1.8 : TOWER_RADIUS),
        };
    }, [size.width]);

    const originalCamera = useRef({ x: null, y: null, z: null });
    const isDraggingRef = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });
    const dragDistance = useRef(0);
    const rotationVelocity = useRef(0);
    const autoRotationSpeed = useRef(0.12);
    const fallSpeed = useRef(FALL_SPEED);
    const monitorOffsets = useRef([]);
    const monitorRefs = useRef([]);
    const particleTowerRotation = useRef(0);
    const particleFallOffset = useRef(0);
    const [selectedMonitor, setSelectedMonitor] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const { onBeforeCompile: paintOnBeforeCompile, animatePaint, resetPaint, uniformsData: paintUniforms, updateRoomOrigin } = usePaintMaterial(STUDIO_PAINT_CONFIG);
    const wasTeleportedRef = useRef(false);

    useEffect(() => {
        if (isExiting || isTeleporting) hidePopup();
    }, [isExiting, isTeleporting, hidePopup]);

    useEffect(() => {
        audioRef.current?.setVolume?.(effectiveVolume);
    }, [effectiveVolume]);

    useEffect(() => {
        if (isTeleporting) wasTeleportedRef.current = true;
    }, [isTeleporting]);

    useEffect(() => {
        if (showRoom && !isWarmup) {
            if (wasTeleportedRef.current || isTeleporting) {
                paintUniforms.uPaintProgress.value = 1;
            } else {
                resetPaint();
                animatePaint(0.2, 2.5);
            }
        } else {
            paintUniforms.uPaintProgress.value = 1;
        }
    }, [showRoom, isWarmup, isTeleporting, paintUniforms, resetPaint, animatePaint]);

    const latestContent = CONTENT_DATA[0];
    const monitorData = useMemo(() => {
        const items = [];
        let content = [...CONTENT_DATA];

        while (content.length < 48) content = [...content, ...CONTENT_DATA];

        const ringsNeeded = Math.ceil(content.length / MONITORS_PER_RING);
        const radius = responsiveParams.towerRadius;
        let contentIndex = 0;

        for (let ring = 0; ring < ringsNeeded && contentIndex < content.length; ring += 1) {
            const angleStep = (Math.PI * 2) / MONITORS_PER_RING;
            const angleOffset = ring % 2 === 0 ? 0 : angleStep / 2;

            for (let index = 0; index < MONITORS_PER_RING && contentIndex < content.length; index += 1) {
                const contentItem = content[contentIndex];
                const angle = index * angleStep + angleOffset;
                const platformConfig = PLATFORM_CONFIG[contentItem.platform] || PLATFORM_CONFIG.fieldnote;
                const yJitter = (Math.sin(contentIndex * 1.7) + Math.cos(contentIndex * 2.3)) * 0.4;

                items.push({
                    ...contentItem,
                    index: contentIndex,
                    x: Math.cos(angle) * radius,
                    z: Math.sin(angle) * radius,
                    baseY: ring * VERTICAL_SPACING + yJitter,
                    width: 1.6,
                    height: 1,
                    depth: 0.15,
                    rot: -angle + Math.PI / 2,
                    platformConfig,
                    isLatest: contentItem.id === latestContent?.id,
                });
                contentIndex += 1;
            }
        }

        monitorOffsets.current = items.map(() => 0);
        const positions = items.map((item) => item.baseY);
        const totalHeight = Math.max(VERTICAL_SPACING * 3, Math.max(...positions) - Math.min(...positions) + VERTICAL_SPACING);
        return { items, totalHeight };
    }, [responsiveParams.towerRadius, latestContent?.id]);

    const { items: monitors, totalHeight } = monitorData;
    const frameCount = useRef(0);
    const readySent = useRef(false);

    useFrame(() => {
        updateRoomOrigin(groupRef);
        if (readySent.current) return;
        frameCount.current += 1;
        if (frameCount.current >= 5) {
            readySent.current = true;
            onReady?.();
            if (!isWarmup) setTimeout(() => showTutorial('studio_interact'), 2000);
        }
    });

    const handlePointerDown = useCallback((event) => {
        if (isAnimating) return;
        event.stopPropagation();
        isDraggingRef.current = true;
        lastPointer.current = { x: event.clientX, y: event.clientY };
        dragDistance.current = 0;
        rotationVelocity.current = 0;
        document.body.style.cursor = 'grabbing';
    }, [isAnimating]);

    const handlePointerUp = useCallback(() => {
        isDraggingRef.current = false;
        document.body.style.cursor = 'auto';
    }, []);

    const handlePointerMove = useCallback((event) => {
        if (!isDraggingRef.current || !towerRef.current || isAnimating) return;

        const pointer = event.touches?.[0] || event;
        if (pointer.clientX == null || pointer.clientY == null) return;
        const deltaX = pointer.clientX - lastPointer.current.x;
        const deltaY = pointer.clientY - lastPointer.current.y;
        lastPointer.current = { x: pointer.clientX, y: pointer.clientY };
        dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY);

        if (Math.abs(deltaX) > 1) autoRotationSpeed.current = Math.sign(deltaX) * 0.12;
        rotationVelocity.current = deltaX * 0.008;
        towerRef.current.rotation.y += rotationVelocity.current;
        fallSpeed.current += deltaY * 0.005;
        unlockAchievement('studio_interact');
    }, [isAnimating, unlockAchievement]);

    useEffect(() => {
        const onWheel = (event) => {
            fallSpeed.current += event.deltaY * 0.006;
            unlockAchievement('studio_interact');
        };
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('touchend', handlePointerUp);
        window.addEventListener('touchmove', handlePointerMove, { passive: true });

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
        };
    }, [handlePointerUp, handlePointerMove, unlockAchievement]);

    const handleReturnCamera = useCallback(() => {
        const saved = originalCamera.current;
        if (saved.x === null || saved.y === null || saved.z === null) {
            setSelectedMonitor(null);
            return;
        }

        setIsAnimating(true);
        gsap.to(camera.position, {
            ...saved,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                setIsAnimating(false);
                setSelectedMonitor(null);
            }
        });
    }, [camera]);

    const handleMonitorClick = useCallback((item) => {
        if (dragDistance.current > 5 || isAnimating || !towerRef.current) return;
        setIsAnimating(true);
        setSelectedMonitor(item);
        rotationVelocity.current = 0;
        unlockAchievement('studio_interact');

        const currentRotation = towerRef.current.rotation.y;
        const targetRotation = -item.rot;
        let delta = (targetRotation - currentRotation) % (Math.PI * 2);
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        gsap.to(towerRef.current.rotation, {
            y: currentRotation + delta,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                if (originalCamera.current.y === null) {
                    originalCamera.current = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
                }

                const forward = new THREE.Vector3();
                camera.getWorldDirection(forward);
                const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
                const monitorY = -1.2 + item.baseY + (monitorOffsets.current[item.index] || 0) + responsiveParams.yOffset;

                gsap.to(camera.position, {
                    x: camera.position.x + forward.x * responsiveParams.zoomDistance + right.x * responsiveParams.panRight,
                    y: monitorY - responsiveParams.panDown,
                    z: camera.position.z + forward.z * responsiveParams.zoomDistance + right.z * responsiveParams.panRight,
                    duration: 0.5,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        setIsAnimating(false);
                        openOverlay(item);
                    }
                });
            }
        });
    }, [camera, isAnimating, openOverlay, responsiveParams, unlockAchievement]);

    const previousOverlay = useRef(null);
    useEffect(() => {
        if (previousOverlay.current && !overlayContent && selectedMonitor && !isAnimating) handleReturnCamera();
        previousOverlay.current = overlayContent;
    }, [overlayContent, selectedMonitor, isAnimating, handleReturnCamera]);

    useFrame((_, delta) => {
        if (!towerRef.current || isDraggingRef.current || isAnimating || selectedMonitor) return;

        towerRef.current.rotation.y += autoRotationSpeed.current * delta + rotationVelocity.current;
        rotationVelocity.current *= 0.98;
        const targetDrift = fallSpeed.current > 0 ? FALL_SPEED : -FALL_SPEED;
        fallSpeed.current = THREE.MathUtils.lerp(fallSpeed.current, targetDrift, 0.015);

        monitors.forEach((monitor, index) => {
            monitorOffsets.current[index] -= fallSpeed.current * delta;
            let currentY = monitor.baseY + monitorOffsets.current[index];
            if (currentY < -10 && fallSpeed.current > 0) {
                monitorOffsets.current[index] += totalHeight;
                currentY += totalHeight;
            } else if (currentY > totalHeight - 10 && fallSpeed.current < 0) {
                monitorOffsets.current[index] -= totalHeight;
                currentY -= totalHeight;
            }
            if (monitorRefs.current[index]) monitorRefs.current[index].position.y = currentY;
        });

        particleTowerRotation.current = towerRef.current.rotation.y;
        particleFallOffset.current = fallSpeed.current;
    });

    return (
        <group ref={groupRef} position={[0, -1.2, 0]}>
            {!isWarmup && (
                <PositionalAudio
                    ref={audioRef}
                    url={SILENT_AUDIO}
                    distanceModel="exponential"
                    refDistance={AUDIO_SETTINGS.distance}
                    rolloffFactor={AUDIO_SETTINGS.rolloff}
                    loop
                    autoplay
                    volume={effectiveVolume}
                />
            )}
            <group ref={towerRef} position={[0, TOWER_Y_START, TOWER_Z_START]} onPointerDown={handlePointerDown}>
                <mesh visible={false}>
                    <cylinderGeometry args={[responsiveParams.towerRadius + 0.5, responsiveParams.towerRadius + 0.5, TOWER_HEIGHT * 1.5, 16]} />
                    <meshBasicMaterial />
                </mesh>

                {monitors.map((item, index) => (
                    <MonitorBlock
                        key={`${item.id}-${index}`}
                        item={item}
                        meshRef={(element) => { monitorRefs.current[index] = element; }}
                        isSelected={selectedMonitor?.index === item.index}
                        onMonitorClick={handleMonitorClick}
                        disabled={isAnimating}
                        paintOnBeforeCompile={paintOnBeforeCompile}
                    />
                ))}
            </group>

            <FloatingCodeParticles towerRotationRef={particleTowerRotation} fallOffsetRef={particleFallOffset} />
        </group>
    );
};

const applyPaint = (material, paintOnBeforeCompile, cacheKey) => {
    material.onBeforeCompile = paintOnBeforeCompile;
    material.customProgramCacheKey = () => cacheKey;
    material.transparent = true;
    material.needsUpdate = true;
    return material;
};

const MonitorBlock = memo(({ item, meshRef, isSelected, onMonitorClick, disabled, paintOnBeforeCompile }) => {
    const screenMaterial = useMemo(() => applyPaint(
        new THREE.MeshStandardMaterial({ color: '#f4faf7', emissive: '#0b8073', emissiveIntensity: 0.12, roughness: 0.74 }),
        paintOnBeforeCompile,
        'tao-studio-screen'
    ), [paintOnBeforeCompile]);
    const shellMaterial = useMemo(() => applyPaint(
        new THREE.MeshStandardMaterial({ color: '#263735', roughness: 0.7, metalness: 0.08 }),
        paintOnBeforeCompile,
        'tao-studio-shell'
    ), [paintOnBeforeCompile]);
    const accentMaterial = useMemo(() => applyPaint(
        new THREE.MeshBasicMaterial({ color: item.platformConfig.accentColor }),
        paintOnBeforeCompile,
        'tao-studio-accent'
    ), [item.platformConfig.accentColor, paintOnBeforeCompile]);

    const setHover = useCallback((active) => {
        const target = active || isSelected ? 0.42 : 0.12;
        gsap.to(screenMaterial.emissive, { r: active || isSelected ? 0.04 : 0.02, g: active || isSelected ? 0.5 : 0.25, b: active || isSelected ? 0.42 : 0.2, duration: 0.25 });
        gsap.to(screenMaterial, { emissiveIntensity: target, duration: 0.25 });
    }, [isSelected, screenMaterial]);

    useEffect(() => {
        setHover(false);
    }, [setHover]);

    useEffect(() => () => {
        screenMaterial.dispose();
        shellMaterial.dispose();
        accentMaterial.dispose();
    }, [screenMaterial, shellMaterial, accentMaterial]);

    return (
        <group
            ref={meshRef}
            position={[item.x, item.baseY, item.z]}
            rotation={[0, item.rot, 0]}
            onPointerOver={(event) => {
                if (disabled) return;
                event.stopPropagation();
                setHover(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHover(false);
                document.body.style.cursor = 'auto';
            }}
            onPointerUp={(event) => {
                if (disabled) return;
                event.stopPropagation();
                onMonitorClick(item);
            }}
        >
            <mesh frustumCulled={false} material={shellMaterial}>
                <boxGeometry args={[item.width, item.height, item.depth]} />
            </mesh>
            <mesh position={[0, 0, item.depth / 2 + 0.006]} material={screenMaterial}>
                <planeGeometry args={[item.width - 0.16, item.height - 0.16]} />
            </mesh>
            <mesh position={[-item.width / 2 + 0.15, item.height / 2 - 0.11, item.depth / 2 + 0.012]} material={accentMaterial}>
                <planeGeometry args={[0.18, 0.035]} />
            </mesh>
            <Text
                position={[0, 0.19, item.depth / 2 + 0.014]}
                fontSize={0.09}
                maxWidth={1.22}
                color="#18322d"
                anchorX="center"
                anchorY="middle"
                textAlign="center"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                {item.title.toUpperCase()}
            </Text>
            <Text
                position={[0, -0.22, item.depth / 2 + 0.014]}
                fontSize={0.055}
                maxWidth={1.18}
                lineHeight={1.25}
                color="#35574e"
                anchorX="center"
                anchorY="middle"
                textAlign="center"
                font="/fonts/CabinSketch-Regular.ttf"
            >
                {item.description}
            </Text>
            <Text
                position={[0, -0.39, item.depth / 2 + 0.014]}
                fontSize={0.048}
                color="#0b8073"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                OPEN NOTE ↗
            </Text>
        </group>
    );
});

export default StudioRoom;
