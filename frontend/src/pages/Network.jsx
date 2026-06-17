import React, { useEffect, useMemo, useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import PageHeader from "@/components/PageHeader";
import { useCharacter } from "@/contexts/CharacterContext";
import { memories, creatures, dreams, fungi, recipes, deaths } from "@/lib/api";

/**
 * The Network — interactive graph linking entities by shared
 * tokens (location, character name, ingredients). It's a living mind.
 */
export default function Network() {
  const { current } = useCharacter();
  const [data, setData] = useState({ nodes: [], links: [] });
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setSize({ w: r.width, h: Math.max(500, window.innerHeight - 220) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    (async () => {
      if (!current) return;
      const [M, C, D, F, R, X] = await Promise.all([
        memories.list({ character_id: current.id }),
        creatures.list({ character_id: current.id }),
        dreams.list({ character_id: current.id }),
        fungi.list({ character_id: current.id }),
        recipes.list({ character_id: current.id }),
        deaths.list({ character_id: current.id }),
      ]);
      const nodes = [];
      const links = [];
      const COLORS = { memory: "#9d4cdd", creature: "#c75c5c", dream: "#7ec8e3", fungus: "#7a8b6a", recipe: "#d4a373", death: "#b47ee5" };
      const add = (group, items, labelKey) => items.forEach((it) => {
        nodes.push({ id: `${group}:${it.id}`, name: it[labelKey] || group, group, color: COLORS[group], val: 4 + (it.significance || 1) });
      });
      add("memory", M, "title");
      add("creature", C, "name");
      add("dream", D, "title");
      add("fungus", F, "name");
      add("recipe", R, "name");
      add("death", X, "name");

      // build naive token-based links
      const tokensOf = (it) => `${it.title||""} ${it.name||""} ${it.location||""} ${it.habitat||""} ${it.characters||""} ${it.relationship||""} ${it.ingredients||""} ${it.description||""}`.toLowerCase();
      const all = [
        ...M.map((x) => ({ id: `memory:${x.id}`, t: tokensOf(x) })),
        ...C.map((x) => ({ id: `creature:${x.id}`, t: tokensOf(x) })),
        ...D.map((x) => ({ id: `dream:${x.id}`, t: tokensOf(x) })),
        ...F.map((x) => ({ id: `fungus:${x.id}`, t: tokensOf(x) })),
        ...R.map((x) => ({ id: `recipe:${x.id}`, t: tokensOf(x) })),
        ...X.map((x) => ({ id: `death:${x.id}`, t: tokensOf(x) })),
      ];
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const a = all[i], b = all[j];
          const wordsA = new Set(a.t.split(/\W+/).filter((w) => w.length > 4));
          const shared = [...wordsA].filter((w) => b.t.includes(w));
          if (shared.length >= 1) links.push({ source: a.id, target: b.id, value: shared.length });
        }
      }
      setData({ nodes, links });
    })();
  }, [current?.id]);

  if (!current) return null;
  return (
    <div data-testid="network-page">
      <PageHeader title="The Network" subtitle="Every memory, every creature, every fungus — bound by spore-threads." />
      <div ref={containerRef} className="organic-card" style={{ padding: 0, height: size.h, overflow: "hidden" }} data-testid="network-graph">
        <ForceGraph2D
          graphData={data}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          nodeLabel={(n) => `${n.group}: ${n.name}`}
          linkColor={() => "rgba(157,76,221,0.25)"}
          linkWidth={(l) => Math.min(2, (l.value || 1) * 0.4)}
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={() => "#b47ee5"}
          nodeCanvasObject={(node, ctx, scale) => {
            if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
            const r = (node.val || 4);
            const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
            grd.addColorStop(0, node.color);
            grd.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = node.color;
            ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2); ctx.fill();
            if (scale > 1.4) {
              ctx.fillStyle = "rgba(228,220,211,0.9)";
              ctx.font = `${10 / scale + 6}px 'Cormorant Garamond', serif`;
              ctx.textAlign = "center";
              ctx.fillText(node.name?.slice(0, 24) || "", node.x, node.y + r * 2.6);
            }
          }}
        />
      </div>
      <p className="text-xs italic text-[var(--text-tertiary)] mt-3">drag to move · scroll to zoom · particles flow along mycelium</p>
    </div>
  );
}
