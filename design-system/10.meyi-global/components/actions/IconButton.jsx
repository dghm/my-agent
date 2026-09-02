import React, { useState } from "react";

const dims = { sm: 28, md: 36, lg: 44 };

export function IconButton({ children, size = "md", variant = "ghost", disabled = false, label, onClick }) {
  const [hover, setHover] = useState(false);
  const d = dims[size] || dims.md;
  const solid = variant === "primary";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: d, height: d, display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: solid ? (hover && !disabled ? "var(--accent-hover)" : "var(--accent)") : hover && !disabled ? "var(--gray-50)" : "transparent",
        color: solid ? "var(--accent-contrast)" : "var(--text-primary)",
        border: variant === "secondary" ? "1px solid var(--border-strong)" : "1px solid transparent",
        borderRadius: "var(--radius-sm)", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background var(--duration-fast) var(--ease-standard)",
      }}
    >
      {children}
    </button>
  );
}
