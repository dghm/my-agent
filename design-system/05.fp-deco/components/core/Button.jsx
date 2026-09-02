// 鴻築 FP Decoration — Button
export function Button({ variant = "primary", size = "md", disabled = false, icon = null, children, style = {}, ...rest }) {
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 13 },
    md: { padding: "10px 22px", fontSize: 15 },
    lg: { padding: "14px 30px", fontSize: 16 },
  };
  const variants = {
    primary: { background: "var(--btn-primary-bg)", color: "#fff", border: "1px solid transparent" },
    secondary: { background: "var(--btn-secondary-bg)", color: "#fff", border: "1px solid transparent" },
    outline: { background: "transparent", color: "var(--fp-primary)", border: "1px solid var(--fp-primary)" },
    ghost: { background: "transparent", color: "var(--fp-secondary)", border: "1px solid transparent" },
  };
  const [hover, setHover] = React.useState(false);
  const hoverBg = {
    primary: "var(--btn-primary-bg-hover)",
    secondary: "var(--btn-secondary-bg-hover)",
    outline: "var(--surface-tint)",
    ghost: "var(--surface-tint)",
  };
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center", whiteSpace: "nowrap",
        fontFamily: "var(--font-sans)", fontWeight: 500, letterSpacing: "var(--tracking-wide)",
        borderRadius: "var(--radius-sm)", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
        ...sizes[size], ...variants[variant],
        ...(hover && !disabled ? { background: hoverBg[variant] } : {}),
        ...style,
      }}
      {...rest}
    >
      {icon}{children}
    </button>
  );
}
