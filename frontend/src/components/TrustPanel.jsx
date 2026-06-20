const TRUST_ITEMS = [
  { title: 'Cloud storage', desc: 'Files are saved after upload' },
  { title: 'Protected access', desc: 'Optional password protection' },
  { title: 'No account required', desc: 'Create a share without signing in' },
  { title: '7-day default', desc: 'Extend up to 30 days' },
];

export default function TrustPanel() {
  return (
    <aside className="trust-panel">
      <div className="trust-panel-header">
        <span className="pulse-dot" />
        <span>Share settings</span>
      </div>

      <div className="trust-list">
        {TRUST_ITEMS.map((item) => (
          <div key={item.title} className="trust-item glass-card">
            <div className="trust-item-bar" />
            <div>
              <div className="trust-item-title">{item.title}</div>
              <div className="trust-item-desc">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="trust-footnote">Links expire automatically</p>
    </aside>
  );
}
