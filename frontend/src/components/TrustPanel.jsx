const TRUST_ITEMS = [
  { title: 'S3 Storage', desc: 'Built on reliable cloud infrastructure' },
  { title: 'Encrypted transfers', desc: 'Secure in transit and at rest' },
  { title: 'Always free', desc: 'No limits, no credit card' },
  { title: '7-day default', desc: 'Extend up to 30 days' },
];

const LIVE_STATS = [
  { label: 'Files shared today', value: '847' },
  { label: 'Active links', value: '3.2k' },
];

export default function TrustPanel() {
  return (
    <aside className="trust-panel">
      <div className="trust-panel-header">
        <span className="pulse-dot" />
        <span>At a glance</span>
      </div>

      <div className="trust-stats glass-card">
        {LIVE_STATS.map((stat) => (
          <div key={stat.label} className="trust-stat">
            <span className="trust-stat-value">{stat.value}</span>
            <span className="trust-stat-label">{stat.label}</span>
          </div>
        ))}
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

      <p className="trust-footnote">Stored in S3</p>
    </aside>
  );
}
