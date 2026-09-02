const DS = window.MeyiGlobalDesignSystem_830a18;

function SiteHeader({ page, onNav }) {
  const items = ["Home", "Services", "Contact"];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--white)", borderBottom: "1px solid var(--border-default)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNav("Home"); }} style={{ display: "flex", alignItems: "center" }}>
          <img src="../../assets/meyi-logo-black.svg" alt="Meyi Global" style={{ height: 22 }} />
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {items.map((it) => (
            <a key={it} href="#" onClick={(e) => { e.preventDefault(); onNav(it); }}
              style={{
                fontFamily: "var(--font-body)", fontSize: 12, fontWeight: page === it ? 600 : 500,
                letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", textDecoration: "none",
                color: page === it ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: `2px solid ${page === it ? "var(--border-strong)" : "transparent"}`, paddingBottom: 2,
              }}>{it}</a>
          ))}
          <DS.Button size="sm" onClick={() => onNav("Contact")}>Get in touch</DS.Button>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter({ onNav }) {
  return (
    <footer style={{ background: "var(--black)", color: "var(--white)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "64px 32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 48, flexWrap: "wrap" }}>
          <img src="../../assets/meyi-logo-white.svg" alt="Meyi Global" style={{ height: 26 }} />
          <div style={{ display: "flex", gap: 64 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, letterSpacing: "var(--tracking-wide)", color: "rgba(255,255,255,.5)", fontFamily: "var(--font-body)" }}>COMPANY</div>
              {["Home", "Services", "Contact"].map((it) => (
                <a key={it} href="#" onClick={(e) => { e.preventDefault(); onNav(it); }}
                  style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,.72)", textDecoration: "none" }}>{it}</a>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,.72)" }}>
              <div style={{ fontSize: 11, letterSpacing: "var(--tracking-wide)", color: "rgba(255,255,255,.5)" }}>CONTACT</div>
              <span>info@meyiglobal.com</span>
              <span>Taipei, Taiwan</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid var(--border-inverse)", fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,.45)" }}>
          © 2026 Meyi Global Co., Ltd — MEYI GLOBAL COMPANY LIMITED
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { SiteHeader, SiteFooter });
