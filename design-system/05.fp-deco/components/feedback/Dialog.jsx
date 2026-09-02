// 鴻築 FP Decoration — Dialog
export function Dialog({ open, onClose, title, footer, width = 480, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(29,31,56,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
    >
      <div
        role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: "calc(100vw - 48px)", background: "var(--surface-card)",
          borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
          fontFamily: "var(--font-sans)", overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: "var(--text-heading)" }}>{title}</span>
          <button aria-label="關閉" onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--fp-gray)", display: "inline-flex", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{ padding: 24, fontSize: 15, color: "var(--text-body)", lineHeight: "var(--leading-normal)" }}>{children}</div>
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-page)" }}>{footer}</div>}
      </div>
    </div>
  );
}
