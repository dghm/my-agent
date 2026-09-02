// 鴻築 FP Decoration — site chrome (header, footer, shared bits)
const { Button } = window.DesignSystem_c03e6e;

function Eyebrow({ children, onDark }) {
  return <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", color: onDark ? "var(--fp-accent)" : "var(--fp-secondary)" }}>{children}</div>;
}

function SiteHeader({ page, onNav }) {
  const items = [["home", "首頁"], ["portfolio", "作品實績"], ["contact", "聯絡我們"]];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(252,252,252,0.95)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a onClick={() => onNav("home")} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <img src="../../assets/logo-normal.svg" alt="FP Decoration" style={{ height: 44 }} />
          <span style={{ fontFamily: "var(--font-serif-display)", fontWeight: 700, fontSize: 19, letterSpacing: "var(--tracking-wide)", color: "var(--fp-primary)" }}>鴻築室內裝修</span>
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {items.map(([key, label]) => (
            <a key={key} onClick={() => onNav(key)}
              style={{ fontSize: 15, cursor: "pointer", letterSpacing: "var(--tracking-wide)", color: page === key ? "var(--fp-primary)" : "var(--text-muted)", fontWeight: page === key ? 500 : 400, borderBottom: page === key ? "2px solid var(--fp-primary)" : "2px solid transparent", paddingBottom: 2 }}>
              {label}
            </a>
          ))}
          <Button variant="primary" size="sm" onClick={() => onNav("contact")}>預約諮詢</Button>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter({ onNav }) {
  return (
    <footer style={{ background: "var(--surface-darker)", color: "var(--text-on-dark-muted)", marginTop: 0 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "56px 32px 40px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48 }}>
        <div>
          <img src="../../assets/logo-colorbg.svg" alt="FP Decoration" style={{ height: 72, borderRadius: 4 }} />
          <p style={{ fontSize: 14, lineHeight: 1.9, marginTop: 16, maxWidth: 320 }}>鴻築室內裝修專注於住宅與商業空間的整體規劃，從設計、施工到交屋，與您同行。</p>
        </div>
        <div style={{ fontSize: 14, lineHeight: 2.2 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", color: "var(--fp-accent)", marginBottom: 10 }}>SITEMAP</div>
          <a onClick={() => onNav("home")} style={{ display: "block", color: "var(--text-on-dark-muted)", cursor: "pointer" }}>首頁</a>
          <a onClick={() => onNav("portfolio")} style={{ display: "block", color: "var(--text-on-dark-muted)", cursor: "pointer" }}>作品實績</a>
          <a onClick={() => onNav("contact")} style={{ display: "block", color: "var(--text-on-dark-muted)", cursor: "pointer" }}>聯絡我們</a>
        </div>
        <div style={{ fontSize: 14, lineHeight: 2.2 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", color: "var(--fp-accent)", marginBottom: 10 }}>CONTACT</div>
          <div>service@fpdeco.tw</div>
          <div>02-0000-0000</div>
          <div>台北市</div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--divider-on-dark)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 32px", fontSize: 12, color: "var(--fp-lite)" }}>© 鴻築室內裝修 FP Decoration</div>
      </div>
    </footer>
  );
}

// Labeled placeholder for interior photography (none provided — do not generate imagery)
function PhotoPlaceholder({ label, ratio = "4 / 3", style }) {
  return (
    <div style={{ aspectRatio: ratio, background: "var(--surface-tint)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <span style={{ fontSize: 12, letterSpacing: "0.16em", color: "var(--fp-lite)" }}>{label}</span>
    </div>
  );
}

Object.assign(window, { Eyebrow, SiteHeader, SiteFooter, PhotoPlaceholder });
