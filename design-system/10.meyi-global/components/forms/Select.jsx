import React, { useState } from "react";

export function Select({ label, options = [], value, onChange, placeholder, disabled = false }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: "block", fontFamily: "var(--font-body)" }}>
      {label && (
        <span style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{label}</span>
      )}
      <div style={{ position: "relative" }}>
        <select
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            width: "100%", height: 40, padding: "0 36px 0 12px", appearance: "none",
            fontFamily: "var(--font-body)", fontSize: 14, color: value ? "var(--text-primary)" : "var(--text-muted)",
            background: disabled ? "var(--gray-50)" : "var(--white)",
            border: `1px solid ${focus ? "var(--border-strong)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-sm)", outline: "none", cursor: disabled ? "not-allowed" : "pointer",
            boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none",
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-secondary)" }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </label>
  );
}
