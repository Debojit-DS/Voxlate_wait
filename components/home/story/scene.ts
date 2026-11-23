import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { arcTable, clamp01, easeInOut, lerp } from "../lemniscate";
import { drawWordAtlas, RIBBON_PAIRS, SLOT_ASPECT } from "./words";

/**
 * Hero + "stations" scene.
 *
 * An infinity ribbon sits behind the Voxlate earpiece. Words travel along it at constant speed:
 * on the left lobe they are other languages (light band), on the right lobe they are English
 * (cobalt band). The switch happens per word as it passes behind the device, so every word
 * goes in as one language and comes out as the other — in both directions.
 *
 * Scrolling (`intro` 0→1) zooms into the right lobe until it becomes the arc the station
 * markers ride on; `station` (0..2) moves the markers along it and the device beside it.
 */

export type DevicePart = "touch_pad" | "volume_buttons" | "ear_gel";
export type MarkerPoint = { x: number; y: number };

export type StoryScene = {
  setTargets: (intro: number, station: number) => void;
  setPointer: (x: number, y: number) => void;
  setHighlight: (part: DevicePart | null) => void;
  setRunning: (running: boolean) => void;
  dispose: () => void;
};

type Options = {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  reducedMotion: boolean;
  markerCount: number;
  /** Called after every rendered frame with marker screen positions and the smoothed scroll state. */
  onMarkers: (points: MarkerPoint[], compact: boolean, station: number, intro: number) => void;
  onDeviceReady?: () => void;
};

const LOBE_B = 1.45;
const STRAND_DEPTH = 0.55;
const RIBBON_Z = -2.15;
const SEGMENTS = 1600;
const FOV = 28;
const CAM_Z = 24;
const FLOW_SPEED = 0.55;

const COLORS = {
  paper: "#fbfaf8",
  cobalt: "#2340d8",
  ink: "#0b1430",
  white: "#ffffff",
};

type RibbonPose = { x: number; y: number; scale: number; rotX: number; rotY: number; width: number; readX: number; readY: number };
type DevicePose = { x: number; y: number; h: number; yaw: number; rotX: number; rotZ: number };

const PART_YAW: Record<DevicePart, number> = { touch_pad: -0.12, volume_buttons: -1.5, ear_gel: 2.55 };
const PART_NUDGE: Record<DevicePart, [number, number, number]> = {
  touch_pad: [0, 0, 0.2],
  volume_buttons: [0.18, 0, 0],
  ear_gel: [0, 0, -0.22],
};

/** Ribbon sits further back than the device, so screen-space targets are scaled to its depth. */
const atRibbonDepth = (v: number) => (v * (CAM_Z - RIBBON_Z)) / CAM_Z;

function computeLayout(W: number, H: number, compact: boolean, unitLength: number) {
  if (!compact) {
    const heroScale = Math.min(0.235 * W, 0.5 * H);
    const stationScale = 1.05 * H;
    const arcX = (0.17 - 0.5) * W;
    return {
      compact,
      markerGap: 0.25 * H,
      heroRibbon: {
        x: atRibbonDepth(0.255 * W),
        y: atRibbonDepth(-0.03 * H),
        scale: atRibbonDepth(heroScale),
        rotX: -0.16,
        rotY: -0.22,
        width: 0.6,
        readX: 0.96,
        readY: 0.28,
      } satisfies RibbonPose,
      stationRibbon: {
        x: atRibbonDepth(arcX) - atRibbonDepth(stationScale),
        y: atRibbonDepth(0.04 * H),
        scale: atRibbonDepth(stationScale),
        rotX: 0,
        rotY: 0,
        width: 0.62,
        readX: 0.2,
        readY: 0.98,
      } satisfies RibbonPose,
      heroDevice: { x: 0.255 * W, y: -0.02 * H, h: 0.5 * H, yaw: -0.5, rotX: 0.06, rotZ: -0.1 } satisfies DevicePose,
      stationDevices: [
        { x: 0.335 * W, y: 0, h: 0.56 * H, yaw: -1.0, rotX: 0.05, rotZ: -0.06 },
        { x: 0.42 * W, y: -1.0 * H, h: 0.4 * H, yaw: -0.6, rotX: 0.2, rotZ: 0.2 },
        { x: 0.3 * W, y: -0.04 * H, h: 0.58 * H, yaw: -0.35, rotX: 0.04, rotZ: -0.04 },
      ] satisfies DevicePose[],
      unitLength,
    };
  }
  const heroScale = Math.min(0.44 * W, 0.26 * H);
  const stationScale = 0.95 * H;
  const arcX = (0.12 - 0.5) * W;
  return {
    compact,
    markerGap: 0.2 * H,
    heroRibbon: {
      x: 0,
      y: atRibbonDepth(-0.28 * H),
      scale: atRibbonDepth(heroScale),
      rotX: -0.12,
      rotY: -0.16,
      width: 0.42,
      readX: 0.96,
      readY: 0.28,
    } satisfies RibbonPose,
    stationRibbon: {
      x: atRibbonDepth(arcX) - atRibbonDepth(stationScale),
      y: 0,
      scale: atRibbonDepth(stationScale),
      rotX: 0,
      rotY: 0,
      width: 0.44,
      readX: 0.2,
      readY: 0.98,
    } satisfies RibbonPose,
    heroDevice: { x: 0, y: -0.27 * H, h: 0.27 * H, yaw: -0.5, rotX: 0.06, rotZ: -0.1 } satisfies DevicePose,
    stationDevices: [
      { x: 0.11 * W, y: 0.22 * H, h: 0.3 * H, yaw: -1.0, rotX: 0.05, rotZ: -0.06 },
      { x: 0.11 * W, y: 1.0 * H, h: 0.26 * H, yaw: -0.6, rotX: -0.2, rotZ: 0.2 },
      { x: 0.11 * W, y: 0.22 * H, h: 0.33 * H, yaw: -0.35, rotX: 0.04, rotZ: -0.04 },
    ] satisfies DevicePose[],
    unitLength,
  };
}

function mixRibbon(a: RibbonPose, b: RibbonPose, t: number): RibbonPose {
  // Interpolate scale geometrically so the zoom feels even, and pivot on the right lobe's outer
  // edge (local x = scale) so the crossing slides away quickly instead of crossing the screen.
  const scale = Math.exp(lerp(Math.log(a.scale), Math.log(b.scale), t));
  return {
    x: lerp(a.x + a.scale, b.x + b.scale, t) - scale,
    y: lerp(a.y, b.y, t),
    scale,
    rotX: lerp(a.rotX, b.rotX, t),
    rotY: lerp(a.rotY, b.rotY, t),
    width: lerp(a.width, b.width, t),
    readX: lerp(a.readX, b.readX, t),
    readY: lerp(a.readY, b.readY, t),
  };
}

function mixDevice(a: DevicePose, b: DevicePose, t: number): DevicePose {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    h: lerp(a.h, b.h, t),
    yaw: lerp(a.yaw, b.yaw, t),
    rotX: lerp(a.rotX, b.rotX, t),
    rotZ: lerp(a.rotZ, b.rotZ, t),
  };
}

const vertexShader = /* glsl */ `
  attribute vec3 aCenter;
  attribute vec3 aWidthDir;
  attribute float aS;
  attribute float aV;
  uniform float uScale;
  uniform float uWidth;
  uniform float uDepth;
  varying float vS;
  varying float vV;
  varying float vX;
  varying vec3 vN;
  void main() {
    vec3 c = vec3(aCenter.xy * uScale, aCenter.z * uDepth);
    vec3 p = c + aWidthDir * (aV - 0.5) * uWidth;
    vS = aS * uScale;
    vV = aV;
    vX = aCenter.x;
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform sampler2D uInfo;
  uniform float uL;
  uniform float uSlot;
  uniform float uOffset;
  uniform float uN;
  uniform vec2 uReadDir;
  uniform vec3 uPaper;
  uniform vec3 uCobalt;
  uniform vec3 uInk;
  uniform vec3 uWhite;
  varying float vS;
  varying float vV;
  varying float vX;
  varying vec3 vN;

  void main() {
    // Which word slot this fragment belongs to, and where that slot's centre is on the loop.
    float sm = mod(vS - uOffset, uL);
    float k = floor(sm / uSlot);
    float local = fract(sm / uSlot);
    float complete = step((k + 1.0) * uSlot, uL); // the leftover sliver at the seam stays blank
    float sc = mod((k + 0.5) * uSlot + uOffset, uL);
    vec4 info = texture2D(uInfo, vec2(sc / uL, 0.5));

    // Keep every word upright: rotate the slot 180° when the ribbon runs against the reading direction,
    // and fade it while it turns so the flip is never seen.
    float d = dot(info.xy, uReadDir);
    vec2 tuv = vec2(local, vV);
    if (d < 0.0) tuv = 1.0 - tuv;
    float vis = smoothstep(0.05, 0.3, abs(d)) * complete;

    // Left lobe carries the original word, right lobe its English meaning.
    float slotSide = smoothstep(-0.05, 0.05, info.z);
    vec4 g = texture2D(uAtlas, vec2((mod(k, uN) + tuv.x) / uN, tuv.y));
    float glyph = mix(g.r, g.g, slotSide) * vis;

    float side = smoothstep(-0.06, 0.06, vX);
    vec3 band = mix(uPaper, uCobalt, side);
    vec3 ink = mix(uInk, uWhite, slotSide);

    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    float lit = 0.8 + 0.2 * max(dot(n, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);
    float edge = smoothstep(0.0, 0.05, min(vV, 1.0 - vV));
    vec3 col = band * mix(0.84, 1.0, edge);
    if (gl_FrontFacing) {
      col = mix(col, ink, glyph);
    } else {
      col *= 0.8;
    }
    gl_FragColor = vec4(col * lit, 1.0);
    #include <colorspace_fragment>
  }
`;

function buildRibbonGeometry() {
  const table = arcTable(LOBE_B);
  const L = table.length;
  const count = (SEGMENTS + 1) * 2;
  const position = new Float32Array(count * 3);
  const normal = new Float32Array(count * 3);
  const center = new Float32Array(count * 3);
  const widthDir = new Float32Array(count * 3);
  const sAttr = new Float32Array(count);
  const vAttr = new Float32Array(count);

  for (let i = 0; i <= SEGMENTS; i++) {
    const s = (i / SEGMENTS) * L;
    const p = table.at(s);
    // In-plane perpendicular (tangent rotated +90°) twisted gently around the tangent.
    const twist = 0.42 * Math.sin((s / L) * Math.PI * 2 * 3 + 0.6);
    const wx = -p.ty * Math.cos(twist);
    const wy = p.tx * Math.cos(twist);
    const wz = Math.sin(twist);
    // Face normal = tangent × width.
    const nx = p.ty * wz;
    const ny = -p.tx * wz;
    const nz = p.tx * wy - p.ty * wx;
    const z = Math.cos(p.u);
    for (let side = 0; side < 2; side++) {
      const j = i * 2 + side;
      const v = side;
      center.set([p.x, p.y, z], j * 3);
      widthDir.set([wx, wy, wz], j * 3);
      normal.set([nx, ny, nz], j * 3);
      position.set([p.x + wx * (v - 0.5) * 0.1, p.y + wy * (v - 0.5) * 0.1, z * STRAND_DEPTH], j * 3);
      sAttr[j] = s;
      vAttr[j] = v;
    }
  }
  const index: number[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    index.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(index);
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
  geometry.setAttribute("aCenter", new THREE.BufferAttribute(center, 3));
  geometry.setAttribute("aWidthDir", new THREE.BufferAttribute(widthDir, 3));
  geometry.setAttribute("aS", new THREE.BufferAttribute(sAttr, 1));
  geometry.setAttribute("aV", new THREE.BufferAttribute(vAttr, 1));

  // Per-position lookup for word slots: tangent (xy) and x, sampled along the unit loop.
  const infoSize = 1024;
  const info = new Float32Array(infoSize * 4);
  for (let i = 0; i < infoSize; i++) {
    const p = table.at(((i + 0.5) / infoSize) * L);
    info.set([p.tx, p.ty, p.x, 1], i * 4);
  }
  const infoTexture = new THREE.DataTexture(info, infoSize, 1, THREE.RGBAFormat, THREE.FloatType);
  infoTexture.minFilter = THREE.NearestFilter;
  infoTexture.magFilter = THREE.NearestFilter;
  infoTexture.wrapS = THREE.RepeatWrapping;
  infoTexture.needsUpdate = true;

  return { geometry, infoTexture, table, unitLength: L };
}

export async function createStoryScene(opts: Options): Promise<StoryScene> {
  const { canvas, reducedMotion } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.9;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  camera.position.set(0, 0, CAM_Z);

  const key = new THREE.DirectionalLight("#fff6ea", 1.5);
  key.position.set(-4, 7, 9);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#dbe4ff", 0.9);
  rim.position.set(6, 2, -6);
  scene.add(rim);

  // ── Ribbon ──
  const { geometry, infoTexture, table, unitLength } = buildRibbonGeometry();
  const atlasCanvas = await drawWordAtlas(RIBBON_PAIRS);
  const atlas = new THREE.CanvasTexture(atlasCanvas);
  atlas.colorSpace = THREE.NoColorSpace;
  atlas.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  atlas.minFilter = THREE.LinearMipmapLinearFilter;
  atlas.generateMipmaps = true;

  const uniforms = {
    uScale: { value: 1 },
    uWidth: { value: 0.6 },
    uDepth: { value: STRAND_DEPTH },
    uAtlas: { value: atlas },
    uInfo: { value: infoTexture },
    uL: { value: unitLength },
    uSlot: { value: 0.6 * SLOT_ASPECT },
    uOffset: { value: 0 },
    uN: { value: RIBBON_PAIRS.length },
    uReadDir: { value: new THREE.Vector2(0.96, 0.28) },
    uPaper: { value: new THREE.Color(COLORS.paper) },
    uCobalt: { value: new THREE.Color(COLORS.cobalt) },
    uInk: { value: new THREE.Color(COLORS.ink) },
    uWhite: { value: new THREE.Color(COLORS.white) },
  };
  const ribbonMaterial = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const ribbonMesh = new THREE.Mesh(geometry, ribbonMaterial);
  ribbonMesh.frustumCulled = false;
  const ribbon = new THREE.Group();
  ribbon.position.z = RIBBON_Z;
  ribbon.add(ribbonMesh);
  scene.add(ribbon);

  // ── Device ──
  const deviceRig = new THREE.Group();
  const deviceSpin = new THREE.Group();
  deviceRig.add(deviceSpin);
  deviceRig.visible = false;
  scene.add(deviceRig);
  let deviceHeight = 5.78;
  const partMeshes = new Map<string, THREE.Mesh>();
  const partRest = new Map<string, THREE.Vector3>();
  const materials = {
    body_front: new THREE.MeshPhysicalMaterial({ color: "#ece9e2", roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.18 }),
    body_back: new THREE.MeshPhysicalMaterial({ color: "#262a33", roughness: 0.48, metalness: 0.1, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    ear_gel: new THREE.MeshPhysicalMaterial({ color: "#a9bacb", roughness: 0.55, metalness: 0 }),
    touch_pad: new THREE.MeshPhysicalMaterial({ color: "#b08a55", roughness: 0.32, metalness: 0.85 }),
    volume_buttons: new THREE.MeshPhysicalMaterial({ color: "#b08a55", roughness: 0.34, metalness: 0.85 }),
  } as const;
  // A highlighted part brightens in its own colour (no tint).
  for (const m of Object.values(materials)) {
    m.emissive = m.color.clone();
    m.emissiveIntensity = 0;
  }

  let disposed = false;
  let deviceAppear = 0;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    opts.modelUrl,
    (gltf) => {
      if (disposed) return;
      gltf.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const name = mesh.name as keyof typeof materials;
        mesh.material = materials[name] ?? materials.body_front;
        partMeshes.set(mesh.name, mesh);
        partRest.set(mesh.name, mesh.position.clone());
      });
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(centre);
      deviceHeight = size.y || deviceHeight;
      deviceSpin.add(gltf.scene);
      deviceRig.visible = true;
      opts.onDeviceReady?.();
    },
    undefined,
    () => {
      // The ribbon still tells the story without the model.
    },
  );

  // ── State ──
  let width = 1;
  let height = 1;
  let layout = computeLayout(16, 9, false, unitLength);
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const compact = width < 1024;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.75 : 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const H = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    layout = computeLayout(H * camera.aspect, H, compact, unitLength);
    if (!running) render(0);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  let introTarget = 0;
  let stationTarget = 0;
  let intro = 0;
  let station = 0;
  let pointerX = 0;
  let pointerY = 0;
  let px = 0;
  let py = 0;
  let highlight: DevicePart | null = null;
  const highlightAmount: Record<DevicePart, number> = { touch_pad: 0, volume_buttons: 0, ear_gel: 0 };
  let yaw = -0.5;
  let time = 0;
  let offset = 0;
  const markers: MarkerPoint[] = Array.from({ length: opts.markerCount }, () => ({ x: 0, y: 0 }));
  const tmp = new THREE.Vector3();

  function render(dt: number) {
    const damp = (rate: number) => 1 - Math.exp(-dt * rate);
    if (dt === 0) {
      intro = introTarget;
      station = stationTarget;
    } else {
      intro += (introTarget - intro) * damp(10);
      station += (stationTarget - station) * damp(10);
      px += (pointerX - px) * damp(3);
      py += (pointerY - py) * damp(3);
    }
    if (!reducedMotion) time += dt;

    // Ribbon pose: hero → station arc.
    const t = easeInOut(clamp01(intro));
    const rp = mixRibbon(layout.heroRibbon, layout.stationRibbon, t);
    ribbon.position.set(rp.x, rp.y + (reducedMotion ? 0 : Math.sin(time * 0.6) * 0.05 * (1 - t)), RIBBON_Z);
    ribbon.rotation.set(rp.rotX - py * 0.05 * (1 - t), rp.rotY + px * 0.08 * (1 - t), 0);
    ribbon.updateMatrixWorld();
    const L = unitLength * rp.scale;
    uniforms.uScale.value = rp.scale;
    uniforms.uWidth.value = rp.width;
    uniforms.uL.value = L;
    uniforms.uSlot.value = rp.width * SLOT_ASPECT;
    if (!reducedMotion) offset += dt * FLOW_SPEED;
    if (offset > L) offset -= L;
    uniforms.uOffset.value = offset;
    const rl = Math.hypot(rp.readX, rp.readY);
    uniforms.uReadDir.value.set(rp.readX / rl, rp.readY / rl);

    // Device pose: hero → stations (exits for the digital station).
    const i0 = Math.max(0, Math.min(1, Math.floor(station)));
    const f = clamp01(station - i0);
    const stationPose = mixDevice(layout.stationDevices[i0], layout.stationDevices[i0 + 1], easeInOut(f));
    const dp = mixDevice(layout.heroDevice, stationPose, t);
    const scale = dp.h / deviceHeight;
    if (deviceRig.visible) deviceAppear = reducedMotion ? 1 : deviceAppear + (1 - deviceAppear) * damp(3);
    const appear = easeInOut(clamp01(deviceAppear));
    const bob = reducedMotion ? 0 : Math.sin(time * 0.9) * 0.06 * dp.h;
    deviceRig.position.set(dp.x, dp.y + bob - (1 - appear) * 0.6, 0);
    deviceRig.scale.setScalar(scale * (0.9 + 0.1 * appear));

    // Yaw: hero follows the pointer; station 1 turns slowly; station 3 turns to the highlighted part.
    const physical = clamp01(1 - Math.abs(station - 2) * 1.5) * t;
    const turntable = reducedMotion ? 0 : Math.sin(time * 0.35) * 0.55;
    let yawTarget = dp.yaw + px * 0.35 * (1 - t) + turntable * t * (1 - physical);
    if (highlight && physical > 0.5) yawTarget = PART_YAW[highlight];
    yaw += (yawTarget - yaw) * (dt === 0 ? 1 : damp(4));
    deviceSpin.rotation.set(dp.rotX + py * 0.12 * (1 - t), yaw, dp.rotZ);

    for (const part of Object.keys(highlightAmount) as DevicePart[]) {
      const target = highlight === part && physical > 0.5 ? 1 : 0;
      highlightAmount[part] += (target - highlightAmount[part]) * (dt === 0 ? 1 : damp(6));
      const mesh = partMeshes.get(part);
      const rest = partRest.get(part);
      if (mesh && rest) {
        const [nx, ny, nz] = PART_NUDGE[part];
        const a = highlightAmount[part];
        mesh.position.set(rest.x + nx * a, rest.y + ny * a, rest.z + nz * a);
        (mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.3 * a;
      }
    }

    renderer.render(scene, camera);

    // Station markers ride the arc around the right extreme of the right lobe.
    const sExt = (unitLength / 4) * rp.scale;
    for (let i = 0; i < markers.length; i++) {
      const sWorld = sExt + (station - i) * layout.markerGap;
      const p = table.at(sWorld / rp.scale);
      tmp.set(p.x * rp.scale, p.y * rp.scale, Math.cos(p.u) * STRAND_DEPTH);
      ribbon.localToWorld(tmp);
      tmp.project(camera);
      markers[i].x = ((tmp.x + 1) / 2) * width;
      markers[i].y = ((1 - tmp.y) / 2) * height;
    }
    opts.onMarkers(markers, layout.compact, station, intro);
  }

  let running = false;
  let frame = 0;
  let last = 0;
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    render(dt);
    frame = requestAnimationFrame(tick);
  };

  resize();

  return {
    setTargets(nextIntro, nextStation) {
      introTarget = nextIntro;
      stationTarget = nextStation;
      if (!running) render(0);
    },
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    setHighlight(part) {
      highlight = part;
    },
    setRunning(next) {
      if (next === running || disposed) return;
      running = next;
      if (running) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frame);
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      geometry.dispose();
      ribbonMaterial.dispose();
      atlas.dispose();
      infoTexture.dispose();
      envTexture.dispose();
      pmrem.dispose();
      for (const m of Object.values(materials)) m.dispose();
      partMeshes.forEach((mesh) => mesh.geometry.dispose());
      renderer.dispose();
    },
  };
}
