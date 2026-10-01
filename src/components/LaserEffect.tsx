/**
 * LaserEffect - Beam burst laser animations for keypresses
 * Only fires during active gameplay (not menu, pause, game over, or trivia)
 */
import { useEffect, useRef } from "react";
import { getAudioManager } from "../utils/audioManager";
import { getLaserTarget } from "./LaserTargetHelper";
import { useGameStore } from "../store/gameContext";
import { GameMode } from "../types";

const TUNING = {
  outerGlowAlpha: 0.3,
  middleBeamAlpha: 0.6,
  coreWidthRatio: 0.4,
  defaultTargetHeightRatio: 0.3,
  playerBottomOffsetPx: 120,
  particleCount: 12,
  particleSpreadRadiansRatio: 0.8,
  minimumParticleSpeed: 3,
  particleSpeedRange: 5,
  particleSizeRange: 3,
  minimumParticleLifeFrames: 30,
  particleLifeRangeFrames: 20,
  minimumBeamWidthPx: 8,
  beamWidthRangePx: 4,
} as const;

interface BeamBurst {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  width: number;
  opacity: number;
  life: number;
  color: string;
  particles: Particle[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
}

export function LaserEffect() {
  const canvasReference = useRef<HTMLCanvasElement>(null);
  const beamsReference = useRef<BeamBurst[]>([]);
  const animationFrameReference = useRef<number | null>(null);
  const { mode, isPaused, isGameOver } = useGameStore();

  const canFire =
    (mode === GameMode.NORMAL || mode === GameMode.PROGRAMMING) &&
    !isPaused &&
    !isGameOver;

  useEffect(() => {
    const canvas = canvasReference.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(document.documentElement);

    // Animation loop — only runs while there are active beams
    let isRunning = false;

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      beamsReference.current = beamsReference.current.filter((beam) => {
        beam.life -= 1;
        beam.opacity -= 0.033;

        if (beam.life <= 0 || beam.opacity <= 0) return false;

        const currentX = beam.targetX;
        const currentY = beam.targetY;

        context.save();

        // Outer glow
        context.globalAlpha = beam.opacity * TUNING.outerGlowAlpha;
        context.shadowBlur = 40;
        context.shadowColor = beam.color;
        context.beginPath();
        context.moveTo(beam.x, beam.y);
        context.lineTo(currentX, currentY);
        context.strokeStyle = beam.color;
        context.lineWidth = beam.width * 2;
        context.lineCap = "round";
        context.stroke();

        // Middle beam
        context.globalAlpha = beam.opacity * TUNING.middleBeamAlpha;
        context.shadowBlur = 25;
        context.beginPath();
        context.moveTo(beam.x, beam.y);
        context.lineTo(currentX, currentY);
        context.strokeStyle = beam.color;
        context.lineWidth = beam.width;
        context.stroke();

        // Core beam
        context.globalAlpha = beam.opacity;
        context.shadowBlur = 15;
        context.shadowColor = "#ffffff";
        context.beginPath();
        context.moveTo(beam.x, beam.y);
        context.lineTo(currentX, currentY);
        context.strokeStyle = "#ffffff";
        context.lineWidth = beam.width * TUNING.coreWidthRatio;
        context.stroke();

        // Particles
        for (const particle of beam.particles) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.opacity -= 0.02;
          particle.life -= 1;

          if (particle.life > 0 && particle.opacity > 0) {
            context.globalAlpha = particle.opacity;
            context.shadowBlur = 10;
            context.shadowColor = beam.color;
            context.fillStyle = beam.color;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
          }
        }

        beam.particles = beam.particles.filter(
          (p) => p.life > 0 && p.opacity > 0,
        );
        context.restore();
        return true;
      });

      if (beamsReference.current.length > 0) {
        animationFrameReference.current = requestAnimationFrame(animate);
      } else {
        isRunning = false;
        animationFrameReference.current = null;
      }
    };

    const startLoop = () => {
      if (isRunning) {
        return;
      }

      isRunning = true;
      animationFrameReference.current = requestAnimationFrame(animate);
    };

    // Key handler — gated by active gameplay state
    const audioManager = getAudioManager();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!canFire) return;
      if (e.key.length !== 1) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      audioManager.playLaser();

      let targetX = canvas.width / 2;
      let targetY = canvas.height * TUNING.defaultTargetHeightRatio;
      const target = getLaserTarget();
      if (target) {
        targetX = target.x;
        targetY = target.y;
      }

      const wingOffsetX = 40;
      const playerY = canvas.height - TUNING.playerBottomOffsetPx;
      const isUseLeftWing = Math.random() > 0.5;
      const startX =
        canvas.width / 2 + (isUseLeftWing ? -wingOffsetX : wingOffsetX);
      const startY = playerY;

      const particles: Particle[] = [];
      for (let index = 0; index < TUNING.particleCount; index++) {
        const angle =
          (Math.random() - 0.5) * Math.PI * TUNING.particleSpreadRadiansRatio -
          Math.PI / 2;
        const speed =
          TUNING.minimumParticleSpeed +
          Math.random() * TUNING.particleSpeedRange;
        particles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * TUNING.particleSizeRange,
          opacity: 1,
          life:
            TUNING.minimumParticleLifeFrames +
            Math.random() * TUNING.particleLifeRangeFrames,
        });
      }

      beamsReference.current.push({
        x: startX,
        y: startY,
        targetX,
        targetY,
        progress: 0,
        width:
          TUNING.minimumBeamWidthPx + Math.random() * TUNING.beamWidthRangePx,
        opacity: 1,
        life: 30,
        color: "#09ff00",
        particles,
      });

      startLoop();
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("keydown", handleKeyPress);
      if (animationFrameReference.current)
        cancelAnimationFrame(animationFrameReference.current);
    };
  }, [canFire]);

  return (
    <canvas
      ref={canvasReference}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        pointerEvents: "none",
        background: "transparent",
      }}
    />
  );
}
