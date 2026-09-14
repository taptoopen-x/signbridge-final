import { useEffect, useRef } from 'react';
import type { LandmarkPoint } from '../../types';

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

interface LandmarkOverlayProps {
  landmarks: LandmarkPoint[] | null;
  width: number;
  height: number;
}

export default function LandmarkOverlay({
  landmarks,
  width,
  height,
}: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks) return;

    // Draw each detected hand separately
    for (let start = 0; start < landmarks.length; start += 21) {
      const hand = landmarks.slice(start, start + 21);

      if (hand.length < 21) continue;

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(61, 218, 215, 0.85)';
      ctx.lineWidth = 2.5;

      for (const [a, b] of CONNECTIONS) {
        const p1 = hand[a];
        const p2 = hand[b];

        if (!p1 || !p2) continue;

        ctx.beginPath();
        ctx.moveTo(
          p1.x * canvas.width,
          p1.y * canvas.height
        );
        ctx.lineTo(
          p2.x * canvas.width,
          p2.y * canvas.height
        );
        ctx.stroke();
      }

      // Draw landmark dots
      hand.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(
          p.x * canvas.width,
          p.y * canvas.height,
          i === 0 ? 5 : 3.5,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = i === 0 ? '#FF6B5D' : '#5FEFEC';
        ctx.fill();
      });
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}