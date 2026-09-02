import React from "react";

export function Radio({ label, checked = false, onChange, disabled = false, name }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", opacity: disabled ? 0.4 : 1 }}>
      <span
        role="radio"
        aria-checked={checked}
        data-name={name}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange && onChange(true)}
        onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !disabled) { e.preventDefault(); onChange && onChange(true); } }}
        style={{
          width: 18, height: 18, flex: "0 0 auto", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${checked ? "var(--accent)" : "var(--gray-400)"}`,
          background: "var(--white)",
          transition: "border-color var(--duration-fast) var(--ease-standard)",
        }}
      >
        {checked && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }}></span>}
      </span>
      {label && <span style={{ fontSize: 14 }}>{label}</span>}
    </label>
  );
}
