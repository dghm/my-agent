// 鴻築 FP Decoration — Card
export function Card({ elevated = false, dark = false, padding = 24, children, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: dark ? "var(--surface-dark)" : "var(--surface-card)",
        color: dark ? "var(--text-on-dark)" : "var(--text-body)",
        border: elevated ? "none" : "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        boxShadow: elevated ? (hover ? "var(--shadow-lg)" : "var(--shadow-md)") : "none",
        transition: "box-shadow var(--duration-base) var(--ease-out)",
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
