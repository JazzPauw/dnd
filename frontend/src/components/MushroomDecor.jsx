import React from "react";

/**
 * MushroomDecor — SVG mushrooms growing in unused corners of pages.
 */
export default function MushroomDecor({ position = "bottom-right", opacity = 0.18 }) {
  const styles = {
    "bottom-right": "right-4 bottom-4",
    "bottom-left": "left-4 bottom-4",
    "top-right": "right-4 top-4",
    "top-left": "left-4 top-4",
  };
  return (
    <div className={`pointer-events-none fixed ${styles[position]} z-[1] no-print`} style={{ opacity }} aria-hidden>
      <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
        {/* Stem 1 */}
        <path d="M40 140 Q42 100 48 80" stroke="var(--accent-mycelium)" strokeWidth="3" fill="none" />
        <ellipse cx="48" cy="78" rx="22" ry="12" fill="var(--accent-glow)" opacity="0.7" />
        <ellipse cx="48" cy="76" rx="22" ry="6" fill="var(--accent-spore)" />
        <circle cx="42" cy="74" r="1.8" fill="#fff" />
        <circle cx="54" cy="73" r="1.4" fill="#fff" />
        {/* Stem 2 */}
        <path d="M80 150 Q82 120 88 110" stroke="var(--accent-mycelium)" strokeWidth="2" fill="none" />
        <ellipse cx="88" cy="108" rx="14" ry="8" fill="var(--accent-glow)" opacity="0.6" />
        <ellipse cx="88" cy="107" rx="14" ry="4" fill="var(--accent-spore)" />
        {/* Roots */}
        <path d="M40 140 Q30 150 20 158" stroke="var(--accent-mycelium)" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M40 140 Q50 152 60 159" stroke="var(--accent-mycelium)" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}
