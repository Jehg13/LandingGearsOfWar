import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
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
};

export const createAtmosphere = (
  canvas: HTMLCanvasElement,
  getScrollProgress: () => number,
) => {
  const scene = new Scene();
  const camera = new PerspectiveCamera(48, 1, 0.1, 90);
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
    { count: window.innerWidth < 640 ? 45 : 72, depth: -8, size: 0.028, opacity: 0.28, speed: 0.003 },
    { count: window.innerWidth < 640 ? 30 : 54, depth: -2, size: 0.043, opacity: 0.36, speed: 0.006 },
    { count: window.innerWidth < 640 ? 14 : 28, depth: 4, size: 0.058, opacity: 0.48, speed: 0.01 },
  ];
  const particleLayers: ParticleLayer[] = [];
  const palettes = [
    ["#f75a38", "#c8bbb0", "#969490"],
    ["#ee8a4d", "#e7dac4", "#afa99b"],
    ["#ff382a", "#f3b27c", "#b5a8a0"],
    ["#e77e62", "#aebec0", "#77868b"],
    ["#f4e3bd", "#e4d7ca", "#c4bcc1"],
  ].map((palette) => palette.map((color) => new Color(color)));

  for (const layer of layers) {
    const positions = new Float32Array(layer.count * 3);
    const colors = new Float32Array(layer.count * 3);
    const categories = new Uint8Array(layer.count);
    const horizontalSpeeds = new Float32Array(layer.count);
    const verticalSpeeds = new Float32Array(layer.count);
    const phases = new Float32Array(layer.count);

    for (let index = 0; index < layer.count; index += 1) {
      const offset = index * 3;
      positions[offset] = (Math.random() - 0.5) * 34;
      positions[offset + 1] = (Math.random() - 0.5) * 20;
      positions[offset + 2] = layer.depth + (Math.random() - 0.5) * 4;

      const roll = Math.random();
      const category = roll < 0.12 ? 0 : roll < 0.47 ? 2 : 1;
      categories[index] = category;
      horizontalSpeeds[index] = (Math.random() - 0.5) * layer.speed * 0.48;
      verticalSpeeds[index] = layer.speed * (0.55 + Math.random() * 0.9);
      phases[index] = Math.random() * Math.PI * 2;

      const color = palettes[0][category];
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
      transparent: true,
      opacity: layer.opacity,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const points = new Points(geometry, material);
    particleLayers.push({ points, categories, horizontalSpeeds, verticalSpeeds, phases });
    scene.add(points);
  }

  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const trackPointer = (event: PointerEvent) => {
    pointerX = (event.clientX / width - 0.5) * 0.8;
    pointerY = (event.clientY / height - 0.5) * 0.5;
  };

  const render = () => {
    if (document.hidden) {
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

    for (const layer of particleLayers) {
      const positions = layer.points.geometry.attributes.position.array as Float32Array;
      const colors = layer.points.geometry.attributes.color.array as Float32Array;

      for (let index = 0; index < layer.categories.length; index += 1) {
        const offset = index * 3;
        const phase = layer.phases[index] + progress * Math.PI * 2;
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
    camera.position.x += (pointerX * 0.48 - camera.position.x) * 0.012;
    camera.position.y += (-pointerY * 0.42 - camera.position.y) * 0.012;
    camera.position.z += (targetZ - camera.position.z) * 0.016;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(render);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else if (!animationFrame) {
      render();
    }
  };

  resize();
  if (!document.hidden) render();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", trackPointer, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);

  window.addEventListener(
    "pagehide",
    () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", trackPointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      particleLayers.forEach(({ points }) => {
        points.geometry.dispose();
        points.material.dispose();
      });
      renderer.dispose();
    },
    { once: true },
  );
};
