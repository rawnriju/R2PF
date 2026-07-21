import { useEffect, useRef } from "react";

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
}

interface Props {
  sharedBallsRef: React.MutableRefObject<Ball[]>;
}

export function PlaygroundCanvas({ sharedBallsRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef<{ x: number; y: number; r: number; alpha: number }[]>([]);
  const mouseRef = useRef<{ x: number; y: number; down: boolean }>({ x: 0, y: 0, down: false });
  const holdTimerRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const spawnBall = (x: number, y: number) => {
      const orange = Math.random() > 0.6;
      sharedBallsRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 14,
        vy: -8 - Math.random() * 8,
        r: 5 + Math.random() * 9,
        color: orange ? "#FF5500" : "#FFE100",
        life: 1,
      });
      if (sharedBallsRef.current.length > 60) sharedBallsRef.current.shift();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      mouseRef.current = { x, y, down: true };
      // Spawn immediately on press — feels instant
      spawnBall(x, y);
      spawnBall(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10);
    };

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      mouseRef.current.x = x;
      mouseRef.current.y = y;
    };

    const onMouseUp = () => {
      mouseRef.current.down = false;
      clearInterval(holdTimerRef.current);
    };

    const reset = (e: MouseEvent) => {
      e.preventDefault();
      const { x, y } = getPos(e);
      pulseRef.current.push({ x, y, r: 0, alpha: 1 });
      sharedBallsRef.current = [];
    };

    // Continuous fire while holding mouse button
    holdTimerRef.current = window.setInterval(() => {
      if (mouseRef.current.down) {
        spawnBall(
          mouseRef.current.x + (Math.random() - 0.5) * 8,
          mouseRef.current.y + (Math.random() - 0.5) * 8
        );
      }
    }, 80);

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("contextmenu", reset);
    window.addEventListener("mouseup", onMouseUp);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // chakra reset pulses
      pulseRef.current = pulseRef.current.filter((p) => p.alpha > 0.02);
      for (const p of pulseRef.current) {
        p.r += 14;
        p.alpha *= 0.92;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,225,0,${p.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // balls
      for (const b of sharedBallsRef.current) {
        b.vy += 0.35;
        b.x += b.vx;
        b.y += b.vy;
        if (b.y + b.r > rect.height) {
          b.y = rect.height - b.r;
          b.vy *= -0.72;
          b.vx *= 0.96;
        }
        if (b.x - b.r < 0) { b.x = b.r; b.vx *= -0.8; }
        if (b.x + b.r > rect.width) { b.x = rect.width - b.r; b.vx *= -0.8; }

        ctx.save();
        ctx.shadowBlur = 24;
        ctx.shadowColor = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(holdTimerRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("contextmenu", reset);
    };
  }, [sharedBallsRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 size-full cursor-crosshair"
      aria-label="Interactive physics playground"
    />
  );
}
