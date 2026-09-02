import React from "react";

export function Switch({ label, checked = false, onChange, disabled = false }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", opacity: disabled ? 0.4 : 1 }}>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange && onChange(!checked)}
        onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !disabled) { e.preventDefault(); onChange && onChange(!checked); } }}
        style={{
          width: 36, height: 20, flex: "0 0 auto", borderRadius: "var(--radius-pill)", position: "relative",
          background: checked ? "var(--accent)" : "var(--gray-300)",
          transition: "background var(--duration-normal) var(--ease-standard)",
        }}
      >
        <span style={{
          position: "absolute", top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: "50%",
          background: "var(--white)", transition: "left var(--duration-normal) var(--ease-standard)",
        }}></span>
      </span>
      {label && <span style={{ fontSize: 14 }}>{label}</span>}
    </label>
  );
}
