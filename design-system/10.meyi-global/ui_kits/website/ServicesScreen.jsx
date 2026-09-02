const DSServices = window.MeyiGlobalDesignSystem_830a18;

function ServicesScreen({ onNav }) {
  const [tab, setTab] = React.useState("Sourcing");
  const content = {
    Sourcing: {
      title: "Global sourcing",
      body: "Supplier discovery, factory qualification and price negotiation across Asia-Pacific manufacturing hubs. We manage sampling, QC checkpoints and production timelines on your behalf.",
      points: ["Supplier audits", "Sample management", "Production QC"],
    },
    Logistics: {
      title: "Trade logistics",
      body: "Sea and air freight coordination with customs clearance and full documentation handled in a single thread — one contact from factory gate to destination port.",
      points: ["Sea & air freight", "Customs & documentation", "Door-to-door tracking"],
    },
    "Market entry": {
      title: "Market entry",
      body: "Distribution partnerships, regulatory compliance and go-to-market groundwork for brands entering new territories.",
      points: ["Distributor matching", "Compliance review", "Localization support"],
    },
  };
  const c = content[tab];
  return (
    <main>
      <section style={{ background: "var(--white)", borderBottom: "1px solid var(--border-default)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "72px 32px 0" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>SERVICES</div>
          <h1 style={{ margin: "16px 0 32px", fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>What we do</h1>
          <DSServices.Tabs tabs={Object.keys(content)} value={tab} onChange={setTab} />
        </div>
      </section>
      <section style={{ background: "var(--white)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "56px 32px 96px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>{c.title}</h2>
            <p style={{ margin: "16px 0 24px", fontFamily: "var(--font-body)", fontSize: 15, lineHeight: "var(--leading-normal)", color: "var(--text-secondary)", maxWidth: 560 }}>{c.body}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {c.points.map((p) => <DSServices.Tag key={p}>{p}</DSServices.Tag>)}
            </div>
          </div>
          <DSServices.Card inverse padding="lg" eyebrow="Next step" title="Scope your project">
            <p style={{ margin: "0 0 20px", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: "var(--leading-normal)", color: "var(--text-inverse-secondary)" }}>
              Tell us what you're sourcing or shipping and we'll reply within two business days.
            </p>
            <DSServices.Button variant="inverse" onClick={() => onNav("Contact")}>Contact us</DSServices.Button>
          </DSServices.Card>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { ServicesScreen });
