// 鴻築 FP Decoration — home screen
const { Button: FPButton, Card: FPCard, Badge: FPBadge } = window.DesignSystem_c03e6e;

function HomeScreen({ onNav }) {
  const services = [
    ["住宅設計", "全屋規劃、格局重整與工程統包，打造貼近生活的空間。"],
    ["商業空間", "門店、辦公與餐飲空間，兼顧品牌形象與營運動線。"],
    ["老屋翻新", "結構補強、管線更新到風格再造，讓老屋重獲新生。"],
  ];
  const stats = [["20+", "年施工經驗"], ["300+", "完工案場"], ["100%", "合約保固"]];
  return (
    <main>
      {/* Hero */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "96px 32px 80px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, alignItems: "center" }}>
        <div>
          <Eyebrow>FP DECORATION · 鴻築室內裝修</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-serif-display)", fontWeight: 900, fontSize: 52, letterSpacing: "var(--tracking-display)", lineHeight: 1.25, margin: "18px 0 0" }}>築造理想空間</h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: "34ch", margin: "20px 0 0", lineHeight: 1.9 }}>從設計、施工到交屋，我們以嚴謹的工法與誠實的溝通，陪您完成每一個家的想像。</p>
          <div style={{ display: "flex", gap: 14, marginTop: 36 }}>
            <FPButton variant="primary" size="lg" onClick={() => onNav("contact")}>預約諮詢</FPButton>
            <FPButton variant="outline" size="lg" onClick={() => onNav("portfolio")}>查看作品</FPButton>
          </div>
        </div>
        <PhotoPlaceholder label="HERO — 完工實景照片" ratio="4 / 5" />
      </section>

      {/* Services */}
      <section style={{ background: "var(--surface-card)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 32px" }}>
          <Eyebrow>OUR SERVICES</Eyebrow>
          <h2 style={{ fontFamily: "var(--font-serif-display)", fontWeight: 700, fontSize: 32, letterSpacing: "var(--tracking-wide)", margin: "14px 0 36px" }}>服務項目</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {services.map(([t, d]) => (
              <FPCard key={t} elevated padding={28}>
                <h3 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{t}</h3>
                <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.9, margin: "10px 0 0" }}>{d}</p>
              </FPCard>
            ))}
          </div>
        </div>
      </section>

      {/* Dark stats band */}
      <section style={{ background: "var(--surface-dark)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 32px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, textAlign: "center" }}>
          {stats.map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "var(--font-serif-display)", fontWeight: 700, fontSize: 44, color: "var(--text-on-dark)" }}>{n}</div>
              <div style={{ fontSize: 14, letterSpacing: "var(--tracking-wide)", color: "var(--text-on-dark-muted)", marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured works */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
          <div>
            <Eyebrow>PORTFOLIO</Eyebrow>
            <h2 style={{ fontFamily: "var(--font-serif-display)", fontWeight: 700, fontSize: 32, letterSpacing: "var(--tracking-wide)", margin: "14px 0 0" }}>精選作品</h2>
          </div>
          <FPButton variant="ghost" onClick={() => onNav("portfolio")}>查看全部 →</FPButton>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {[["信義區 L 宅", "住宅設計"], ["大安區咖啡廳", "商業空間"], ["中山區 40 年老宅", "老屋翻新"]].map(([t, c]) => (
            <div key={t} style={{ cursor: "pointer" }} onClick={() => onNav("portfolio")}>
              <PhotoPlaceholder label="作品照片" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                <span style={{ fontSize: 17, fontWeight: 500, color: "var(--text-heading)", flex: 1 }}>{t}</span>
                <FPBadge tone="neutral">{c}</FPBadge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

window.HomeScreen = HomeScreen;
