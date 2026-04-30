/* global React */
const { useState } = React;

// ============================================================================
// ICONS — inline Lucide subset (MIT). 1.75px stroke.
// ============================================================================
const Icon = ({ d, size = 20, strokeWidth = 1.75, fill = "none", children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke="currentColor" strokeWidth={strokeWidth}
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children || <path d={d} />}
  </svg>
);

const Icons = {
  home:    (p) => <Icon {...p}><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/></Icon>,
  list:    (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></Icon>,
  pie:     (p) => <Icon {...p}><path d="M21 12A9 9 0 1 1 12 3v9z"/></Icon>,
  card:    (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></Icon>,
  target:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></Icon>,
  search:  (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>,
  bell:    (p) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>,
  plus:    (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  menu:    (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Icon>,
  user:    (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  arrowUp: (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>,
  arrowDn: (p) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>,
  chevR:   (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  chevL:   (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>,
  chevD:   (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>,
  close:   (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>,
  filter:  (p) => <Icon {...p}><path d="M3 5h18M6 12h12M10 19h4"/></Icon>,
  calendar:(p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Icon>,
  cog:     (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2 1.2L5.1 5.8l-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.5a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.6c.07-.4.1-.8.1-1.2z"/></Icon>,
  wallet:  (p) => <Icon {...p}><path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h13"/><circle cx="17" cy="13" r="1"/></Icon>,
};

// ============================================================================
// MONEY — BRL/USD-aware, tabular
// ============================================================================
function formatMoney(amount, { currency = "BRL", sign = "auto" } = {}) {
  const abs = Math.abs(amount);
  const opts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  let body;
  if (currency === "BRL") {
    body = abs.toLocaleString("pt-BR", opts);
  } else {
    body = abs.toLocaleString("en-US", opts);
  }
  let prefix = "";
  if (sign === "always") prefix = amount >= 0 ? "+" : "\u2212";
  else if (sign === "auto" && amount < 0) prefix = "\u2212";
  const symbol = currency === "BRL" ? "R$" : "$";
  return { prefix, symbol, body };
}

const Money = ({ amount, currency = "BRL", sign = "auto", display = false, className = "" }) => {
  const { prefix, symbol, body } = formatMoney(amount, { currency, sign });
  return (
    <span className={`fw-money ${display ? "fw-money-display" : ""} ${className}`}>
      {prefix && <span className="fw-money-sign">{prefix}</span>}
      <span className="fw-money-symbol">{symbol}</span>
      <span className="fw-money-body">{body}</span>
    </span>
  );
};

// ============================================================================
// SPARKLINE
// ============================================================================
const Sparkline = ({ values, width = 120, height = 32, color, fill = true }) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => [i * stepX, height - 2 - ((v - min) / span) * (height - 4)]);
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const fillPath = `${path} L${width},${height} L0,${height} Z`;
  const stroke = color || "var(--accent)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      {fill && <path d={fillPath} fill={stroke} opacity="0.08" />}
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
};

// ============================================================================
// BUTTON
// ============================================================================
const Button = ({ variant = "primary", size = "md", icon: IconC, children, onClick, type = "button" }) => (
  <button type={type} onClick={onClick} className={`fw-btn fw-btn-${variant} fw-btn-${size}`}>
    {IconC && <IconC size={size === "sm" ? 14 : 16} />}
    {children}
  </button>
);

// ============================================================================
// CATEGORY PILL
// ============================================================================
const CATEGORY_COLOR = {
  mercado: "var(--series-1)", transporte: "var(--series-2)", restaurantes: "var(--series-3)",
  assinaturas: "var(--series-4)", saude: "var(--series-5)", lazer: "var(--series-6)",
  educacao: "var(--series-7)", moradia: "var(--series-8)", renda: "var(--series-1)",
};
const CategoryPill = ({ k, label }) => (
  <span className="fw-pill">
    <span className="fw-pill-dot" style={{ background: CATEGORY_COLOR[k] || "var(--fg-3)" }}/>
    {label}
  </span>
);

// ============================================================================
// KPI STAT
// ============================================================================
const KPIStat = ({ label, value, currency = "BRL", delta, deltaLabel, sparkline, sparkColor }) => (
  <div className="fw-kpi">
    <div className="t-micro">{label}</div>
    <div className="fw-kpi-value">
      <Money amount={value} currency={currency} display sign="never" />
    </div>
    {delta != null && (
      <div className={`fw-kpi-delta ${delta >= 0 ? "is-gain" : "is-loss"}`}>
        {delta >= 0 ? <Icons.arrowUp size={12} /> : <Icons.arrowDn size={12} />}
        <span>{delta >= 0 ? "+" : "\u2212"}{Math.abs(delta).toLocaleString("pt-BR", {minimumFractionDigits: 1, maximumFractionDigits: 1})}%</span>
        {deltaLabel && <span className="fw-kpi-delta-label">{deltaLabel}</span>}
      </div>
    )}
    {sparkline && <div style={{ marginTop: 10 }}><Sparkline values={sparkline} width={240} height={36} color={sparkColor} /></div>}
  </div>
);

// ============================================================================
// CARD
// ============================================================================
const Card = ({ title, action, children, padded = true }) => (
  <section className="fw-card">
    {(title || action) && (
      <header className="fw-card-head">
        {title && <h3 className="t-h4">{title}</h3>}
        {action}
      </header>
    )}
    <div className={padded ? "fw-card-body" : ""}>{children}</div>
  </section>
);

// ============================================================================
// TRANSACTION ROW
// ============================================================================
const TransactionRow = ({ tx, dense = false }) => (
  <div className={`fw-tx ${dense ? "is-dense" : ""}`}>
    <div className="fw-tx-date">{tx.date}</div>
    <div className="fw-tx-desc">
      <div className="fw-tx-title">{tx.description}</div>
      <div className="fw-tx-meta">
        <CategoryPill k={tx.categoryKey} label={tx.category} />
        <span className="fw-tx-account">· {tx.account}</span>
      </div>
    </div>
    <div className={`fw-tx-amt ${tx.amount >= 0 ? "is-gain" : "is-loss"}`}>
      <Money amount={tx.amount} sign="always" />
    </div>
  </div>
);

// Make components global so other Babel scripts can use them
Object.assign(window, {
  Icons, Icon, Money, Sparkline, Button, CategoryPill, KPIStat, Card, TransactionRow, formatMoney,
});
