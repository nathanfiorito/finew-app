/* global React, Icons, Money, Sparkline, Button, CategoryPill, KPIStat, Card, TransactionRow */
const { useState: useStateScreens } = React;

// Sample data
const TRANSACTIONS = [
  { id: 1, date: "28/04", description: "Mercado Pão de Açúcar", category: "Mercado", categoryKey: "mercado", account: "Itaú · CC", amount: -482.30 },
  { id: 2, date: "27/04", description: "Salário — abril", category: "Renda", categoryKey: "renda", account: "Itaú · CC", amount: 8200.00 },
  { id: 3, date: "26/04", description: "Uber · 3 corridas", category: "Transporte", categoryKey: "transporte", account: "Nubank · Crédito", amount: -84.12 },
  { id: 4, date: "25/04", description: "Spotify Family", category: "Assinaturas", categoryKey: "assinaturas", account: "Nubank · Crédito", amount: -34.90 },
  { id: 5, date: "24/04", description: "Drogasil", category: "Saúde", categoryKey: "saude", account: "Itaú · Débito", amount: -128.40 },
  { id: 6, date: "23/04", description: "Cinema · Iguatemi", category: "Lazer", categoryKey: "lazer", account: "Nubank · Crédito", amount: -64.00 },
  { id: 7, date: "22/04", description: "Aluguel — abril", category: "Moradia", categoryKey: "moradia", account: "Itaú · CC", amount: -2450.00 },
  { id: 8, date: "20/04", description: "Curso Coursera", category: "Educação", categoryKey: "educacao", account: "Nubank · Crédito", amount: -149.00 },
];

const SPARK = [120, 124, 119, 128, 132, 130, 135, 140, 138, 145, 148, 152, 156, 160, 165];
const SPARK_DOWN = [200, 195, 198, 192, 188, 185, 190, 184, 178, 175, 172, 168, 165, 162, 158];

// ============================================================================
// OVERVIEW SCREEN
// ============================================================================
const OverviewScreen = ({ density = "comfortable" }) => (
  <div className="fw-screen" data-density={density}>
    <header className="fw-screen-head">
      <div>
        <div className="t-micro">Visão geral</div>
        <h1 className="t-h1" style={{ marginTop: 4 }}>Olá, Nathan</h1>
      </div>
      <div className="fw-screen-head-actions">
        <Button variant="secondary" icon={Icons.calendar} size="sm">Abril 2026</Button>
        <Button variant="primary" icon={Icons.plus} size="sm">Adicionar</Button>
      </div>
    </header>

    <div className="fw-grid-3" style={{ marginTop: 24 }}>
      <KPIStat label="Patrimônio total" value={184290.47} delta={1.2} deltaLabel="30 d" sparkline={SPARK} />
      <KPIStat label="Despesas — abril" value={6842.15} delta={-4.2} deltaLabel="vs. março" sparkline={SPARK_DOWN} sparkColor="var(--loss)" />
      <KPIStat label="Receitas — abril" value={8200.00} delta={0} deltaLabel="vs. março" sparkline={[8000,8000,8000,8000,8200,8200,8200,8200,8200,8200,8200,8200,8200,8200,8200]} />
    </div>

    <div className="fw-grid-2" style={{ marginTop: 16 }}>
      <Card title="Reserva de emergência" action={<Button variant="ghost" size="sm">Detalhes</Button>}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
          <span className="t-display" style={{ fontSize: 36 }}>4,2</span>
          <span className="t-body" style={{ color: "var(--fg-2)" }}>meses cobertos</span>
        </div>
        <div className="fw-progress"><div className="fw-progress-bar" style={{ width: "70%" }}/></div>
        <div className="t-caption" style={{ marginTop: 8 }}>Meta: 6 meses · faltam <Money amount={4836.20} /></div>
      </Card>
      <Card title="Distribuição de despesas">
        <DonutChart />
      </Card>
    </div>

    <Card title="Lançamentos recentes"
          action={<Button variant="ghost" size="sm">Ver todos <Icons.chevR size={14}/></Button>}>
      <div className="fw-tx-list">
        {TRANSACTIONS.slice(0, 5).map(tx => <TransactionRow key={tx.id} tx={tx} />)}
      </div>
    </Card>
  </div>
);

// ============================================================================
// DONUT CHART
// ============================================================================
const DonutChart = () => {
  const slices = [
    { v: 35, c: "var(--series-1)", label: "Moradia" },
    { v: 22, c: "var(--series-3)", label: "Mercado" },
    { v: 14, c: "var(--series-2)", label: "Transporte" },
    { v: 11, c: "var(--series-4)", label: "Assinaturas" },
    { v: 9,  c: "var(--series-5)", label: "Saúde" },
    { v: 9,  c: "var(--series-6)", label: "Lazer" },
  ];
  let acc = 0;
  const total = slices.reduce((s, x) => s + x.v, 0);
  const r = 50, cx = 60, cy = 60;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {slices.map((s, i) => {
          const start = (acc / total) * 2 * Math.PI - Math.PI / 2;
          acc += s.v;
          const end = (acc / total) * 2 * Math.PI - Math.PI / 2;
          const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
          const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
          const large = end - start > Math.PI ? 1 : 0;
          return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`} fill={s.c} />;
        })}
        <circle cx={cx} cy={cy} r="28" fill="var(--surface-1)" />
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px", fontSize: 12 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, background: s.c, borderRadius: 2 }}/>
            <span style={{ color: "var(--fg-2)" }}>{s.label}</span>
            <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", color: "var(--fg-1)", fontWeight: 500 }}>{s.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TRANSACTIONS SCREEN
// ============================================================================
const TransactionsScreen = ({ density = "comfortable" }) => (
  <div className="fw-screen" data-density={density}>
    <header className="fw-screen-head">
      <div>
        <div className="t-micro">Lançamentos</div>
        <h1 className="t-h1" style={{ marginTop: 4 }}>Transações</h1>
      </div>
      <div className="fw-screen-head-actions">
        <Button variant="secondary" icon={Icons.filter} size="sm">Filtros</Button>
        <Button variant="primary" icon={Icons.plus} size="sm">Nova transação</Button>
      </div>
    </header>

    <div className="fw-toolbar" style={{ marginTop: 20 }}>
      <div className="fw-search">
        <Icons.search size={16} />
        <input placeholder="Buscar por descrição, categoria ou conta…" />
      </div>
      <div className="fw-tabs">
        <button className="is-active">Todas</button>
        <button>Despesas</button>
        <button>Receitas</button>
        <button>Pendentes</button>
      </div>
    </div>

    <Card padded={false}>
      <table className="fw-table">
        <thead>
          <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th className="amt">Valor</th></tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map(tx => (
            <tr key={tx.id}>
              <td className="fw-table-date">{tx.date}</td>
              <td>{tx.description}</td>
              <td><CategoryPill k={tx.categoryKey} label={tx.category} /></td>
              <td style={{ color: "var(--fg-2)" }}>{tx.account}</td>
              <td className={`amt ${tx.amount >= 0 ? "is-gain" : "is-loss"}`}><Money amount={tx.amount} sign="always" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

// ============================================================================
// BUDGETS SCREEN
// ============================================================================
const BUDGETS = [
  { cat: "Moradia", k: "moradia", spent: 2450, budget: 2500 },
  { cat: "Mercado", k: "mercado", spent: 1482.30, budget: 1500 },
  { cat: "Transporte", k: "transporte", spent: 340, budget: 500 },
  { cat: "Restaurantes", k: "restaurantes", spent: 892.15, budget: 800 },
  { cat: "Assinaturas", k: "assinaturas", spent: 149.80, budget: 200 },
  { cat: "Lazer", k: "lazer", spent: 412.40, budget: 600 },
];

const BudgetsScreen = ({ density = "comfortable" }) => (
  <div className="fw-screen" data-density={density}>
    <header className="fw-screen-head">
      <div>
        <div className="t-micro">Orçamentos</div>
        <h1 className="t-h1" style={{ marginTop: 4 }}>Abril 2026</h1>
      </div>
      <Button variant="primary" icon={Icons.plus} size="sm">Novo orçamento</Button>
    </header>

    <div className="fw-budget-list" style={{ marginTop: 20 }}>
      {BUDGETS.map(b => {
        const pct = (b.spent / b.budget) * 100;
        const over = pct > 100;
        return (
          <Card key={b.cat}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
              <CategoryPill k={b.k} label={b.cat} />
              <div className="t-body-sm" style={{ color: "var(--fg-2)" }}>
                <Money amount={b.spent} /> <span style={{ color: "var(--fg-3)" }}>de</span> <Money amount={b.budget} />
              </div>
            </div>
            <div className="fw-progress">
              <div className="fw-progress-bar" style={{ width: `${Math.min(pct, 100)}%`, background: over ? "var(--loss)" : "var(--accent)" }}/>
            </div>
            <div className="t-caption" style={{ marginTop: 6, color: over ? "var(--loss)" : "var(--fg-3)" }}>
              {over ? `Excedeu em ${(pct - 100).toFixed(0)}%` : `${pct.toFixed(0)}% utilizado`}
            </div>
          </Card>
        );
      })}
    </div>
  </div>
);

// ============================================================================
// CARDS SCREEN
// ============================================================================
const CardsScreen = ({ density = "comfortable" }) => (
  <div className="fw-screen" data-density={density}>
    <header className="fw-screen-head">
      <div>
        <div className="t-micro">Cartões de crédito</div>
        <h1 className="t-h1" style={{ marginTop: 4 }}>Faturas</h1>
      </div>
      <Button variant="secondary" icon={Icons.plus} size="sm">Adicionar cartão</Button>
    </header>

    <div className="fw-grid-2" style={{ marginTop: 20 }}>
      <Card title="Nubank · final 4892" action={<span className="fw-badge fw-badge-warn">Vence 03/05</span>}>
        <div className="t-display" style={{ fontSize: 32, marginTop: 4 }}>
          <Money amount={1840.15} display sign="never" />
        </div>
        <div className="t-caption" style={{ marginTop: 4 }}>Fatura aberta · 12 parcelamentos ativos</div>
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <Button variant="primary" size="sm">Pagar fatura</Button>
          <Button variant="ghost" size="sm">Ver lançamentos</Button>
        </div>
      </Card>
      <Card title="Itaú · final 1023" action={<span className="fw-badge fw-badge-neutral">Vence 18/05</span>}>
        <div className="t-display" style={{ fontSize: 32, marginTop: 4 }}>
          <Money amount={428.90} display sign="never" />
        </div>
        <div className="t-caption" style={{ marginTop: 4 }}>Fatura aberta · sem parcelamentos</div>
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <Button variant="primary" size="sm">Pagar fatura</Button>
          <Button variant="ghost" size="sm">Ver lançamentos</Button>
        </div>
      </Card>
    </div>

    <Card title="Próximas parcelas" action={<Button variant="ghost" size="sm">Ver todas</Button>}>
      <table className="fw-table">
        <thead><tr><th>Descrição</th><th>Parcela</th><th>Cartão</th><th className="amt">Valor</th></tr></thead>
        <tbody>
          <tr><td>iPhone 15</td><td>4 / 12</td><td>Nubank</td><td className="amt"><Money amount={624.92} sign="never" /></td></tr>
          <tr><td>Curso de inglês</td><td>2 / 6</td><td>Nubank</td><td className="amt"><Money amount={249.83} sign="never" /></td></tr>
          <tr><td>Notebook</td><td>8 / 10</td><td>Itaú</td><td className="amt"><Money amount={420.00} sign="never" /></td></tr>
        </tbody>
      </table>
    </Card>
  </div>
);

// ============================================================================
// GOALS SCREEN
// ============================================================================
const GoalsScreen = ({ density = "comfortable" }) => (
  <div className="fw-screen" data-density={density}>
    <header className="fw-screen-head">
      <div>
        <div className="t-micro">Metas financeiras</div>
        <h1 className="t-h1" style={{ marginTop: 4 }}>Objetivos</h1>
      </div>
      <Button variant="primary" icon={Icons.plus} size="sm">Nova meta</Button>
    </header>

    <div className="fw-grid-2" style={{ marginTop: 20 }}>
      {[
        { name: "Reserva de emergência", saved: 28800, target: 41000, eta: "Set/2026" },
        { name: "Viagem ao Japão", saved: 8400, target: 24000, eta: "Mar/2027" },
        { name: "Entrada apartamento", saved: 62000, target: 180000, eta: "Jun/2028" },
        { name: "MBA", saved: 4200, target: 35000, eta: "Jan/2027" },
      ].map(g => {
        const pct = (g.saved / g.target) * 100;
        return (
          <Card key={g.name}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h4 className="t-h4">{g.name}</h4>
              <span className="t-caption">Conclusão prevista · {g.eta}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "8px 0 10px" }}>
              <span className="t-display" style={{ fontSize: 28 }}><Money amount={g.saved} display sign="never" /></span>
              <span className="t-body-sm" style={{ color: "var(--fg-3)" }}>de <Money amount={g.target} sign="never" /></span>
            </div>
            <div className="fw-progress"><div className="fw-progress-bar" style={{ width: `${pct}%` }}/></div>
            <div className="t-caption" style={{ marginTop: 6 }}>{pct.toFixed(0)}% · falta <Money amount={g.target - g.saved} sign="never" /></div>
          </Card>
        );
      })}
    </div>
  </div>
);

// Export to window
Object.assign(window, {
  OverviewScreen, TransactionsScreen, BudgetsScreen, CardsScreen, GoalsScreen, TRANSACTIONS,
});
