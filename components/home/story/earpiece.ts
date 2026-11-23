import * as THREE from "three";

/**
 * Materials for the Voxlate v8 earpiece (mesh names match public/models/voxlate-earpiece.glb).
 *
 * The LED strip that outlines the touch panel is drawn as a light source, and the front shell next
 * to it picks up its colour through `_led_distance`, a per-vertex distance to the strip baked by
 * scripts/stl-to-glb.mjs. The strip can show two colours at once: colour B
 * fills it from the bottom of the stem up to `sweep`, so a mode change flows through the light.
 */

export type EarpiecePart = "shell_front" | "shell_back" | "touch_panel" | "led_strip" | "ear_gel" | "volume_buttons";

/** LED colours: bright enough to read as light on the paper background. */
export const LED_COLORS = {
  blue: "#3566ff",
  green: "#1ed47f",
} as const;

export type LedUniforms = {
  uLedA: { value: THREE.Color };
  uLedB: { value: THREE.Color };
  uSweep: { value: number };
  uLevel: { value: number };
  uLedY0: { value: number };
  uLedY1: { value: number };
};

/** Shared GLSL: LED colour at a model-space height, given the sweep. */
const LED_COLOR_GLSL = /* glsl */ `
  uniform vec3 uLedA;
  uniform vec3 uLedB;
  uniform float uSweep;
  uniform float uLevel;
  uniform float uLedY0;
  uniform float uLedY1;
  vec3 ledColorAt(float y) {
    float h = clamp((y - uLedY0) / max(uLedY1 - uLedY0, 1e-4), 0.0, 1.0);
    float edge = mix(-0.12, 1.12, uSweep);
    float b = 1.0 - smoothstep(edge - 0.1, edge + 0.1, h);
    return mix(uLedA, uLedB, b);
  }
`;

function createLedUniforms(): LedUniforms {
  return {
    uLedA: { value: new THREE.Color(LED_COLORS.blue) },
    uLedB: { value: new THREE.Color(LED_COLORS.blue) },
    uSweep: { value: 0 },
    uLevel: { value: 1 },
    uLedY0: { value: -2.3 },
    uLedY1: { value: 2.4 },
  };
}

/** The strip itself: unlit, hotter (whiter) where it faces you, deeper colour at grazing angles. */
function createLedMaterial(led: LedUniforms, mask: boolean) {
  return new THREE.ShaderMaterial({
    uniforms: { ...led, uToModel: { value: new THREE.Matrix4() } },
    vertexShader: /* glsl */ `
      uniform mat4 uToModel;
      varying vec3 vN;
      varying vec3 vView;
      varying float vY;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vView = -mv.xyz;
        vY = (uToModel * vec4(position, 1.0)).y;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      ${LED_COLOR_GLSL}
      varying vec3 vN;
      varying vec3 vView;
      varying float vY;
      void main() {
        vec3 c = ledColorAt(vY);
        ${
          mask
            ? "gl_FragColor = vec4(c * uLevel, 1.0);"
            : `float facing = abs(dot(normalize(vN), normalize(vView)));
        vec3 hot = mix(c, vec3(1.0), 0.5 * pow(facing, 3.0));
        // An unlit strip still reads as frosted plastic; lit, it is the brightest thing on the device.
        vec3 off = vec3(0.62, 0.64, 0.68);
        gl_FragColor = vec4(mix(off, mix(c, hot, 0.85), uLevel), 1.0);
        #include <colorspace_fragment>`
        }
      }
    `,
    toneMapped: false,
  });
}

/** Adds LED light spill to a lit material: tints the base colour and adds a little emission near the strip. */
function addLedSpill(material: THREE.MeshPhysicalMaterial, led: LedUniforms, tint: number, glow: number) {
  const toModel = { value: new THREE.Matrix4() };
  material.userData.toModel = toModel;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, led, { uToModel: toModel, uSpillTint: { value: tint }, uSpillGlow: { value: glow } });
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        attribute float _led_distance;
        uniform mat4 uToModel;
        varying float vLedD;
        varying float vLedY;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vLedD = _led_distance;
        vLedY = (uToModel * vec4(position, 1.0)).y;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        ${LED_COLOR_GLSL}
        uniform float uSpillTint;
        uniform float uSpillGlow;
        varying float vLedD;
        varying float vLedY;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float spill = pow(1.0 - clamp(vLedD, 0.0, 1.0), 3.0) * uLevel;
        vec3 ledC = ledColorAt(vLedY);
        diffuseColor.rgb = mix(diffuseColor.rgb, ledC, spill * uSpillTint);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += ledC * spill * uSpillGlow;`,
      );
  };
  material.customProgramCacheKey = () => `led-spill-${tint}-${glow}`;
}

export function createEarpieceMaterials() {
  const led = createLedUniforms();
  const materials = {
    // Warm white shell with a lacquered finish.
    shell_front: new THREE.MeshPhysicalMaterial({ color: "#ebe8e1", roughness: 0.32, metalness: 0.02, clearcoat: 1, clearcoatRoughness: 0.16 }),
    // Deep navy back half.
    shell_back: new THREE.MeshPhysicalMaterial({ color: "#141d31", roughness: 0.42, metalness: 0.08, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
    // Glossy dark-blue touch panel: deep colour under a mirror-like clear coat.
    touch_panel: new THREE.MeshPhysicalMaterial({
      color: "#0a1850",
      roughness: 0.1,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      ior: 1.6,
      envMapIntensity: 1.35,
    }),
    led_strip: createLedMaterial(led, false),
    ear_gel: new THREE.MeshPhysicalMaterial({ color: "#a3b2c4", roughness: 0.6, metalness: 0, sheen: 0.4, sheenRoughness: 0.6, sheenColor: "#dfe6f0" }),
    volume_buttons: new THREE.MeshPhysicalMaterial({ color: "#0d1a4d", roughness: 0.18, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }),
  };
  // The touch panel stays pure glossy blue: its CAD surface is made of long edge-to-edge triangles that
  // can't carry a smooth light field, and the halo already lights its rim.
  addLedSpill(materials.shell_front, led, 0.5, 0.55);

  // A highlighted part brightens in its own colour (no tint).
  const lit = [materials.shell_front, materials.shell_back, materials.touch_panel, materials.ear_gel, materials.volume_buttons];
  for (const m of lit) {
    m.emissive = m.color.clone();
    m.emissiveIntensity = 0;
  }

  const ledMask = createLedMaterial(led, true);
  const occluder = new THREE.ShaderMaterial({
    vertexShader: "void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "void main() { gl_FragColor = vec4(0.0); }",
  });

  return {
    materials,
    led,
    /** Used by the glow pass: the strip in flat LED colour, and everything else as a transparent occluder. */
    maskMaterials: { led: ledMask, occluder },
    /** Call once per loaded mesh so LED colours are computed in one shared model space. */
    bindMesh(mesh: THREE.Mesh) {
      const name = mesh.name as EarpiecePart;
      mesh.updateMatrix();
      const m = materials[name];
      if (!m) return;
      if (m instanceof THREE.ShaderMaterial) {
        m.uniforms.uToModel.value.copy(mesh.matrix);
        ledMask.uniforms.uToModel.value.copy(mesh.matrix);
        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrix);
        led.uLedY0.value = box.min.y;
        led.uLedY1.value = box.max.y;
      } else if (m.userData.toModel) {
        (m.userData.toModel as { value: THREE.Matrix4 }).value.copy(mesh.matrix);
      }
    },
    /** Colour A everywhere, colour B filling from the bottom of the stem up to `sweep` (0..1). */
    setLed(a: THREE.ColorRepresentation, b: THREE.ColorRepresentation, sweep: number, level = 1) {
      led.uLedA.value.set(a);
      led.uLedB.value.set(b);
      led.uSweep.value = sweep;
      led.uLevel.value = level;
    },
    dispose() {
      for (const m of Object.values(materials)) m.dispose();
      ledMask.dispose();
      occluder.dispose();
    },
  };
}

export type Earpiece = ReturnType<typeof createEarpieceMaterials>;
