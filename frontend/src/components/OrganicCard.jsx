import React from "react";

/**
 * OrganicCard — simple, calm card. Mouse-glow removed per user request.
 */
export default function OrganicCard({ children, className = "", forbidden = false, testid, ...rest }) {
  return (
    <div
      className={`organic-card grow-in ${forbidden ? "forbidden" : ""} ${className}`}
      data-testid={testid}
      {...rest}
    >
      {children}
    </div>
  );
}
