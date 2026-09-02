import React, { useState } from "react";

export function Tooltip({ label, children, side = "top" }) {
  const [show, setShow] = useState(false);
  const pos = {
    top: { bottom: "100%", left: "50%", transform: "translate(-50%, -6px)" },
    bottom: { top: "100%", left: "50%", transform: "translate(-50%, 6px)" },
    left: { right: "100%", top: "50%", transform: "translate(-6px, -50%)" },
    right: { left: "100%", top: "50%", transform: "translate(6px, -50%)" },
  }[side];
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && (
        <span role="tooltip" style={{
          position: "absolute", whiteSpace: "nowrap", zIndex: 50, ...pos,
          background: "var(--black)", color: "var(--white)",
          fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
          padding: "5px 8px", borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-overlay)", pointerEvents: "none",
        }}>{label}</span>
      )}
    </span>
  );
}
