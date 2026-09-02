// 鴻築 FP Decoration — Checkbox
export function Checkbox({ label, checked, defaultChecked = false, onChange, disabled = false, style = {} }) {
  const isControlled = checked !== undefined;
  const [inner, setInner] = React.useState(defaultChecked);
  const value = isControlled ? checked : inner;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInner(!value);
    onChange && onChange(!value);
  };
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--text-body)", ...style }}>
      <span
        role="checkbox" aria-checked={value} tabIndex={disabled ? -1 : 0}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } }}
        style={{
          width: 18, height: 18, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${value ? "var(--fp-primary)" : "var(--border-strong)"}`,
          background: value ? "var(--fp-primary)" : "var(--surface-card)",
          borderRadius: "var(--radius-sm)",
          transition: "background var(--duration-fast) var(--ease-out)",
        }}
      >
        {value && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
      </span>
      {label}
    </label>
  );
}
