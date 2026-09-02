// 鴻築 FP Decoration — Tabs
export function Tabs({ tabs = [], value, defaultValue, onChange, style = {} }) {
  const items = tabs.map((t) => (typeof t === "string" ? { value: t, label: t } : t));
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const current = isControlled ? value : inner;
  const pick = (v) => {
    if (!isControlled) setInner(v);
    onChange && onChange(v);
  };
  return (
    <div role="tablist" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-sans)", ...style }}>
      {items.map((t) => {
        const on = current === t.value;
        return (
          <button key={t.value} role="tab" aria-selected={on}
            onClick={() => pick(t.value)}
            style={{
              padding: "10px 18px", fontSize: 15, cursor: "pointer",
              background: "none", border: "none",
              borderBottom: `2px solid ${on ? "var(--fp-primary)" : "transparent"}`,
              marginBottom: -1,
              color: on ? "var(--fp-primary)" : "var(--text-muted)",
              fontWeight: on ? 500 : 400,
              letterSpacing: "var(--tracking-wide)",
              transition: "color var(--duration-fast) var(--ease-out)",
            }}
          >{t.label}</button>
        );
      })}
    </div>
  );
}
