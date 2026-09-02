// 鴻築 FP Decoration — Badge
export function Badge({ tone = "neutral", children, style = {} }) {
  const tones = {
    neutral: { background: "var(--surface-tint)", color: "var(--fp-primary)" },
    brand: { background: "var(--fp-primary)", color: "#fff" },
    accent: { background: "var(--fp-accent)", color: "var(--fp-dark)" },
    success: { background: "rgba(46,125,91,0.12)", color: "var(--status-success)" },
    warning: { background: "rgba(168,118,42,0.12)", color: "var(--status-warning)" },
    danger: { background: "rgba(168,58,58,0.12)", color: "var(--status-danger)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", fontSize: 12, fontWeight: 500,
      letterSpacing: "var(--tracking-wide)", borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-sans)",
      ...tones[tone], ...style,
    }}>{children}</span>
  );
}
