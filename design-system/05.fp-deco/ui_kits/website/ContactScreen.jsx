// 鴻築 FP Decoration — contact screen
const { Button: CButton, Input: CInput, Select: CSelect, Checkbox: CCheckbox, Card: CCard, Toast: CToast } = window.DesignSystem_c03e6e;

function ContactScreen() {
  const [sent, setSent] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 32px 96px", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 64 }}>
      <div>
        <Eyebrow>CONTACT US</Eyebrow>
        <h1 style={{ fontFamily: "var(--font-serif-display)", fontWeight: 900, fontSize: 40, letterSpacing: "var(--tracking-display)", margin: "16px 0 0" }}>聯絡我們</h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.9, margin: "18px 0 0", maxWidth: "30ch" }}>留下您的需求，我們將於一個工作天內回覆，並安排到府丈量與初步諮詢。</p>
        <div style={{ marginTop: 36, fontSize: 15, lineHeight: 2.4, color: "var(--text-body)" }}>
          <div><b style={{ color: "var(--text-heading)" }}>電話</b>　02-0000-0000</div>
          <div><b style={{ color: "var(--text-heading)" }}>信箱</b>　service@fpdeco.tw</div>
          <div><b style={{ color: "var(--text-heading)" }}>時間</b>　週一至週五 9:00–18:00</div>
        </div>
      </div>
      <CCard elevated padding={36}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <CInput label="姓名" placeholder="請輸入您的姓名" />
          <CInput label="電話" placeholder="09xx-xxx-xxx" />
        </div>
        <div style={{ marginTop: 18 }}><CInput label="Email" placeholder="name@example.com" /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
          <CSelect label="空間類型" options={["住宅", "商業空間", "辦公室", "其他"]} />
          <CSelect label="預算範圍" options={["100 萬以下", "100–300 萬", "300 萬以上", "尚未確定"]} />
        </div>
        <div style={{ marginTop: 22 }}>
          <CCheckbox label="我同意個資使用聲明" checked={agree} onChange={setAgree} />
        </div>
        <div style={{ marginTop: 26 }}>
          <CButton variant="primary" size="lg" disabled={!agree} onClick={() => setSent(true)} style={{ width: "100%" }}>送出需求</CButton>
        </div>
      </CCard>
      {sent && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60 }}>
          <CToast tone="success" title="已送出" onClose={() => setSent(false)}>我們將盡快與您聯繫。</CToast>
        </div>
      )}
    </main>
  );
}

window.ContactScreen = ContactScreen;
