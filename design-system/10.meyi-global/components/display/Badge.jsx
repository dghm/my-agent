import React from "react";

const tones = {
  neutral: { background: "var(--gray-100)", color: "var(--text-primary)" },
  inverse: { background: "var(--ink)", color: "var(--white)" },
  outline: { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-strong)" },
  success: { background: "var(--status-success)", color: "var(--white)" },
  warning: { background: "var(--status-warning)", color: "var(--white)" },
  danger: { background: "var(--status-danger)", color: "var(--white)" },
};

export function Badge({ children, tone = "neutral" }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", whiteSpace: "nowrap",
      fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
      borderRadius: "var(--radius-pill)", border: "1px solid transparent", ...t,
    }}>
      {children}
    </span>
  );
}
