import React, { useState } from "react";

const sizes = {
  sm: { height: 28, padding: "0 12px", fontSize: 12 },
  md: { height: 36, padding: "0 16px", fontSize: 13 },
  lg: { height: 44, padding: "0 22px", fontSize: 14 },
};

const variants = {
  primary: {
    base: { background: "var(--accent)", color: "var(--accent-contrast)", border: "1px solid var(--accent)" },
    hover: { background: "var(--accent-hover)", borderColor: "var(--accent-hover)" },
  },
  secondary: {
    base: { background: "var(--white)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" },
    hover: { background: "var(--gray-50)" },
  },
  ghost: {
    base: { background: "transparent", color: "var(--text-primary)", border: "1px solid transparent" },
    hover: { background: "var(--gray-50)" },
  },
  inverse: {
    base: { background: "var(--white)", color: "var(--text-primary)", border: "1px solid var(--white)" },
    hover: { background: "var(--gray-100)", borderColor: "var(--gray-100)" },
  },
};

export function Button({ children, variant = "primary", size = "md", disabled = false, fullWidth = false, onClick, type = "button" }) {
  const [hover, setHover] = useState(false);
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "nowrap",
        fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.01em",
        borderRadius: "var(--radius-sm)", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1, width: fullWidth ? "100%" : undefined,
        transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)",
        ...s, ...v.base, ...(hover && !disabled ? v.hover : {}),
      }}
    >
      {children}
    </button>
  );
}
