import { useMemo } from 'react';
import * as THREE from 'three';

const WALL_X_OUTER = 3.5;
const WALL_X_INNER = 1.7;

/**
 * Minimal corridor shell. DoorSection supplies each angled wall and doorway;
 * this component fills the straight wall spans between those sections.
 */
const CorridorWalls = ({ zStart = 10, length = 80, doorPositions = [], zClip = 100000 }) => {
    const corridorHeight = 3.5;
    const corridorWidth = WALL_X_OUTER * 2;
    const effectiveStart = Math.min(zStart, zClip);
    const effectiveLength = effectiveStart - (zStart - length);
    const zCenter = effectiveStart - effectiveLength / 2;

    const wallSegments = useMemo(() => {
        if (effectiveLength <= 0) return [];

        return ['left', 'right'].flatMap((side) => {
            const isLeft = side === 'left';
            const wallX = isLeft ? -WALL_X_OUTER : WALL_X_OUTER;
            const rotation = [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0];
            const endZ = effectiveStart - effectiveLength;
            let cursorZ = effectiveStart;
            const segments = [];

            const sideDoors = doorPositions
                .filter((door) => door.side === side)
                .sort((a, b) => b.relativeZ - a.relativeZ);

            sideDoors.forEach((door) => {
                const doorZ = zStart + door.relativeZ;
                const doorStartZ = doorZ + 2;
                const doorEndZ = doorZ - 2;

                if (doorStartZ > cursorZ || doorEndZ < endZ) return;

                if (cursorZ > doorStartZ) {
                    const segmentLength = cursorZ - doorStartZ;
                    segments.push({
                        key: `${side}-${door.id}-before`,
                        position: [wallX, 0, cursorZ - segmentLength / 2],
                        rotation,
                        length: segmentLength,
                    });
                }

                cursorZ = doorEndZ;

                segments.push({
                    key: `${side}-${door.id}-return`,
                    position: [isLeft ? -(WALL_X_OUTER + WALL_X_INNER) / 2 : (WALL_X_OUTER + WALL_X_INNER) / 2, 0, doorEndZ],
                    rotation: [0, Math.PI, 0],
                    length: WALL_X_OUTER - WALL_X_INNER,
                });
            });

            if (cursorZ > endZ) {
                const segmentLength = cursorZ - endZ;
                segments.push({
                    key: `${side}-end`,
                    position: [wallX, 0, cursorZ - segmentLength / 2],
                    rotation,
                    length: segmentLength,
                });
            }

            return segments;
        });
    }, [doorPositions, effectiveLength, effectiveStart, zStart]);

    if (effectiveLength <= 0) return null;

    return (
        <group>
            <mesh position={[0, -corridorHeight / 2, zCenter]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[corridorWidth, effectiveLength]} />
                <meshBasicMaterial color="#c9c7bf" side={THREE.DoubleSide} />
            </mesh>

            <mesh position={[0, corridorHeight / 2, zCenter]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[corridorWidth, effectiveLength]} />
                <meshBasicMaterial color="#f2f1ed" side={THREE.DoubleSide} />
            </mesh>

            {wallSegments.map((segment) => (
                <mesh key={segment.key} position={segment.position} rotation={segment.rotation}>
                    <planeGeometry args={[segment.length, corridorHeight]} />
                    <meshBasicMaterial color="#e7e5df" side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
};

export default CorridorWalls;
