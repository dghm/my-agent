import React, { useState } from "react";

export function Tabs({ tabs = [], value, onChange, defaultValue }) {
  const [internal, setInternal] = useState(defaultValue ?? (tabs[0] && (typeof tabs[0] === "string" ? tabs[0] : tabs[0].value)));
  const current = value ?? internal;
  const set = (v) => { setInternal(v); onChange && onChange(v); };
  return (
    <div role="tablist" style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--border-default)", fontFamily: "var(--font-body)" }}>
      {tabs.map((t) => {
        const tab = typeof t === "string" ? { value: t, label: t } : t;
        const active = tab.value === current;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => set(tab.value)}
            style={{
              background: "none", border: "none", padding: "10px 2px", cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "inherit", fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              borderBottom: `2px solid ${active ? "var(--border-strong)" : "transparent"}`,
              marginBottom: -1,
              transition: "color var(--duration-fast) var(--ease-standard)",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
