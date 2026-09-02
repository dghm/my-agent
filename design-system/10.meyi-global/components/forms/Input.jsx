import React, { useState } from "react";

export function Input({ label, placeholder, value, onChange, type = "text", hint, error, disabled = false, size = "md" }) {
  const [focus, setFocus] = useState(false);
  const h = size === "sm" ? 32 : 40;
  return (
    <label style={{ display: "block", fontFamily: "var(--font-body)" }}>
      {label && (
        <span style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "var(--text-primary)" }}>{label}</span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: "100%", boxSizing: "border-box", height: h, padding: "0 12px",
          fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)",
          background: disabled ? "var(--gray-50)" : "var(--white)",
          border: `1px solid ${error ? "var(--status-danger)" : focus ? "var(--border-strong)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-sm)", outline: "none",
          boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none",
          transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
        }}
      />
      {(error || hint) && (
        <span style={{ display: "block", fontSize: 12, marginTop: 6, color: error ? "var(--status-danger)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
