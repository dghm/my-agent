// 鴻築 FP Decoration — IconButton
export function IconButton({ label, size = "md", variant = "ghost", disabled = false, children, style = {}, ...rest }) {
  const px = { sm: 28, md: 36, lg: 44 }[size];
  const variants = {
    ghost: { background: "transparent", color: "var(--fp-primary)", border: "1px solid transparent" },
    outline: { background: "var(--surface-card)", color: "var(--fp-primary)", border: "1px solid var(--border-subtle)" },
    solid: { background: "var(--btn-primary-bg)", color: "#fff", border: "1px solid transparent" },
  };
  const [hover, setHover] = React.useState(false);
  const hoverStyle = {
    ghost: { background: "var(--surface-tint)" },
    outline: { borderColor: "var(--border-strong)" },
    solid: { background: "var(--btn-primary-bg-hover)" },
  };
  return (
    <button
      aria-label={label} title={label} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: px, height: px, display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "var(--radius-sm)", cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background var(--duration-fast) var(--ease-out)",
        ...variants[variant],
        ...(hover && !disabled ? hoverStyle[variant] : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
