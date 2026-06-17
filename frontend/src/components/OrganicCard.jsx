import React, { useEffect, useRef } from "react";

/**
 * OrganicCard — base card with hover-following spore glow + grow-in animation.
 */
export default function OrganicCard({ children, className = "", forbidden = false, testid, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div
      ref={ref}
      className={`organic-card grow-in ${forbidden ? "forbidden" : ""} ${className}`}
      data-testid={testid}
      {...rest}
    >
      {children}
    </div>
  );
}
