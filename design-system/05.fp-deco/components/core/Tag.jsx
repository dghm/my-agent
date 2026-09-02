// 鴻築 FP Decoration — Tag (pill, optionally removable)
export function Tag({ onRemove, children, style = {} }) {
  const [hover, setHover] = React.useState(false);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 12px", fontSize: 13, fontFamily: "var(--font-sans)",
      color: "var(--fp-primary)", background: "var(--surface-card)",
      border: "1px solid var(--border-strong)", borderRadius: "var(--radius-pill)",
      ...style,
    }}>
      {children}
      {onRemove && (
        <button
          aria-label="移除" onClick={onRemove}
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          style={{
            border: "none", background: "none", cursor: "pointer", padding: 0,
            display: "inline-flex", color: hover ? "var(--fp-primary)" : "var(--fp-gray)",
            fontSize: 14, lineHeight: 1,
          }}
        >×</button>
      )}
    </span>
  );
}
