import React from "react";

export default function PageHeader({ title, subtitle, action, testid }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 flex-wrap" data-testid={testid}>
      <div>
        <h1 className="font-arcane text-4xl sm:text-5xl glow-text leading-none">{title}</h1>
        {subtitle && <p className="font-body italic text-[var(--text-secondary)] mt-3 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
