/**
 * LaserEffect - Beam burst laser animations for keypresses
 * Only fires during active gameplay (not menu, pause, game over, or trivia)
 */
import { useEffect, useRef } from 'react';
import { getAudioManager } from '../utils/audioManager';
import { getLaserTarget } from './LaserTargetHelper';
import { useGameStore } from '../store/gameContext';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<BeamBurst[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const { mode, isPaused, isGameOver } = useGameStore();

  // Store active-gameplay flag in a ref so the keydown listener always has current value
  const canFireRef = useRef(false);
  canFireRef.current =
    (mode === 'normal' || mode === 'programming') && !isPaused && !isGameOver;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop — only runs while there are active beams
    let running = false;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      beamsRef.current = beamsRef.current.filter((beam) => {
        beam.life -= 1;
        beam.opacity -= 0.033;

        if (beam.life <= 0 || beam.opacity <= 0) return false;

        const currentX = beam.targetX;
        const currentY = beam.targetY;

        ctx.save();

        // Outer glow
        ctx.globalAlpha = beam.opacity * 0.3;
        ctx.shadowBlur = 40;
        ctx.shadowColor = beam.color;
        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = beam.width * 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Middle beam
        ctx.globalAlpha = beam.opacity * 0.6;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = beam.width;
        ctx.stroke();

        // Core beam
        ctx.globalAlpha = beam.opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = beam.width * 0.4;
        ctx.stroke();

        // Particles
        beam.particles.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.opacity -= 0.02;
          particle.life -= 1;

          if (particle.life > 0 && particle.opacity > 0) {
            ctx.globalAlpha = particle.opacity;
            ctx.shadowBlur = 10;
            ctx.shadowColor = beam.color;
            ctx.fillStyle = beam.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        beam.particles = beam.particles.filter(p => p.life > 0 && p.opacity > 0);
        ctx.restore();
        return true;
      });

      if (beamsRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        running = false;
        animationFrameRef.current = null;
      }
    };

    const startLoop = () => {
      if (!running) {
        running = true;
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Key handler — gated by canFireRef
    const audioManager = getAudioManager();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!canFireRef.current) return;
      if (e.key.length !== 1) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      audioManager.playLaser();

      let targetX = canvas.width / 2;
      let targetY = canvas.height * 0.3;
      const target = getLaserTarget();
      if (target) {
        targetX = target.x;
        targetY = target.y;
      }

      const wingOffsetX = 40;
      const playerY = canvas.height - 120;
      const useLeftWing = Math.random() > 0.5;
      const startX = canvas.width / 2 + (useLeftWing ? -wingOffsetX : wingOffsetX);
      const startY = playerY;

      const particles: Particle[] = [];
      for (let i = 0; i < 12; i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 0.8 - Math.PI / 2;
        const speed = 3 + Math.random() * 5;
        particles.push({
          x: targetX, y: targetY,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3, opacity: 1, life: 30 + Math.random() * 20,
        });
      }

      beamsRef.current.push({
        x: startX, y: startY,
        targetX, targetY,
        progress: 0,
        width: 8 + Math.random() * 4,
        opacity: 1, life: 30,
        color: '#09ff00', particles,
      });

      startLoop();
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyPress);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    />
  );
}
