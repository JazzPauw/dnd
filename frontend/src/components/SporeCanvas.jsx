import React, { useEffect, useRef } from "react";

/**
 * SporeCanvas — animated drifting spores in the background.
 * Mouse movement subtly repels nearby spores.
 */
export default function SporeCanvas({ count = 70, effect = "spore", color = "#9d4cdd" }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;

    // Effect tuning per D&D class theme
    const cfg = ({
      spore:  { hue: [265,295], dy: -0.05, soft: 1.0, fast: false },
      leaf:   { hue: [85,130],  dy:  0.04, soft: 0.7, fast: false },
      rune:   { hue: [200,230], dy: -0.02, soft: 1.2, fast: false },
      ember:  { hue: [10,35],   dy: -0.12, soft: 0.8, fast: true  },
      wisp:   { hue: [275,305], dy: -0.08, soft: 1.4, fast: false },
      mote:   { hue: [45,60],   dy: -0.03, soft: 1.3, fast: false },
      halo:   { hue: [40,55],   dy: -0.04, soft: 1.1, fast: false },
      spark:  { hue: [15,30],   dy: -0.18, soft: 0.5, fast: true  },
      blood:  { hue: [355,10],  dy:  0.10, soft: 0.7, fast: true  },
      note:   { hue: [310,340], dy: -0.05, soft: 1.0, fast: false },
      shadow: { hue: [160,185], dy:  0.0,  soft: 0.4, fast: true  },
      ki:     { hue: [175,200], dy: -0.04, soft: 1.3, fast: false },
      gear:   { hue: [35,50],   dy:  0.0,  soft: 0.6, fast: false },
    }[effect]) || { hue: [265,295], dy: -0.05, soft: 1.0, fast: false };

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
      r: rand(0.6, 2.4) * cfg.soft,
      vx: rand(-0.12, 0.12) * (cfg.fast ? 1.8 : 1),
      vy: rand(-0.35, -0.05) * (cfg.fast ? 1.6 : 1),
      alpha: rand(0.12, 0.4),
      hue: rand(cfg.hue[0], cfg.hue[1]),
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
        s.vy -= cfg.dy * 0.1; // theme-specific drift
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
  }, [count, effect, color]);

  return <canvas ref={canvasRef} className="spore-canvas no-print" data-testid="spore-canvas" />;
}
