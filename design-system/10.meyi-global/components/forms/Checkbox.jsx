import React from "react";

export function Checkbox({ label, checked = false, onChange, disabled = false }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", opacity: disabled ? 0.4 : 1 }}>
      <span
        role="checkbox"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange && onChange(!checked)}
        onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !disabled) { e.preventDefault(); onChange && onChange(!checked); } }}
        style={{
          width: 18, height: 18, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: checked ? "var(--accent)" : "var(--white)",
          border: `1px solid ${checked ? "var(--accent)" : "var(--gray-400)"}`,
          borderRadius: "var(--radius-sm)",
          transition: "background var(--duration-fast) var(--ease-standard)",
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="m5 13 4 4L19 7" /></svg>
        )}
      </span>
      {label && <span style={{ fontSize: 14 }}>{label}</span>}
    </label>
  );
}
