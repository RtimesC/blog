/**
 * Simple Global Audio Manager for background music
 */

let musicVolume = 0;

// The source soundtrack is disabled until Tao supplies original or licensed
// audio. Keep this compatibility API so existing scene controls remain safe.
export const initAudio = () => {};
export const playBackgroundMusic = () => {};
export const pauseBackgroundMusic = () => {};
export const toggleMute = () => true;
export const getIsMuted = () => true;

export const setMusicVolume = (volume) => {
    musicVolume = Math.max(0, Math.min(1, volume));
    window.dispatchEvent(new CustomEvent('musicVolumeChanged', { detail: musicVolume }));
};

export const getMusicVolume = () => musicVolume;
