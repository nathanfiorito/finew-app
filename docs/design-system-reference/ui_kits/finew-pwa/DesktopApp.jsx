/* global React, Icons, Button, OverviewScreen, TransactionsScreen, BudgetsScreen, CardsScreen, GoalsScreen */
const { useState: useStateDesktop } = React;

const NAV = [
  { id: "overview",  label: "Visão geral",  icon: Icons.home },
  { id: "transactions", label: "Lançamentos", icon: Icons.list },
  { id: "budgets",   label: "Orçamentos",   icon: Icons.pie },
  { id: "cards",     label: "Cartões",      icon: Icons.card },
  { id: "goals",     label: "Metas",        icon: Icons.target },
];

const SCREENS_DESKTOP = {
  overview: OverviewScreen,
  transactions: TransactionsScreen,
  budgets: BudgetsScreen,
  cards: CardsScreen,
  goals: GoalsScreen,
};

const DesktopApp = ({ initialScreen = "overview", density = "comfortable", onDensityChange }) => {
  const [active, setActive] = useStateDesktop(initialScreen);
  const Screen = SCREENS_DESKTOP[active];
  return (
    <div className="fw-desktop">
      <aside className="fw-sidebar">
        <div className="fw-brand">
          <span className="fw-wordmark">Finew<span className="fw-wordmark-dot">.</span></span>
        </div>
        <nav className="fw-nav">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)}
                    className={`fw-nav-item ${active === n.id ? "is-active" : ""}`}>
              <n.icon size={18} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="fw-sidebar-foot">
          <button className="fw-nav-item"><Icons.cog size={18} /><span>Configurações</span></button>
          <div className="fw-account">
            <div className="fw-avatar">NF</div>
            <div>
              <div className="t-body-sm" style={{ fontWeight: 600 }}>Nathan Fiorito</div>
              <div className="t-caption">nathan@finew.com.br</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="fw-main">
        <header className="fw-topbar">
          <div className="fw-search fw-search-top">
            <Icons.search size={16} />
            <input placeholder="Buscar transações, contas, metas…" />
            <kbd>⌘ K</kbd>
          </div>
          <div className="fw-topbar-actions">
            <div className="fw-density-toggle">
              <button className={density === "comfortable" ? "is-active" : ""} onClick={() => onDensityChange?.("comfortable")}>Confortável</button>
              <button className={density === "compact" ? "is-active" : ""} onClick={() => onDensityChange?.("compact")}>Compacto</button>
            </div>
            <button className="fw-icon-btn"><Icons.bell size={18} /><span className="fw-dot"/></button>
          </div>
        </header>
        <div className="fw-main-scroll">
          <Screen density={density} />
        </div>
      </main>
    </div>
  );
};

window.DesktopApp = DesktopApp;
