// 鴻築 FP Decoration — Radio group
export function Radio({ name, options = [], value, defaultValue, onChange, disabled = false, direction = "row", style = {} }) {
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const current = isControlled ? value : inner;
  const pick = (v) => {
    if (disabled) return;
    if (!isControlled) setInner(v);
    onChange && onChange(v);
  };
  return (
    <div role="radiogroup" style={{ display: "flex", flexDirection: direction === "column" ? "column" : "row", gap: direction === "column" ? 10 : 20, opacity: disabled ? 0.45 : 1, fontFamily: "var(--font-sans)", ...style }}>
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        const on = current === opt.value;
        return (
          <label key={opt.value}
            onClick={() => pick(opt.value)}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", fontSize: 15, color: "var(--text-body)" }}>
            <span role="radio" aria-checked={on} tabIndex={disabled ? -1 : 0}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); pick(opt.value); } }}
              style={{
                width: 18, height: 18, flex: "none", borderRadius: "50%",
                border: `1px solid ${on ? "var(--fp-primary)" : "var(--border-strong)"}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "var(--surface-card)",
              }}>
              {on && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--fp-primary)" }}></span>}
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
