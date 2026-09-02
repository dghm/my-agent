// 鴻築 FP Decoration — Input
export function Input({ label, hint, error, disabled = false, style = {}, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: "block", fontFamily: "var(--font-sans)", ...style }}>
      {label && <span style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-heading)", marginBottom: 6 }}>{label}</span>}
      <input
        disabled={disabled}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: "100%", boxSizing: "border-box", padding: "10px 12px",
          fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--text-body)",
          background: disabled ? "var(--surface-tint)" : "var(--surface-card)",
          border: `1px solid ${error ? "var(--status-danger)" : focus ? "var(--fp-secondary)" : "var(--border-subtle)"}`,
          borderRadius: "var(--radius-sm)", outline: "none",
          boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none",
          transition: "border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)",
          cursor: disabled ? "not-allowed" : "text",
        }}
        {...rest}
      />
      {(error || hint) && (
        <span style={{ display: "block", fontSize: 12, marginTop: 6, color: error ? "var(--status-danger)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
