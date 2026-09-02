import React from 'react';

/** Section heading block — orange eyebrow, navy title, slate lede. Matches dghm.tw section pattern. */
export function SectionHeader({ eyebrow, title, lede, align = 'left', onDark = false, style }) {
  return (
    <div style={{ fontFamily: 'var(--font-brand)', textAlign: align, maxWidth: 640, margin: align === 'center' ? '0 auto' : undefined, ...style }}>
      {eyebrow && <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--dghm-orange)', marginBottom: 8 }}>{eyebrow}</div>}
      <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 700, lineHeight: 'var(--leading-tight)', color: onDark ? '#fff' : 'var(--text-heading)', margin: 0 }}>{title}</h2>
      {lede && <p style={{ fontSize: 16, lineHeight: 'var(--leading-normal)', color: onDark ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)', marginTop: 12, marginBottom: 0 }}>{lede}</p>}
    </div>
  );
}

/** Numbered process phase — "01 Process Audit · 2–4 WEEKS · description". */
export function PhaseStep({ number, title, duration, description, style }) {
  return (
    <div style={{ fontFamily: 'var(--font-brand)', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-card)', ...style }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--dghm-orange)', lineHeight: 1 }}>{number}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--dghm-navy)' }}>{title}</div>
        {duration && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 'var(--tracking-wide)', color: 'var(--dghm-slate)' }}>{duration}</div>}
      </div>
      <p style={{ fontSize: 14, lineHeight: 'var(--leading-normal)', color: 'var(--text-secondary)', margin: '8px 0 0' }}>{description}</p>
    </div>
  );
}
