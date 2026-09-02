import React from 'react';

/** DGHM text input with label — pale border, navy focus ring. */
export function Input({ label, placeholder, type = 'text', value, onChange, disabled = false, error, style }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)', ...style }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dghm-navy)' }}>{label}</span>}
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          fontFamily: 'var(--font-body)', fontSize: 15, padding: '10px 12px',
          borderRadius: 'var(--radius-sm)', outline: 'none',
          border: `1.5px solid ${error ? 'var(--dghm-orange-deep)' : focus ? 'var(--focus-ring)' : 'var(--border-default)'}`,
          background: disabled ? 'var(--dghm-pale)' : '#fff', color: 'var(--text-body)',
          transition: 'border-color var(--duration-fast) var(--ease-standard)',
        }}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--dghm-orange-deep)' }}>{error}</span>}
    </label>
  );
}
