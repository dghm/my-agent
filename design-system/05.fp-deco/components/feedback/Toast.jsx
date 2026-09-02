// 鴻築 FP Decoration — Toast (static element; position via wrapper)
export function Toast({ tone = "info", title, children, onClose, style = {} }) {
  const colors = {
    info: "var(--status-info)",
    success: "var(--status-success)",
    warning: "var(--status-warning)",
    danger: "var(--status-danger)",
  };
  return (
    <div role="status" style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      width: 340, padding: "14px 16px", boxSizing: "border-box",
      background: "var(--surface-card)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
      fontFamily: "var(--font-sans)", ...style,
    }}>
      <span style={{ width: 3, alignSelf: "stretch", background: colors[tone], borderRadius: 2, flex: "none" }}></span>
      <span style={{ flex: 1 }}>
        {title && <span style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-heading)" }}>{title}</span>}
        {children && <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginTop: title ? 3 : 0 }}>{children}</span>}
      </span>
      {onClose && (
        <button aria-label="關閉" onClick={onClose}
          style={{ border: "none", background: "none", cursor: "pointer", color: "var(--fp-gray)", display: "inline-flex", padding: 2, flex: "none" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
