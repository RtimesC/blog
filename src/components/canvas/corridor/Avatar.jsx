import OledGuide from './OledGuide';

// Keep the corridor-facing component name stable while replacing the former
// abstract signal with the local STM32 OLED control console.
const Avatar = ({ position = [10, -20, 30] }) => (
    <OledGuide position={position} />
);

export default Avatar;
