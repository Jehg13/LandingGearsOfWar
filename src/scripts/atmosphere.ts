import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  MathUtils,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";

type ParticleLayer = {
  points: Points<BufferGeometry, PointsMaterial>;
  categories: Uint8Array;
  horizontalSpeeds: Float32Array;
  verticalSpeeds: Float32Array;
  phases: Float32Array;
  opacity: number;
};

export const createAtmosphere = (
  canvas: HTMLCanvasElement,
  getScrollProgress: () => number,
  animate = true,
) => {
  const host = canvas.parentElement;
  if (!host) {
    throw new Error("El campo de partículas necesita un contenedor local.");
  }

  let width = Math.max(host.clientWidth, 1);
  let height = Math.max(host.clientHeight, 1);
  const scene = new Scene();
  const camera = new PerspectiveCamera(48, width / height, 0.1, 90);
  camera.position.z = 23;

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));
  renderer.setClearColor(0x000000, 0);

  const layers = [
    {
      count: width < 640 ? 72 : 112,
      depth: -12,
      size: 0.1,
      opacity: 0.34,
      speed: 0.0025,
    },
    {
      count: width < 640 ? 55 : 78,
      depth: -4,
      size: 0.17,
      opacity: 0.42,
      speed: 0.0045,
    },
    {
      count: width < 640 ? 30 : 45,
      depth: 4,
      size: 0.3,
      opacity: 0.52,
      speed: 0.0075,
    },
    {
      count: width < 640 ? 16 : 22,
      depth: 8,
      size: 0.44,
      opacity: 0.62,
      speed: 0.01,
    },
  ];
  const particleLayers: ParticleLayer[] = [];
  const palettes = [
    ["#f04443", "#d8d2ca", "#ff843d"],
    ["#ff542d", "#e5ded2", "#ffb347"],
    ["#e12635", "#c4c9ce", "#f2653b"],
    ["#ff6440", "#e0cbb9", "#ffcf69"],
    ["#c91e31", "#ddd9d2", "#ff7b45"],
    ["#ff3d30", "#d6d1cc", "#ffd166"],
  ].map((palette) => palette.map((color) => new Color(color)));
  const particleCanvas = document.createElement("canvas");
  particleCanvas.width = 64;
  particleCanvas.height = 64;
  const particleContext = particleCanvas.getContext("2d");
  if (!particleContext) {
    throw new Error("No se pudo crear la textura de partículas.");
  }
  const particlePixels = particleContext.createImageData(64, 64);
  for (let y = 0; y < 64; y += 1) {
    for (let x = 0; x < 64; x += 1) {
      const dx = (x - 31.5) / 31.5;
      const dy = (y - 31.5) / 31.5;
      const angle = Math.atan2(dy, dx);
      const edge =
        0.78 +
        Math.sin(angle * 3 + 0.7) * 0.08 +
        Math.sin(angle * 5 - 1.1) * 0.06 +
        Math.sin(angle * 7 + 2.4) * 0.035;
      const distance = Math.sqrt(dx * dx + dy * dy) / edge;
      const alpha = MathUtils.clamp((1 - distance) * 1.7, 0, 1);
      const offset = (y * 64 + x) * 4;
      particlePixels.data[offset] = 255;
      particlePixels.data[offset + 1] = 255;
      particlePixels.data[offset + 2] = 255;
      particlePixels.data[offset + 3] = Math.round(alpha * alpha * 220);
    }
  }
  particleContext.putImageData(particlePixels, 0, 0);
  const particleTexture = new CanvasTexture(particleCanvas);

  for (const layer of layers) {
    const positions = new Float32Array(layer.count * 3);
    const colors = new Float32Array(layer.count * 3);
    const categories = new Uint8Array(layer.count);
    const horizontalSpeeds = new Float32Array(layer.count);
    const verticalSpeeds = new Float32Array(layer.count);
    const phases = new Float32Array(layer.count);

    for (let index = 0; index < layer.count; index += 1) {
      const offset = index * 3;
      const depth = layer.depth + (Math.random() - 0.5) * 7;
      const distance = camera.position.z - depth;
      const halfHeight = distance * Math.tan(MathUtils.degToRad(camera.fov / 2));
      const halfWidth = halfHeight * camera.aspect;
      const cloudCenter = Math.random() < 0.6 ? -0.34 : 0.28;
      const clustered = Math.random() < 0.76;
      const cloudX = (Math.random() + Math.random() + Math.random() - 1.5) * 0.42;
      const cloudY = (Math.random() + Math.random() + Math.random() - 1.5) * 0.4;
      const normalizedX = clustered ? cloudCenter + cloudX : Math.random() * 2 - 1;
      const normalizedY = clustered ? -0.16 + cloudY : Math.random() * 2 - 1;
      positions[offset] = MathUtils.clamp(normalizedX, -1, 1) * halfWidth;
      positions[offset + 1] = MathUtils.clamp(normalizedY, -1, 1) * halfHeight;
      positions[offset + 2] = depth;

      const roll = Math.random();
      const category = roll < 0.22 ? 0 : roll < 0.76 ? 1 : 2;
      categories[index] = category;
      horizontalSpeeds[index] = (Math.random() - 0.5) * layer.speed * 1.8;
      verticalSpeeds[index] = layer.speed * (0.75 + Math.random() * 1.4);
      phases[index] = Math.random() * Math.PI * 2;

      const color = palettes[Math.floor(Math.random() * palettes.length)][category];
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: layer.size,
      sizeAttenuation: true,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: layer.opacity,
      alphaTest: 0.015,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const points = new Points(geometry, material);
    particleLayers.push({
      points,
      categories,
      horizontalSpeeds,
      verticalSpeeds,
      phases,
      opacity: layer.opacity,
    });
    scene.add(points);
  }

  let animationFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let isVisible = false;

  const resize = () => {
    width = Math.max(host.clientWidth, 1);
    height = Math.max(host.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const trackPointer = (event: PointerEvent) => {
    const bounds = host.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / width - 0.5) * 0.8;
    pointerY = ((event.clientY - bounds.top) / height - 0.5) * 0.5;
  };

  const render = () => {
    if (document.hidden || !isVisible) {
      animationFrame = 0;
      return;
    }

    const halfHeight = camera.position.z * Math.tan(MathUtils.degToRad(camera.fov / 2));
    const progress = MathUtils.clamp(getScrollProgress(), 0, 1);
    const palettePosition = progress * (palettes.length - 1);
    const paletteIndex = Math.min(palettes.length - 2, Math.floor(palettePosition));
    const paletteMix = palettePosition - paletteIndex;
    const nextPalette = palettes[paletteIndex + 1];
    const currentPalette = palettes[paletteIndex];
    const color = new Color();
    const intensityStops = [0.58, 0.78, 1, 0.72, 0.9, 0.62, 0.84];
    const stopPosition = progress * (intensityStops.length - 1);
    const stopIndex = Math.min(intensityStops.length - 2, Math.floor(stopPosition));
    const stopMix = MathUtils.smoothstep(stopPosition - stopIndex, 0, 1);
    const intensity = MathUtils.lerp(
      intensityStops[stopIndex],
      intensityStops[stopIndex + 1],
      stopMix,
    );

    for (const layer of particleLayers) {
      const positions = layer.points.geometry.attributes.position.array as Float32Array;
      const colors = layer.points.geometry.attributes.color.array as Float32Array;
      layer.points.material.opacity = layer.opacity * intensity;

      for (let index = 0; index < layer.categories.length; index += 1) {
        const offset = index * 3;
        const phase = layer.phases[index] + progress * Math.PI * 2;
        if (animate) {
          positions[offset] += layer.horizontalSpeeds[index] + Math.sin(phase) * 0.0012;
          positions[offset + 1] += layer.verticalSpeeds[index] * (1 + progress * 0.4);
          layer.phases[index] += 0.008 + layer.verticalSpeeds[index] * 2;

          if (positions[offset + 1] > halfHeight) {
            positions[offset + 1] = -halfHeight;
            positions[offset] = (Math.random() - 0.5) * halfHeight * camera.aspect * 2;
          }
          if (positions[offset] > camera.aspect * halfHeight) {
            positions[offset] = -camera.aspect * halfHeight;
          } else if (positions[offset] < -camera.aspect * halfHeight) {
            positions[offset] = camera.aspect * halfHeight;
          }
        }

        const category = layer.categories[index];
        color.copy(currentPalette[category]).lerp(nextPalette[category], paletteMix);
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
      }

      layer.points.geometry.attributes.position.needsUpdate = true;
      layer.points.geometry.attributes.color.needsUpdate = true;
      layer.points.rotation.y = pointerX * 0.018 + progress * 0.045;
      layer.points.rotation.x = pointerY * 0.012;
    }

    const targetZ = 23 - progress * 1.8;
    if (animate) {
      camera.position.x += (pointerX * 0.48 - camera.position.x) * 0.012;
      camera.position.y += (-pointerY * 0.42 - camera.position.y) * 0.012;
      camera.position.z += (targetZ - camera.position.z) * 0.016;
    } else {
      camera.position.set(pointerX * 0.48, -pointerY * 0.42, targetZ);
    }
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    if (animate && !document.hidden && isVisible) {
      animationFrame = window.requestAnimationFrame(render);
    }
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!animate && isVisible) render();
  });
  resizeObserver.observe(host);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !document.hidden && !animationFrame) render();
      if (!isVisible && animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    },
    { rootMargin: "100px" },
  );
  intersectionObserver.observe(host);

  const handleVisibilityChange = () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else if (isVisible && !animationFrame) {
      render();
    }
  };

  resize();
  host.addEventListener("pointermove", trackPointer, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);

  window.addEventListener(
    "pagehide",
    () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener("pointermove", trackPointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      particleLayers.forEach(({ points }) => {
        points.geometry.dispose();
        points.material.dispose();
      });
      particleTexture.dispose();
      renderer.dispose();
    },
    { once: true },
  );
};
