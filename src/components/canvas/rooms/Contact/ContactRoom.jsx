import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import { useScene } from '../../../../context/SceneContext';
import { useAchievements } from '../../../../context/AchievementsContext';
import { useAudio } from '../../../../context/AudioManager';
import { profile } from '../../../../content/portfolio';
import SocialBarrel from './SocialBarrel';
import { usePaintMaterial } from '../Gallery/usePaintMaterial';
import { SILENT_AUDIO } from '../../../../config/assetPolicy';

const WAVE_LAYERS = 5;
const AUDIO_SETTINGS = { volume: 2, distance: 2, rolloff: 1.2 };

const ContactRoom = ({ showRoom, onReady, isExiting, isWarmup }) => {
    const { camera } = useThree();
    const { isTeleporting } = useScene();
    const { showTutorial, unlockAchievement, hidePopup } = useAchievements();
    const { globalVolume, isMuted } = useAudio();
    const effectiveVolume = isMuted ? 0 : AUDIO_SETTINGS.volume * globalVolume;
    const groupRef = useRef();
    const audioRef = useRef();
    const waveRefs = useRef([]);
    const shipRef = useRef();
    const frameCount = useRef(0);
    const readySent = useRef(false);
    const teleportedRef = useRef(false);
    const { onBeforeCompile, animatePaint, resetPaint, uniformsData, updateRoomOrigin } = usePaintMaterial({
        dirX: 1,
        dirY: 0,
        dirZ: -0.1,
        startDist: -5,
        endDist: 55,
        noiseAxes: 'yz'
    });

    const waveMaterials = useMemo(() => Array.from({ length: WAVE_LAYERS }, (_, index) => {
        const material = new THREE.MeshBasicMaterial({
            color: index % 2 ? '#77b9b1' : '#b5ded5',
            transparent: true,
            opacity: 0.64 - index * 0.08,
            side: THREE.DoubleSide,
        });
        material.onBeforeCompile = onBeforeCompile;
        material.customProgramCacheKey = () => `tao-contact-wave-${index}`;
        material.needsUpdate = true;
        return material;
    }), [onBeforeCompile]);

    useEffect(() => () => waveMaterials.forEach((material) => material.dispose()), [waveMaterials]);

    useEffect(() => {
        if (isExiting || isTeleporting) hidePopup();
        if (isTeleporting) teleportedRef.current = true;
    }, [isExiting, isTeleporting, hidePopup]);

    useEffect(() => {
        audioRef.current?.setVolume?.(effectiveVolume);
    }, [effectiveVolume]);

    useEffect(() => {
        camera.rotation.reorder('YXZ');
        return () => camera.rotation.reorder('XYZ');
    }, [camera]);

    useEffect(() => {
        if (showRoom && !isWarmup && !teleportedRef.current && !isTeleporting) {
            resetPaint();
            animatePaint(0.2, 2.5);
        } else {
            uniformsData.uPaintProgress.value = 1;
        }
    }, [showRoom, isWarmup, isTeleporting, resetPaint, animatePaint, uniformsData]);

    useFrame((state) => {
        updateRoomOrigin(groupRef);

        if (!readySent.current) {
            frameCount.current += 1;
            if (frameCount.current >= 5) {
                readySent.current = true;
                onReady?.();
                if (!isWarmup) setTimeout(() => showTutorial('contact_submit'), 2000);
            }
        }

        const time = state.clock.getElapsedTime();
        waveRefs.current.forEach((wave, index) => {
            if (!wave) return;
            wave.position.y = Math.sin(time * (0.8 + index * 0.15) + index * 0.5) * (0.16 - index * 0.018);
        });

        if (shipRef.current) {
            shipRef.current.position.y = 1.6 + Math.sin(time * 0.8) * 0.3;
            shipRef.current.position.x = Math.sin(time * 0.04) * 12;
            shipRef.current.rotation.z = Math.sin(time * 0.96) * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={[0, -0.7, -5]}>
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
            <group position={[0, -1, -8]}>
                {waveMaterials.map((material, index) => (
                    <mesh
                        key={index}
                        ref={(element) => { waveRefs.current[index] = element; }}
                        position={[0, -index * 0.1, -index * 8]}
                        rotation={[-Math.PI / 2.5, 0, 0]}
                        material={material}
                    >
                        <planeGeometry args={[80, 30, 12, 1]} />
                    </mesh>
                ))}
            </group>

            <Dock paintOnBeforeCompile={onBeforeCompile} />
            <SignalLighthouse paintOnBeforeCompile={onBeforeCompile} />
            <SignalShip shipRef={shipRef} paintOnBeforeCompile={onBeforeCompile} />

            <Text
                position={[0, 2.8, -8.7]}
                fontSize={0.34}
                letterSpacing={0.08}
                color="#effbf7"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                SOURCE / FIELD NOTES
            </Text>
            <Text
                position={[0, 2.28, -8.7]}
                fontSize={0.17}
                maxWidth={6.4}
                lineHeight={1.3}
                color="#c3e6de"
                anchorX="center"
                anchorY="middle"
                textAlign="center"
                font="/fonts/CabinSketch-Regular.ttf"
            >
                A quiet exit from the gallery. The code and working notes live on GitHub.
            </Text>

            <SocialBarrel
                position={[0, 0.25, -8]}
                rotation={[0, 0, 0]}
                label="GITHUB / RTIMESC"
                onClick={() => {
                    unlockAchievement('contact_submit');
                    window.open(profile.githubUrl, '_blank', 'noopener,noreferrer');
                }}
                paintOnBeforeCompile={onBeforeCompile}
            />
        </group>
    );
};

const Dock = ({ paintOnBeforeCompile }) => (
    <group position={[0, 0.06, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
            <mesh key={index} position={[0, 0, index * -1.08]}>
                <boxGeometry args={[2.5, 0.14, 0.92]} />
                <meshStandardMaterial color={index % 2 ? '#6a7b70' : '#80968a'} roughness={0.9} onBeforeCompile={paintOnBeforeCompile} />
            </mesh>
        ))}
        {[-1.05, 1.05].map((x) => [0, 2, 4].map((index) => (
            <mesh key={`${x}-${index}`} position={[x, 0.48, -index * 1.08]}>
                <cylinderGeometry args={[0.045, 0.06, 0.88, 8]} />
                <meshStandardMaterial color="#2c4f49" roughness={0.8} onBeforeCompile={paintOnBeforeCompile} />
            </mesh>
        )))}
    </group>
);

const SignalLighthouse = ({ paintOnBeforeCompile }) => (
    <group position={[-10, 4.1, -20]} rotation={[0, 0.1, 0]}>
        <mesh>
            <cylinderGeometry args={[0.82, 1.15, 4.8, 16]} />
            <meshStandardMaterial color="#e1f1eb" roughness={0.75} onBeforeCompile={paintOnBeforeCompile} />
        </mesh>
        <mesh position={[0, 2.1, 0]}>
            <cylinderGeometry args={[0.95, 0.95, 0.7, 16]} />
            <meshStandardMaterial color="#244d48" roughness={0.5} onBeforeCompile={paintOnBeforeCompile} />
        </mesh>
        <mesh position={[0, 2.18, 0.96]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshBasicMaterial color="#6ff2d4" />
        </mesh>
    </group>
);

const SignalShip = ({ shipRef, paintOnBeforeCompile }) => (
    <group ref={shipRef} position={[0, 1.6, -15]} rotation={[0, -0.2, 0]}>
        <mesh>
            <boxGeometry args={[3.35, 0.62, 1.3]} />
            <meshStandardMaterial color="#264d47" roughness={0.7} onBeforeCompile={paintOnBeforeCompile} />
        </mesh>
        <mesh position={[0.2, 0.55, 0]}>
            <boxGeometry args={[1.35, 0.75, 0.82]} />
            <meshStandardMaterial color="#e3f4ee" roughness={0.8} onBeforeCompile={paintOnBeforeCompile} />
        </mesh>
        <mesh position={[-0.55, 1.6, 0]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.035, 0.035, 2.1, 8]} />
            <meshStandardMaterial color="#213b38" roughness={0.75} onBeforeCompile={paintOnBeforeCompile} />
        </mesh>
        <mesh position={[-0.05, 1.48, 0]}>
            <planeGeometry args={[1.45, 1.35]} />
            <meshBasicMaterial color="#a9dbd0" side={THREE.DoubleSide} />
        </mesh>
    </group>
);

export default ContactRoom;
