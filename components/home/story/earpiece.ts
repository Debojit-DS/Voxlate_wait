import * as THREE from "three";

/** Materials for the Voxlate earpiece parts (names match the meshes in voxlate-earpiece.glb). */
export function createEarpieceMaterials() {
  const materials = {
    body_front: new THREE.MeshPhysicalMaterial({ color: "#ece9e2", roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.18 }),
    body_back: new THREE.MeshPhysicalMaterial({ color: "#172238", roughness: 0.46, metalness: 0.1, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    ear_gel: new THREE.MeshPhysicalMaterial({ color: "#a9bacb", roughness: 0.55, metalness: 0 }),
    // Anodised royal blue for the touch pad and keys (the site's primary).
    touch_pad: new THREE.MeshPhysicalMaterial({ color: "#1f3fb8", roughness: 0.3, metalness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    volume_buttons: new THREE.MeshPhysicalMaterial({ color: "#1f3fb8", roughness: 0.32, metalness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
  };
  // A highlighted part brightens in its own colour (no tint).
  for (const m of Object.values(materials)) {
    m.emissive = m.color.clone();
    m.emissiveIntensity = 0;
  }
  return materials;
}

export type EarpieceMaterials = ReturnType<typeof createEarpieceMaterials>;
