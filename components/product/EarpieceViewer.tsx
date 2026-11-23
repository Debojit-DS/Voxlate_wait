"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** The real Voxlate earpiece (from the CAD model) on a slow turntable; drag to turn it. */
export function EarpieceViewer({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const [{ GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }, { createEarpieceMaterials }] = await Promise.all([
        import("three/addons/loaders/GLTFLoader.js"),
        import("three/addons/libs/meshopt_decoder.module.js"),
        import("three/addons/environments/RoomEnvironment.js"),
        import("@/components/home/story/earpiece"),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.NeutralToneMapping;
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.9;
      const key = new THREE.DirectionalLight("#fff6ea", 1.5);
      key.position.set(-4, 7, 9);
      scene.add(key);
      const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
      camera.position.set(0, 0, 16);

      const spin = new THREE.Group();
      scene.add(spin);
      const materials = createEarpieceMaterials();
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load("/models/voxlate-earpiece.glb", (gltf) => {
        if (disposed) return;
        gltf.scene.traverse((obj) => {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          if (mesh.isMesh) mesh.material = materials[mesh.name as keyof typeof materials] ?? materials.body_front;
        });
        const box = new THREE.Box3().setFromObject(gltf.scene);
        gltf.scene.position.sub(box.getCenter(new THREE.Vector3()));
        spin.add(gltf.scene);
        setReady(true);
      });

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      resize();

      // Drag to turn; it keeps a little momentum, then the turntable takes over again.
      let yaw = -0.6;
      let velocity = 0;
      let dragging = false;
      let lastX = 0;
      const down = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        canvas.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        velocity = (e.clientX - lastX) * 0.012;
        yaw += velocity;
        lastX = e.clientX;
      };
      const up = () => (dragging = false);
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);

      let frame = 0;
      let last = performance.now();
      let t = 0;
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        t += dt;
        if (!dragging) {
          velocity *= Math.exp(-dt * 3);
          yaw += velocity + (reduced ? 0 : dt * 0.35);
        }
        spin.rotation.set(0.05, yaw, -0.06);
        spin.position.y = reduced ? 0 : Math.sin(t * 0.9) * 0.08;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(frame);
        if (entry.isIntersecting) {
          last = performance.now();
          frame = requestAnimationFrame(tick);
        }
      });
      io.observe(canvas);

      cleanup = () => {
        cancelAnimationFrame(frame);
        io.disconnect();
        ro.disconnect();
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        Object.values(materials).forEach((m) => m.dispose());
        pmrem.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduced]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
        aria-label="3D model of the Voxlate earpiece. Drag to rotate."
        role="img"
      />
      {!ready && <span className="absolute inset-0 m-auto h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" aria-hidden="true" />}
    </div>
  );
}
