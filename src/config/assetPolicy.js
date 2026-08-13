import * as THREE from 'three';

// The source project included personal artwork and textures that are not part
// of this portfolio's public asset licence. Keep their scene geometry alive
// while it is rebuilt, but never fetch or render those files at runtime.
export const NEUTRAL_TEXTURE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%23d8d6cf'/%3E%3C/svg%3E";
export const SILENT_AUDIO = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==';

export const installAssetPolicy = () => {
    THREE.DefaultLoadingManager.setURLModifier((url) => {
        if (url.startsWith('data:')) return url;

        const path = new URL(url, window.location.href).pathname;
        if (path.startsWith('/sounds/')) return SILENT_AUDIO;

        const isTaoAsset = path.startsWith('/textures/tao/');
        const isLegacyVisual = path.startsWith('/textures/') || path.startsWith('/images/');

        return isLegacyVisual && !isTaoAsset ? NEUTRAL_TEXTURE : url;
    });
};
