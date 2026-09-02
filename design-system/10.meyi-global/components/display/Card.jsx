import React from "react";

export function Card({ children, padding = "lg", inverse = false, title, eyebrow }) {
  const pad = { sm: 16, md: 24, lg: 32 }[padding] || 32;
  return (
    <div style={{
      background: inverse ? "var(--surface-inverse)" : "var(--surface-card)",
      color: inverse ? "var(--text-inverse)" : "var(--text-primary)",
      border: inverse ? "1px solid var(--surface-inverse)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)", padding: pad, fontFamily: "var(--font-body)",
      boxShadow: "var(--shadow-card)",
    }}>
      {eyebrow && (
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: inverse ? "var(--text-inverse-secondary)" : "var(--text-muted)", marginBottom: 10 }}>{eyebrow}</div>
      )}
      {title && (
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "var(--tracking-tight)", marginBottom: 8 }}>{title}</div>
      )}
      {children}
    </div>
  );
}
