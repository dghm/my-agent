import React from 'react';

/** DGHM select dropdown, styled to match Input. */
export function Select({ label, options = [], value, onChange, placeholder, disabled = false, style }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)', ...style }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dghm-navy)' }}>{label}</span>}
      <select
        value={value} onChange={onChange} disabled={disabled}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          fontFamily: 'var(--font-body)', fontSize: 15, padding: '10px 12px', appearance: 'auto',
          borderRadius: 'var(--radius-sm)', outline: 'none',
          border: `1.5px solid ${focus ? 'var(--focus-ring)' : 'var(--border-default)'}`,
          background: disabled ? 'var(--dghm-pale)' : '#fff', color: 'var(--text-body)',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </label>
  );
}

/** DGHM checkbox with label. */
export function Checkbox({ label, checked, onChange, disabled = false, style }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-body)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled}
        style={{ width: 16, height: 16, accentColor: 'var(--dghm-navy)' }} />
      {label}
    </label>
  );
}
