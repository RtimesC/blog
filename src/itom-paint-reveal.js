import * as THREE from 'three';

/*
 * Adapted from PaintRevealMaterial in ITomPoland/portfolio-itom.
 * Copyright (c) 2026 Tomasz Szmajda. Licensed under MIT.
 * Source: https://github.com/ITomPoland/portfolio-itom
 * See THIRD_PARTY_NOTICES.md for the complete license text.
 */

/**
 * Builds a paper door material that reveals its room colour through an organic,
 * brush-like mask. The original implementation blends two image textures; this
 * native Three.js version retains the reveal algorithm but blends to each
 * room's colour so the portfolio stays small and independently maintainable.
 */
export function createPaintRevealMaterial({ color, map, paintedColor }) {
  const material = new THREE.MeshStandardMaterial({
    color,
    map,
    roughness: 1,
    side: THREE.DoubleSide,
  });
  const accent = new THREE.Color(paintedColor);
  let shader = null;
  let progress = 0;

  material.onBeforeCompile = (nextShader) => {
    shader = nextShader;
    nextShader.uniforms.uPaintProgress = { value: progress };
    nextShader.uniforms.uPaintColor = { value: accent };

    nextShader.fragmentShader = nextShader.fragmentShader.replace(
      '#include <common>',
      /* glsl */`#include <common>
      uniform float uPaintProgress;
      uniform vec3 uPaintColor;

      float paintRand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      float paintNoise(vec2 p) {
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u * u * (3.0 - 2.0 * u);
        float res = mix(
          mix(paintRand(ip), paintRand(ip + vec2(1.0, 0.0)), u.x),
          mix(paintRand(ip + vec2(0.0, 1.0)), paintRand(ip + vec2(1.0, 1.0)), u.x),
          u.y
        );
        return res * res;
      }
      `,
    );

    nextShader.fragmentShader = nextShader.fragmentShader.replace(
      '#include <map_fragment>',
      /* glsl */`#include <map_fragment>

      if (uPaintProgress > 0.001) {
        float noise = paintNoise(vMapUv * 15.0) * 0.15;
        float maskValue = (1.0 - vMapUv.y) + noise;
        float threshold = uPaintProgress * 1.5;
        float painted = smoothstep(threshold - 0.13, threshold + 0.08, maskValue);
        diffuseColor.rgb = mix(uPaintColor, diffuseColor.rgb, painted);
      }
      `,
    );
  };

  material.customProgramCacheKey = () => 'taotao-itom-paint-reveal-v1';
  material.setPaintProgress = (value) => {
    progress = THREE.MathUtils.clamp(value, 0, 1);
    if (shader) shader.uniforms.uPaintProgress.value = progress;
  };

  return material;
}
