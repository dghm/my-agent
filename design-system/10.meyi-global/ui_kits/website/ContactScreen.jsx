const DSContact = window.MeyiGlobalDesignSystem_830a18;

function ContactScreen() {
  const [form, setForm] = React.useState({ name: "", email: "", region: "", message: "", subscribe: false });
  const [sent, setSent] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    const e = {};
    if (!form.name) e.name = "Required";
    if (!form.email) e.email = "Required";
    setErrors(e);
    if (Object.keys(e).length === 0) setSent(true);
  };
  return (
    <main style={{ background: "var(--white)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "72px 32px 96px", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 64 }}>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>CONTACT</div>
          <h1 style={{ margin: "16px 0 20px", fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>Talk to us.</h1>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 15, lineHeight: "var(--leading-normal)", color: "var(--text-secondary)", maxWidth: 380 }}>
            We reply within two business days. For urgent shipments, mark your message accordingly.
          </p>
          <div style={{ marginTop: 40, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 8 }}>
            <span>info@meyiglobal.com</span>
            <span>Taipei, Taiwan · GMT+8</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <DSContact.Input label="Name" value={form.name} onChange={set("name")} error={errors.name} />
            <DSContact.Input label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
          </div>
          <DSContact.Select label="Region" placeholder="Choose…" options={["Asia Pacific", "Europe", "Americas", "Other"]} value={form.region} onChange={set("region")} />
          <label style={{ fontFamily: "var(--font-body)" }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Message</span>
            <textarea rows="5" value={form.message} onChange={(e) => set("message")(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: 12, fontFamily: "var(--font-body)", fontSize: 14, border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", outline: "none", resize: "vertical" }}></textarea>
          </label>
          <DSContact.Checkbox label="Subscribe to trade updates" checked={form.subscribe} onChange={set("subscribe")} />
          <div>
            <DSContact.Button size="lg" onClick={submit}>Send message</DSContact.Button>
          </div>
        </div>
      </div>
      <DSContact.Dialog open={sent} title="Message sent" onClose={() => setSent(false)}
        primaryAction={{ label: "Done", onClick: () => setSent(false) }}>
        Thank you — we'll be in touch within two business days.
      </DSContact.Dialog>
    </main>
  );
}

Object.assign(window, { ContactScreen });
