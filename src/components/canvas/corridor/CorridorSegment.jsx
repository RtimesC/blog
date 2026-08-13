import { useMemo, memo } from 'react';

import CorridorWalls from './CorridorWalls';
import DoorSection from './DoorSection';
import Avatar from './Avatar';
import HeroText from './HeroText';

/**
 * CorridorSegment Component
 * 
 * A single repeatable chunk of the infinite corridor.
 * Each segment contains: walls, signal mark, title, doors, decorations.
 * 
 * Segment length: 80 units
 * Positioned based on segmentIndex * segmentLength
 */
const SEGMENT_LENGTH = 80;

// Sawtooth Geometry Constants (Shared with CorridorWalls logic conceptually)
const WALL_X_OUTER = 3.5;
const WALL_X_INNER = 1.7;
const DOOR_Z_SPAN = 4;
// Angle of the wall relative to the corridor axis
const WALL_ANGLE = Math.atan2(WALL_X_OUTER - WALL_X_INNER, DOOR_Z_SPAN);


const CorridorSegment = ({
    segmentIndex = 0,
    onDoorEnter,
    hideSegmentDoors = false, // Hide only SegmentDoors while keeping content preloaded
    zClip = 100000, // Clipping plane (render everything with Z < zClip)
    setCameraOverride // Function to take over camera control
}) => {

    // Calculate Z offset based on segment index
    // Segment 0 starts at Z=10, goes to Z=-70
    const zOffset = 10 - (segmentIndex * SEGMENT_LENGTH);

    // Door positions within this segment (relative to segment start)
    const doors = useMemo(() => {
        const doorDefs = [
            {
                id: `gallery-${segmentIndex}`,
                roomId: 'gallery',
                relativeZ: -18,
                side: 'left',
                label: 'SELECTED WORK',
                icon: '◈',
                color: '#f5efe6'
            },
            {
                id: `studio-${segmentIndex}`,
                roomId: 'studio',
                relativeZ: -32,
                side: 'right',
                label: 'FIELD NOTES',
                icon: '▶',
                color: '#e6f5ef'
            },
            {
                id: `about-${segmentIndex}`,
                roomId: 'about',
                relativeZ: -48,
                side: 'left',
                label: 'ABOUT TAO',
                icon: '★',
                color: '#efe6f5',
                enterDistance: 25 // Enter deep into the room (clouds are far back)
            },
            {
                id: `connect-${segmentIndex}`,
                roomId: 'contact',
                relativeZ: -62,
                side: 'right',
                label: 'GITHUB / SOURCE',
                icon: '↗',
                color: '#f5e6e6'
            },
        ];

        return doorDefs.map(def => {
            // Calculate adjusted Position and Rotation for Sawtooth Walls
            const xBase = (WALL_X_OUTER + WALL_X_INNER) / 2; // Midpoint of the angled wall
            const xPos = def.side === 'left' ? -xBase : xBase;

            // Rotation:
            // Left Wall: Normal was (1,0,0) [RotY 90]. Now angle it towards camera (+Z).
            // Rotate Clockwise by WALL_ANGLE.
            // Right Wall: Normal was (-1,0,0) [RotY -90]. Angle towards camera (+Z).
            // Rotate Counter-Clockwise by WALL_ANGLE.

            const baseRot = def.side === 'left' ? Math.PI / 2 : -Math.PI / 2;
            const rotOffset = def.side === 'left' ? -WALL_ANGLE : WALL_ANGLE;

            return {
                ...def,
                x: xPos,
                rotation: baseRot + rotOffset
            };
        });
    }, [segmentIndex]);

    return (
        <group position={[0, 0, 0]}>
            {/* === CORRIDOR WALLS === */}
            {/* Pass door positions so walls can generate gaps/angles correctly */}
            <CorridorWalls
                zStart={zOffset}
                length={SEGMENT_LENGTH}
                doorPositions={doors}
                zClip={zClip}
            />

            {/* === WELCOME AREA (Start of segment) - MOVED CLOSER === */}
            <group position={[0, 0, zOffset - 2]}>
                {/* TAO title - centered (letters adjust internally) */}
                <HeroText position={[0, -0.1, -0.5]} />

                {/* Avatar - center */}
                <Avatar position={[0, -0.8, -0.3]} />

            </group>

            {/* === DOOR SECTIONS (wall + door + label as one unit) === */}
            {/* Hidden during entrance animation for segment -1 */}
            {!hideSegmentDoors && doors.map((door) => (
                <DoorSection
                    key={door.id}
                    position={[
                        door.x,
                        0,
                        zOffset + door.relativeZ + 2
                    ]}
                    side={door.side}
                    label={door.label}
                    roomId={door.roomId}
                    icon={door.icon}
                    color={door.color}
                    enterDistance={door.enterDistance}
                    onEnter={() => onDoorEnter?.(door.roomId)}
                    setCameraOverride={setCameraOverride}
                    segmentIndex={segmentIndex}
                />
            ))}

            {/* === LIGHTING === */}
            {/* pointLight removed for optimization as it didn't affect visuals significantly */}

        </group>
    );
};

const MemoizedCorridorSegment = memo(CorridorSegment);

export { SEGMENT_LENGTH, WALL_X_OUTER, WALL_X_INNER, DOOR_Z_SPAN };
export default MemoizedCorridorSegment;
