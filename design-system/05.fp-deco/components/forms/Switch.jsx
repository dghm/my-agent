// 鴻築 FP Decoration — Switch
export function Switch({ label, checked, defaultChecked = false, onChange, disabled = false, style = {} }) {
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
        role="switch" aria-checked={value} tabIndex={disabled ? -1 : 0}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } }}
        style={{
          width: 38, height: 22, flex: "none", borderRadius: "var(--radius-pill)",
          background: value ? "var(--fp-primary)" : "var(--fp-accent)",
          position: "relative",
          transition: "background var(--duration-base) var(--ease-out)",
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: value ? 19 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          boxShadow: "var(--shadow-sm)",
          transition: "left var(--duration-base) var(--ease-out)",
        }}></span>
      </span>
      {label}
    </label>
  );
}
