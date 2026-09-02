import React from "react";
import { Button } from "../actions/Button.jsx";

export function Dialog({ open = false, title, children, onClose, primaryAction, secondaryAction, width = 440 }) {
  if (!open) return null;
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
    >
      <div role="dialog" aria-modal="true" style={{
        width, maxWidth: "calc(100vw - 48px)", background: "var(--white)",
        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-overlay)",
        padding: 32, fontFamily: "var(--font-body)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>{title}</div>
          {onClose && (
            <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-secondary)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div style={{ marginTop: 12, fontSize: 14, lineHeight: "var(--leading-normal)", color: "var(--text-secondary)" }}>{children}</div>
        {(primaryAction || secondaryAction) && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 28 }}>
            {secondaryAction && <Button variant="ghost" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>}
            {primaryAction && <Button variant="primary" onClick={primaryAction.onClick}>{primaryAction.label}</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
