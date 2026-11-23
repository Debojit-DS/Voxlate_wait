import * as THREE from "three";
import type { Earpiece } from "./earpiece";

/**
 * Soft light around the earpiece's LED strip.
 *
 * Renders only the strip (the rest of the device as an invisible occluder, so the glow disappears
 * when the strip turns away) into a small buffer, blurs it at two widths and blends it back over the
 * frame in the LED's own colour. Works on the transparent canvas and on the light page behind it.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const blurShader = /* glsl */ `
  uniform sampler2D tMap;
  uniform vec2 uStep;
  varying vec2 vUv;
  void main() {
    // 9-tap Gaussian using linear filtering (5 fetches).
    vec4 c = texture2D(tMap, vUv) * 0.2270270270;
    c += texture2D(tMap, vUv + uStep * 1.3846153846) * 0.3162162162;
    c += texture2D(tMap, vUv - uStep * 1.3846153846) * 0.3162162162;
    c += texture2D(tMap, vUv + uStep * 3.2307692308) * 0.0702702703;
    c += texture2D(tMap, vUv - uStep * 3.2307692308) * 0.0702702703;
    gl_FragColor = c;
  }
`;

const compositeShader = /* glsl */ `
  uniform sampler2D tTight;
  uniform sampler2D tWide;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vec4 g = texture2D(tTight, vUv) * 0.55 + texture2D(tWide, vUv) * 0.7;
    float a = clamp(g.a * uStrength, 0.0, 0.5);
    if (a < 0.002) discard;
    vec3 c = g.rgb / max(g.a, 1e-4);
    c = sRGBTransferOETF(vec4(c, 1.0)).rgb;
    gl_FragColor = vec4(c * a, a);
  }
`;

export type LedGlow = {
  /** Renders the scene with the glow. `hide` are scene objects that are neither device nor LED (e.g. the ribbon). */
  render: (scene: THREE.Scene, camera: THREE.Camera, strength: number) => void;
  setParts: (occluders: THREE.Mesh[], leds: THREE.Mesh[], hide: THREE.Object3D[]) => void;
  dispose: () => void;
};

export function createLedGlow(renderer: THREE.WebGLRenderer, earpiece: Earpiece): LedGlow {
  const type = renderer.extensions.has("EXT_color_buffer_float") ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const mask = new THREE.WebGLRenderTarget(1, 1, { type, samples: 4 });
  const rt = (depthBuffer = false) => new THREE.WebGLRenderTarget(1, 1, { type, depthBuffer });
  const tightA = rt();
  const tightB = rt();
  const wideA = rt();
  const wideB = rt();
  const targets = [tightA, tightB, wideA, wideB];

  const triangle = new THREE.BufferGeometry();
  triangle.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  triangle.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));

  const blur = new THREE.ShaderMaterial({
    uniforms: { tMap: { value: null }, uStep: { value: new THREE.Vector2() } },
    vertexShader,
    fragmentShader: blurShader,
    depthTest: false,
    depthWrite: false,
  });
  const composite = new THREE.ShaderMaterial({
    uniforms: { tTight: { value: tightB.texture }, tWide: { value: wideB.texture }, uStrength: { value: 1 } },
    vertexShader,
    fragmentShader: compositeShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
  const quad = new THREE.Mesh(triangle, blur);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let occluders: THREE.Mesh[] = [];
  let leds: THREE.Mesh[] = [];
  let hide: THREE.Object3D[] = [];
  const saved = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const size = new THREE.Vector2();
  let w = 0;
  let h = 0;

  const resize = () => {
    renderer.getSize(size);
    const nw = Math.max(1, Math.round(size.x));
    const nh = Math.max(1, Math.round(size.y));
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    mask.setSize(Math.ceil(w / 2), Math.ceil(h / 2));
    tightA.setSize(Math.ceil(w / 4), Math.ceil(h / 4));
    tightB.setSize(Math.ceil(w / 4), Math.ceil(h / 4));
    wideA.setSize(Math.ceil(w / 8), Math.ceil(h / 8));
    wideB.setSize(Math.ceil(w / 8), Math.ceil(h / 8));
  };

  const pass = (src: THREE.WebGLRenderTarget, dst: THREE.WebGLRenderTarget, dx: number, dy: number, spread: number) => {
    quad.material = blur;
    blur.uniforms.tMap.value = src.texture;
    blur.uniforms.uStep.value.set((dx * spread) / src.width, (dy * spread) / src.height);
    renderer.setRenderTarget(dst);
    renderer.render(quadScene, quadCamera);
  };

  const setVisible = (list: THREE.Object3D[], visible: boolean) => {
    const before = list.map((o) => o.visible);
    for (const o of list) o.visible = visible;
    return () => list.forEach((o, i) => (o.visible = before[i]));
  };

  return {
    setParts(nextOccluders, nextLeds, nextHide) {
      occluders = nextOccluders;
      leds = nextLeds;
      hide = nextHide;
    },
    render(scene, camera, strength) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      if (strength <= 0.001 || leds.length === 0 || !leds.some((m) => m.parent?.visible !== false)) return;
      resize();

      const autoClear = renderer.autoClear;

      // 1. The strip in its LED colour, the device body as an occluder that writes nothing.
      const restoreHidden = setVisible(hide, false);
      for (const m of occluders) {
        saved.set(m, m.material);
        m.material = earpiece.maskMaterials.occluder;
      }
      for (const m of leds) {
        saved.set(m, m.material);
        m.material = earpiece.maskMaterials.led;
      }
      renderer.setRenderTarget(mask);
      renderer.clear();
      renderer.render(scene, camera);
      saved.forEach((mat, m) => (m.material = mat));
      saved.clear();

      // 2. Blur at two widths.
      pass(mask, tightA, 1, 0, 1);
      pass(tightA, tightB, 0, 1, 1);
      pass(tightB, wideA, 1, 0, 1.2);
      pass(wideA, wideB, 0, 1, 1.2);
      pass(wideB, wideA, 1, 0, 2);
      pass(wideA, wideB, 0, 1, 2);

      // 3. Blend the light over the frame, then redraw the strip on top so it stays crisp.
      renderer.autoClear = false;
      renderer.setRenderTarget(null);
      quad.material = composite;
      composite.uniforms.uStrength.value = strength;
      renderer.render(quadScene, quadCamera);
      const restoreOccluders = setVisible(occluders, false);
      renderer.render(scene, camera);
      restoreOccluders();
      restoreHidden();

      renderer.autoClear = autoClear;
    },
    dispose() {
      mask.dispose();
      targets.forEach((t) => t.dispose());
      triangle.dispose();
      blur.dispose();
      composite.dispose();
    },
  };
}
