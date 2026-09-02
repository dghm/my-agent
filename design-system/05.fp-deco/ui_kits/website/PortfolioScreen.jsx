// 鴻築 FP Decoration — portfolio screen
const { Tabs: FPTabs, Badge: PBadge, Tag: PTag } = window.DesignSystem_c03e6e;

function PortfolioScreen() {
  const [cat, setCat] = React.useState("全部");
  const works = [
    ["信義區 L 宅", "住宅", "現代簡約"],
    ["大安區咖啡廳", "商業空間", "工業風"],
    ["中山區 40 年老宅", "老屋翻新", "北歐風"],
    ["內湖 T 宅", "住宅", "日式無印"],
    ["松山辦公室", "商業空間", "現代簡約"],
    ["永和公寓翻新", "老屋翻新", "混搭"],
  ];
  const shown = works.filter(([, c]) => cat === "全部" || c === cat);
  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 32px 96px" }}>
      <Eyebrow>PORTFOLIO 作品實績</Eyebrow>
      <h1 style={{ fontFamily: "var(--font-serif-display)", fontWeight: 900, fontSize: 40, letterSpacing: "var(--tracking-display)", margin: "16px 0 32px" }}>作品實績</h1>
      <FPTabs tabs={["全部", "住宅", "商業空間", "老屋翻新"]} value={cat} onChange={setCat} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "32px 24px", marginTop: 36 }}>
        {shown.map(([t, c, s]) => (
          <div key={t} style={{ cursor: "pointer" }}>
            <PhotoPlaceholder label="作品照片" />
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 17, fontWeight: 500, color: "var(--text-heading)", flex: 1 }}>{t}</span>
                <PBadge tone="neutral">{c}</PBadge>
              </div>
              <div style={{ marginTop: 10 }}><PTag>{s}</PTag></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

window.PortfolioScreen = PortfolioScreen;
