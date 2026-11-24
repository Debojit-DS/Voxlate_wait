"use client";

import { useCallback, useRef, type RefObject } from "react";
import type { DeviceRect, StoryScene } from "./scene";

/**
 * An invisible box that follows the 3D earpiece on screen and lets the visitor turn it all the way
 * round: drag with a mouse (sideways spins it, up and down tips it), swipe sideways on a touch
 * screen (up and down still scrolls the page), or use the arrow keys.
 */
export function useDeviceHandle() {
  const handleRef = useRef<HTMLDivElement>(null);
  /** Pass to the scene's `onDevice`: places the box over the device every frame, without React renders. */
  const placeHandle = useCallback((rect: DeviceRect | null) => {
    const el = handleRef.current;
    if (!el) return;
    if (!rect) {
      el.style.display = "none";
      return;
    }
    el.style.display = "block";
    el.style.width = `${rect.w.toFixed(0)}px`;
    el.style.height = `${rect.h.toFixed(0)}px`;
    el.style.transform = `translate3d(${(rect.x - rect.w / 2).toFixed(1)}px, ${(rect.y - rect.h / 2).toFixed(1)}px, 0)`;
  }, []);
  return { handleRef, placeHandle };
}

export function DeviceHandle({ handleRef, sceneRef }: { handleRef: RefObject<HTMLDivElement | null>; sceneRef: RefObject<StoryScene | null> }) {
  const last = useRef<{ x: number; y: number; touch: boolean } | null>(null);

  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!last.current) return;
    last.current = null;
    sceneRef.current?.dragEnd();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const turn = (dx: number, dy: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.dragStart();
    scene.dragBy(dx, dy);
    scene.dragEnd(false);
  };

  return (
    <div
      ref={handleRef}
      tabIndex={0}
      role="img"
      aria-label="3D model of the Voxlate earpiece. Drag, or use the arrow keys, to turn it all the way round."
      className="vx-device-handle absolute left-0 top-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
      style={{ display: "none" }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        last.current = { x: e.clientX, y: e.clientY, touch: e.pointerType !== "mouse" };
        sceneRef.current?.dragStart();
      }}
      onPointerMove={(e) => {
        const prev = last.current;
        if (!prev) return;
        // On touch screens only sideways swipes turn it; up and down belongs to scrolling.
        sceneRef.current?.dragBy(e.clientX - prev.x, prev.touch ? 0 : e.clientY - prev.y);
        last.current = { ...prev, x: e.clientX, y: e.clientY };
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(e) => {
        const step = { ArrowLeft: [-44, 0], ArrowRight: [44, 0], ArrowUp: [0, -32], ArrowDown: [0, 32] }[e.key];
        if (!step) return;
        e.preventDefault();
        turn(step[0], step[1]);
      }}
    >
      <span className="vx-device-hint" aria-hidden="true">
        Drag to turn
      </span>
    </div>
  );
}
