const DSHome = window.MeyiGlobalDesignSystem_830a18;

function HomeScreen({ onNav }) {
  return (
    <main>
      {/* Hero — ink surface */}
      <section style={{ background: "var(--ink)", color: "var(--white)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "112px 32px 96px" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, letterSpacing: "var(--tracking-wide)", color: "var(--text-inverse-secondary)" }}>GLOBAL TRADE · 環球貿易</div>
          <h1 style={{ margin: "20px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 700, letterSpacing: "var(--tracking-tight)", lineHeight: "var(--leading-tight)", maxWidth: 720 }}>
            Precision across borders.
          </h1>
          <p style={{ margin: "24px 0 0", fontFamily: "var(--font-body)", fontSize: "var(--text-md)", lineHeight: "var(--leading-normal)", color: "var(--text-inverse-secondary)", maxWidth: 520 }}>
            Meyi Global connects manufacturers and markets — sourcing, logistics and trade services managed end to end.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
            <DSHome.Button variant="inverse" size="lg" onClick={() => onNav("Contact")}>Get in touch</DSHome.Button>
            <a href="#" onClick={(e) => { e.preventDefault(); onNav("Services"); }}
              style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 22px", whiteSpace: "nowrap", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--white)", textDecoration: "none", border: "1px solid var(--border-inverse)", borderRadius: "var(--radius-sm)" }}>Our services</a>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section style={{ background: "var(--white)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "96px 32px" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>WHAT WE DO</div>
          <h2 style={{ margin: "14px 0 40px", fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>Services</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              ["01", "Global sourcing", "Supplier discovery, qualification and negotiation across Asia-Pacific manufacturing hubs."],
              ["02", "Trade logistics", "Sea and air freight coordination, customs and documentation handled in one thread."],
              ["03", "Market entry", "Distribution partnerships and compliance groundwork for new territories."],
            ].map(([n, t, d]) => (
              <DSHome.Card key={n} padding="lg">
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>{n}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "var(--tracking-tight)", margin: "12px 0 8px" }}>{t}</div>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 14, lineHeight: "var(--leading-normal)", color: "var(--text-secondary)" }}>{d}</p>
              </DSHome.Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact band */}
      <section style={{ background: "var(--gray-50)", borderTop: "1px solid var(--border-default)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "72px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>Start a conversation.</h2>
          <DSHome.Button size="lg" onClick={() => onNav("Contact")}>Contact us</DSHome.Button>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { HomeScreen });
