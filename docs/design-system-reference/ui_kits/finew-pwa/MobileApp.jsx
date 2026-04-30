/* global React, Icons, Button, Money, CategoryPill, TransactionRow, TRANSACTIONS, OverviewScreen, TransactionsScreen, BudgetsScreen, CardsScreen, GoalsScreen */
const { useState: useStateMobile } = React;

const MOBILE_NAV = [
  { id: "overview",     label: "Início",      icon: Icons.home },
  { id: "transactions", label: "Lançamentos", icon: Icons.list },
  { id: "budgets",      label: "Orçamentos",  icon: Icons.pie },
  { id: "cards",        label: "Cartões",     icon: Icons.card },
  { id: "more",         label: "Mais",        icon: Icons.menu },
];

const MOBILE_TITLES = {
  overview: "Visão geral",
  transactions: "Lançamentos",
  budgets: "Orçamentos",
  cards: "Cartões",
  goals: "Metas",
  more: "Mais",
};

// Mobile-specific compact screens
const MobileOverview = ({ openSheet }) => (
  <div className="fw-m-screen">
    <div className="fw-m-hero">
      <div className="t-micro">Patrimônio total</div>
      <div className="t-display" style={{ fontSize: 36, marginTop: 4 }}>
        <Money amount={184290.47} display sign="never" />
      </div>
      <div className="fw-kpi-delta is-gain" style={{ marginTop: 6 }}>
        <Icons.arrowUp size={12} /> +1,2% · 30 d
      </div>
    </div>

    <div className="fw-m-quick">
      <button onClick={() => openSheet("add")}><Icons.plus size={18}/><span>Adicionar</span></button>
      <button><Icons.wallet size={18}/><span>Contas</span></button>
      <button><Icons.calendar size={18}/><span>Agendados</span></button>
      <button><Icons.target size={18}/><span>Metas</span></button>
    </div>

    <div className="fw-m-section">
      <div className="fw-m-section-head">
        <div className="t-h4">Orçamento de abril</div>
        <button className="t-caption">Ver tudo</button>
      </div>
      {[
        { cat: "Moradia", k: "moradia", spent: 2450, budget: 2500 },
        { cat: "Mercado", k: "mercado", spent: 1482, budget: 1500 },
        { cat: "Restaurantes", k: "restaurantes", spent: 892, budget: 800 },
      ].map(b => {
        const pct = Math.min((b.spent / b.budget) * 100, 100);
        const over = b.spent > b.budget;
        return (
          <div key={b.cat} className="fw-m-budget">
            <CategoryPill k={b.k} label={b.cat} />
            <div className="fw-progress" style={{ flex: 1 }}>
              <div className="fw-progress-bar" style={{ width: `${pct}%`, background: over ? "var(--loss)" : "var(--accent)" }}/>
            </div>
            <div className="t-body-sm" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", minWidth: 70, textAlign: "right" }}>
              <Money amount={b.spent} sign="never" />
            </div>
          </div>
        );
      })}
    </div>

    <div className="fw-m-section">
      <div className="fw-m-section-head">
        <div className="t-h4">Lançamentos recentes</div>
        <button className="t-caption">Ver tudo</button>
      </div>
      <div className="fw-tx-list">
        {TRANSACTIONS.slice(0, 4).map(tx => <TransactionRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  </div>
);

const MobileTransactions = () => (
  <div className="fw-m-screen">
    <div className="fw-search" style={{ margin: "0 0 12px" }}>
      <Icons.search size={16} />
      <input placeholder="Buscar lançamentos…" />
    </div>
    <div className="fw-tabs">
      <button className="is-active">Todas</button>
      <button>Despesas</button>
      <button>Receitas</button>
    </div>
    <div className="fw-tx-list" style={{ marginTop: 12 }}>
      {TRANSACTIONS.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
    </div>
  </div>
);

const MobileBudgets = () => (
  <div className="fw-m-screen">
    {[
      { cat: "Moradia", k: "moradia", spent: 2450, budget: 2500 },
      { cat: "Mercado", k: "mercado", spent: 1482.30, budget: 1500 },
      { cat: "Transporte", k: "transporte", spent: 340, budget: 500 },
      { cat: "Restaurantes", k: "restaurantes", spent: 892.15, budget: 800 },
      { cat: "Assinaturas", k: "assinaturas", spent: 149.80, budget: 200 },
    ].map(b => {
      const pct = Math.min((b.spent / b.budget) * 100, 100);
      const over = b.spent > b.budget;
      return (
        <div key={b.cat} className="fw-card" style={{ marginBottom: 10 }}>
          <div className="fw-card-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <CategoryPill k={b.k} label={b.cat} />
              <div className="t-body-sm" style={{ color: "var(--fg-2)", fontVariantNumeric: "tabular-nums" }}>
                <Money amount={b.spent} sign="never" /> / <Money amount={b.budget} sign="never" />
              </div>
            </div>
            <div className="fw-progress">
              <div className="fw-progress-bar" style={{ width: `${pct}%`, background: over ? "var(--loss)" : "var(--accent)" }}/>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const MobileCards = () => (
  <div className="fw-m-screen">
    <div className="fw-card" style={{ marginBottom: 12 }}>
      <div className="fw-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div className="t-h4">Nubank · 4892</div>
          <span className="fw-badge fw-badge-warn">Vence 03/05</span>
        </div>
        <div className="t-display" style={{ fontSize: 30 }}><Money amount={1840.15} display sign="never" /></div>
        <div className="t-caption" style={{ marginTop: 4 }}>Fatura aberta</div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button variant="primary" size="sm">Pagar</Button>
          <Button variant="secondary" size="sm">Lançamentos</Button>
        </div>
      </div>
    </div>
    <div className="fw-card">
      <div className="fw-card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div className="t-h4">Itaú · 1023</div>
          <span className="fw-badge fw-badge-neutral">Vence 18/05</span>
        </div>
        <div className="t-display" style={{ fontSize: 30 }}><Money amount={428.90} display sign="never" /></div>
        <div className="t-caption" style={{ marginTop: 4 }}>Fatura aberta</div>
      </div>
    </div>
  </div>
);

const MobileMore = () => (
  <div className="fw-m-screen">
    <div className="fw-m-list">
      {[
        ["Metas financeiras", Icons.target],
        ["Contas conectadas", Icons.wallet],
        ["Categorias", Icons.pie],
        ["Relatórios", Icons.list],
        ["Notificações", Icons.bell],
        ["Configurações", Icons.cog],
        ["Perfil", Icons.user],
      ].map(([label, IconC]) => (
        <button key={label} className="fw-m-list-item">
          <IconC size={18} />
          <span>{label}</span>
          <Icons.chevR size={16} />
        </button>
      ))}
    </div>
  </div>
);

const MOBILE_SCREENS = {
  overview: MobileOverview,
  transactions: MobileTransactions,
  budgets: MobileBudgets,
  cards: MobileCards,
  more: MobileMore,
};

const AddSheet = ({ onClose }) => (
  <>
    <div className="fw-sheet-backdrop" onClick={onClose} />
    <div className="fw-sheet">
      <div className="fw-sheet-handle" />
      <div className="fw-sheet-head">
        <h3 className="t-h3">Nova transação</h3>
        <button className="fw-icon-btn" onClick={onClose}><Icons.close size={18}/></button>
      </div>
      <div className="fw-sheet-body">
        <div className="fw-tabs">
          <button>Receita</button>
          <button className="is-active">Despesa</button>
          <button>Transferência</button>
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="fw-label">Valor</label>
          <input className="fw-input fw-input-money" defaultValue="R$ 0,00" />

          <label className="fw-label" style={{ marginTop: 12 }}>Descrição</label>
          <input className="fw-input" placeholder="Ex.: Mercado Pão de Açúcar" />

          <label className="fw-label" style={{ marginTop: 12 }}>Categoria</label>
          <div className="fw-input fw-input-select">Selecione <Icons.chevD size={16} /></div>

          <label className="fw-label" style={{ marginTop: 12 }}>Conta</label>
          <div className="fw-input fw-input-select">Itaú · CC <Icons.chevD size={16} /></div>

          <Button variant="primary" size="lg" onClick={onClose}>Salvar transação</Button>
        </div>
      </div>
    </div>
  </>
);

const MobileApp = ({ initialScreen = "overview" }) => {
  const [active, setActive] = useStateMobile(initialScreen);
  const [sheet, setSheet] = useStateMobile(null);
  const Screen = MOBILE_SCREENS[active] || MobileOverview;
  return (
    <div className="fw-mobile">
      <header className="fw-m-topbar">
        <button className="fw-icon-btn"><Icons.user size={18} /></button>
        <div className="t-h4">{MOBILE_TITLES[active]}</div>
        <button className="fw-icon-btn"><Icons.bell size={18} /><span className="fw-dot"/></button>
      </header>
      <div className="fw-m-content">
        <Screen openSheet={(k) => setSheet(k)} />
      </div>
      <button className="fw-fab" onClick={() => setSheet("add")}><Icons.plus size={22}/></button>
      <nav className="fw-bottom-tabs">
        {MOBILE_NAV.map(n => (
          <button key={n.id} onClick={() => setActive(n.id)} className={active === n.id ? "is-active" : ""}>
            <n.icon size={20} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      {sheet === "add" && <AddSheet onClose={() => setSheet(null)} />}
    </div>
  );
};

window.MobileApp = MobileApp;
