import React from 'react';

/** DGHM Button — primary CTA is always orange bg + white text. */
export function Button({ variant = 'primary', size = 'md', disabled = false, children, onClick, style }) {
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 15 },
    lg: { padding: '14px 28px', fontSize: 17 },
  };
  const variants = {
    primary: { background: 'var(--cta-bg)', color: 'var(--cta-text)', border: '1px solid transparent' },
    secondary: { background: 'var(--dghm-navy)', color: '#fff', border: '1px solid transparent' },
    outline: { background: 'transparent', color: 'var(--dghm-navy)', border: '1px solid var(--dghm-navy)' },
    ghost: { background: 'transparent', color: 'var(--dghm-navy-light)', border: '1px solid transparent' },
  };
  const [hover, setHover] = React.useState(false);
  const hoverBg = { primary: 'var(--cta-bg-hover)', secondary: 'var(--dghm-navy-light)', outline: 'var(--dghm-pale)', ghost: 'var(--dghm-pale)' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'var(--font-brand)', fontWeight: 600, borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1.2,
        transition: 'background var(--duration-fast) var(--ease-standard)',
        ...sizes[size], ...variants[variant],
        ...(hover && !disabled ? { background: hoverBg[variant] } : {}),
        ...style,
      }}
    >{children}</button>
  );
}
