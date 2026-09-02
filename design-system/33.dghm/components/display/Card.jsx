import React from 'react';

/** DGHM Card — white surface, subtle cool shadow, 10px radius. tone="brand" = navy, tone="section" = pale. */
export function Card({ tone = 'default', children, style }) {
  const tones = {
    default: { background: 'var(--surface-card)', color: 'var(--text-body)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card)' },
    section: { background: 'var(--surface-section)', color: 'var(--text-body)', border: '1px solid transparent' },
    brand: { background: 'var(--surface-brand)', color: 'var(--text-on-brand)', border: '1px solid transparent' },
    accent: { background: 'var(--surface-accent)', color: 'var(--text-on-accent)', border: '1px solid transparent' },
  };
  return (
    <div style={{ borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', fontFamily: 'var(--font-body)', ...tones[tone], ...style }}>
      {children}
    </div>
  );
}

/** Small pill/label — eyebrow tags like service keywords. */
export function Tag({ tone = 'neutral', children, style }) {
  const tones = {
    neutral: { background: 'var(--dghm-pale)', color: 'var(--dghm-navy)' },
    brand: { background: 'var(--dghm-navy)', color: '#fff' },
    accent: { background: 'var(--dghm-orange)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--dghm-slate)', border: '1px solid var(--border-default)' },
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--radius-pill)', padding: '4px 12px', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', letterSpacing: '0.02em', ...tones[tone], ...style }}>
      {children}
    </span>
  );
}

/** Data highlight — big number + caption, e.g. "+38% 流程效率提升". */
export function Stat({ value, label, tone = 'default', style }) {
  const dark = tone === 'accent' || tone === 'brand';
  const bg = { default: 'transparent', accent: 'var(--dghm-orange)', brand: 'var(--dghm-navy)' }[tone];
  return (
    <div style={{ background: bg, color: dark ? '#fff' : 'var(--dghm-navy)', borderRadius: 'var(--radius-md)', padding: tone === 'default' ? 0 : 'var(--space-5)', fontFamily: 'var(--font-brand)', ...style }}>
      <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 500, opacity: dark ? 0.9 : 1, color: dark ? undefined : 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
