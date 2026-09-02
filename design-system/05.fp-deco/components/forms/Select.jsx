// 鴻築 FP Decoration — Select
export function Select({ label, options = [], disabled = false, style = {}, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: "block", fontFamily: "var(--font-sans)", ...style }}>
      {label && <span style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text-heading)", marginBottom: 6 }}>{label}</span>}
      <span style={{ position: "relative", display: "block" }}>
        <select
          disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", boxSizing: "border-box", padding: "10px 36px 10px 12px",
            fontSize: 15, fontFamily: "var(--font-sans)", color: "var(--text-body)",
            background: disabled ? "var(--surface-tint)" : "var(--surface-card)",
            border: `1px solid ${focus ? "var(--fp-secondary)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-sm)", outline: "none", appearance: "none",
            boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          {...rest}
        >
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fp-gray)" strokeWidth="1.5"
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}
