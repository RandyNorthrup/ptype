/**
 * LaserEffect - Beam burst laser animations for keypresses
 */
import { useEffect, useRef } from 'react';
import { getAudioManager } from '../utils/audioManager';
import { laserTargetPosition } from './LaserTargetHelper';
import { error as logError } from '../utils/logger';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      logError('LaserEffect canvas ref is null', new Error('Canvas not found'), 'LaserEffect');
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      logError('Failed to get 2D context for laser canvas', new Error('Context unavailable'), 'LaserEffect');
      return;
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas completely (no dark overlay)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw beam bursts
      beamsRef.current = beamsRef.current.filter((beam) => {
        beam.life -= 1;
        beam.opacity -= 0.033; // Faster fade for instant beam

        if (beam.life <= 0 || beam.opacity <= 0) {
          return false;
        }

        // Instant beam - light travels instantly to target
        const currentX = beam.targetX;
        const currentY = beam.targetY;

        ctx.save();

        // Draw expanding beam burst
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

        // Core beam (brightest)
        ctx.globalAlpha = beam.opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        
        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = beam.width * 0.4;
        ctx.stroke();

        // Draw burst particles
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

        // Filter out dead particles
        beam.particles = beam.particles.filter(p => p.life > 0 && p.opacity > 0);

        ctx.restore();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Expose method to trigger beam burst effect
  useEffect(() => {
    const audioManager = getAudioManager();
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger for alphanumeric keys (actual typing)
      if (e.key.length !== 1) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return; // Ignore modifier combos
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Play laser sound on every keypress
      audioManager.playLaser();

      // Get target position from LaserTargetHelper
      let targetX = canvas.width / 2;
      let targetY = canvas.height * 0.3;
      
      if (laserTargetPosition) {
        targetX = laserTargetPosition.x;
        targetY = laserTargetPosition.y;
      }

      // Player ship wings are at fixed positions (left and right)
      const wingOffsetX = 40; // Distance from center to each wing
      const playerY = canvas.height - 120; // Fixed player Y position
      
      // Alternate between left and right wing
      const useLeftWing = Math.random() > 0.5;
      const startX = canvas.width / 2 + (useLeftWing ? -wingOffsetX : wingOffsetX);
      const startY = playerY;

      // Create burst particles at impact point
      const particles: Particle[] = [];
      for (let i = 0; i < 12; i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 0.8 - Math.PI / 2;
        const speed = 3 + Math.random() * 5;
        particles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          opacity: 1,
          life: 30 + Math.random() * 20,
        });
      }

      const beam: BeamBurst = {
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        progress: 0,
        width: 8 + Math.random() * 4,
        opacity: 1,
        life: 30, // Match Python: 30 frames = 0.5 seconds at 60 FPS
        color: '#09ff00',
        particles: particles,
      };

      beamsRef.current.push(beam);
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

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
