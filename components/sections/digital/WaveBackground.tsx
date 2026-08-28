"use client";

import { useEffect, useRef } from "react";

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const particles: Array<{
      x: number;
      y: number;
      baseY: number;
      speed: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      particles.length = 0;
      const count = Math.floor(width / 12);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const x = t * width;
        const centerX = width / 2;
        const distFromCenter = Math.abs(x - centerX) / (width / 2);
        const converge = 1 - distFromCenter * 0.7;
        const baseY =
          height / 2 +
          Math.sin(t * Math.PI * 3) * height * 0.15 * converge +
          Math.cos(t * Math.PI * 5) * height * 0.08 * converge;

        particles.push({
          x,
          y: baseY,
          baseY,
          speed: 0.3 + Math.random() * 0.7,
          size: 0.8 + Math.random() * 2,
          opacity: 0.4 + Math.random() * 0.6,
          color: Math.random() > 0.5 ? "#60A5FA" : "#A78BFA",
        });
      }
    };

    const drawWave = (
      amplitude: number,
      frequency: number,
      phase: number,
      color: string | CanvasGradient,
      opacity: number,
      lineWidth: number,
      glow: number,
      yOffset: number = 0
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color as unknown as string;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = glow;
      ctx.shadowColor = color as unknown as string;

      const centerX = width / 2;
      const centerY = height / 2 + yOffset;

      for (let x = 0; x <= width; x += 2) {
        const normalizedX = x / width;
        const distFromCenter = Math.abs(normalizedX - 0.5) * 2;
        const converge = 1 - distFromCenter * 0.6;

        const wave =
          Math.sin(normalizedX * Math.PI * frequency + phase) * amplitude * converge;
        const secondaryWave =
          Math.cos(normalizedX * Math.PI * (frequency * 0.5) + phase * 1.3) *
          amplitude *
          0.3 *
          converge;
        const tertiaryWave =
          Math.sin(normalizedX * Math.PI * (frequency * 2) + phase * 0.7) *
          amplitude *
          0.15 *
          converge;

        const y = centerY + wave + secondaryWave + tertiaryWave;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const drawParticles = () => {
      const centerX = width / 2;
      particles.forEach((p, i) => {
        p.y = p.baseY + Math.sin(time * 0.02 + i * 0.1) * 3;
        p.x += p.speed * 0.3;
        if (p.x > width) {
          p.x = 0;
        }

        const distFromCenter = Math.abs(p.x - centerX) / (width / 2);
        const glowIntensity = 1 - distFromCenter;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * glowIntensity;
        ctx.shadowBlur = 12 * glowIntensity;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < 8; i++) {
        const amplitude = 20 + i * 8;
        const frequency = 2 + i * 0.8;
        const phase = time + i * 0.5;
        const opacity = 0.18 + (7 - i) * 0.06;
        const lineWidth = 0.6 + (7 - i) * 0.18;
        const glow = 8 + (7 - i) * 4;
        const yOffset = (i - 3.5) * 6;

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(96, 165, 250, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(34, 211, 238, ${opacity * 1.2})`);
        gradient.addColorStop(1, `rgba(167, 139, 250, ${opacity})`);

        drawWave(amplitude, frequency, phase, gradient, opacity, lineWidth, glow, yOffset);
      }

      drawParticles();

      animationId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    const handleResize = () => {
      resize();
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 1 }}
        aria-hidden="true"
      />
    );
}
