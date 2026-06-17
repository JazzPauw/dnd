import React, { useEffect, useRef } from "react";

/**
 * SporeCanvas — animated drifting spores in the background.
 * Mouse movement subtly repels nearby spores.
 */
export default function SporeCanvas({ count = 70 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMove);

    const rand = (a, b) => a + Math.random() * (b - a);
    const spores = Array.from({ length: count }, () => ({
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      r: rand(0.6, 2.4),
      vx: rand(-0.12, 0.12),
      vy: rand(-0.35, -0.05),
      alpha: rand(0.12, 0.4),
      hue: rand(265, 295),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      for (const s of spores) {
        // mouse repulsion
        const dx = s.x - mx;
        const dy = s.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const f = (12000 - d2) / 12000;
          s.vx += (dx / Math.sqrt(d2 + 1)) * 0.04 * f;
          s.vy += (dy / Math.sqrt(d2 + 1)) * 0.04 * f;
        }
        s.x += s.vx;
        s.y += s.vy;
        // drift damping
        s.vx *= 0.985;
        s.vy *= 0.99;
        s.vy -= 0.005; // upward bias
        // wrap
        if (s.y < -10) { s.y = canvas.height + 10; s.x = rand(0, canvas.width); }
        if (s.x < -10) s.x = canvas.width + 10;
        if (s.x > canvas.width + 10) s.x = -10;

        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
        grd.addColorStop(0, `hsla(${s.hue}, 80%, 65%, ${s.alpha})`);
        grd.addColorStop(1, "hsla(280, 80%, 60%, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${s.hue}, 90%, 80%, ${Math.min(1, s.alpha + 0.2)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="spore-canvas no-print" data-testid="spore-canvas" />;
}
