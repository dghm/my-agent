// 鴻築 FP Decoration — Tooltip (hover)
export function Tooltip({ content, side = "top", children }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    bottom: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
    left: { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
    right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
  };
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span role="tooltip" style={{
          position: "absolute", zIndex: 50, whiteSpace: "nowrap",
          padding: "6px 10px", fontSize: 12, fontFamily: "var(--font-sans)",
          background: "var(--fp-dark)", color: "var(--text-on-dark)",
          borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-md)",
          pointerEvents: "none", ...pos[side],
        }}>{content}</span>
      )}
    </span>
  );
}
