import React from "react";

export function Toast({ message, tone = "neutral", action, visible = true }) {
  if (!visible) return null;
  const bar = { success: "var(--status-success)", warning: "var(--status-warning)", danger: "var(--status-danger)" }[tone];
  return (
    <div role="status" style={{
      display: "inline-flex", alignItems: "center", gap: 16,
      background: "var(--ink)", color: "var(--white)",
      padding: "12px 16px", borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-overlay)", fontFamily: "var(--font-body)", fontSize: 14,
      borderLeft: bar ? `3px solid ${bar}` : "3px solid transparent",
    }}>
      <span>{message}</span>
      {action && (
        <button onClick={action.onClick} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--white)", textDecoration: "underline", textUnderlineOffset: 3,
        }}>{action.label}</button>
      )}
    </div>
  );
}
