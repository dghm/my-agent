import React, { useState } from "react";

export function Tag({ children, onRemove, active = false, onClick }) {
  const [hover, setHover] = useState(false);
  const interactive = !!onClick;
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px", whiteSpace: "nowrap",
        fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
        background: active ? "var(--accent)" : hover && interactive ? "var(--gray-50)" : "var(--white)",
        color: active ? "var(--accent-contrast)" : "var(--text-primary)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-sm)", cursor: interactive ? "pointer" : "default",
        transition: "background var(--duration-fast) var(--ease-standard)",
      }}
    >
      {children}
      {onRemove && (
        <svg onClick={(e) => { e.stopPropagation(); onRemove(); }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: "pointer" }}><path d="M18 6 6 18M6 6l12 12" /></svg>
      )}
    </span>
  );
}
