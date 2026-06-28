import { useApp } from "../context/AppContext";

const NAV_ITEMS = [
  { label: "Dashboard",    icon: "📊" },
  { label: "Mint New Card",icon: "➕" },
  { label: "My Collection",icon: "🃏" },
  { label: "Transfer Card",icon: "🔁" },
  { label: "Admin Mint",   icon: "⚙️" },
  { label: "Event Log",    icon: "📡" },
];

/**
 * Application sidebar with navigation and wallet status.
 */
export function Sidebar({ walletAddress, onConnect, onDisconnect }) {
  const { activeMenu, setActiveMenu, theme, toggleTheme, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar-main ${sidebarOpen ? "sidebar-open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-logo">
          <div className="logo-box">🎴</div>
          <h3>My Epic NFT</h3>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation">
          {NAV_ITEMS.map(({ label, icon }) => (
            <button
              key={label}
              id={`nav-${label.replace(/\s+/g, "-").toLowerCase()}`}
              className={`sidebar-item ${activeMenu === label ? "active" : ""}`}
              onClick={() => { setActiveMenu(label); setSidebarOpen(false); }}
              aria-current={activeMenu === label ? "page" : undefined}
            >
              <span className="sb-icon" aria-hidden="true">{icon}</span>
              <span className="sb-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {/* Wallet Card */}
          <div className="wallet-card">
            <div className="wc-header">
              <div className="wc-icon" aria-hidden="true">🛡️</div>
              <div>
                <p className="wc-title">My Wallet</p>
                <p className="wc-addr">
                  {walletAddress
                    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            <button
              id="wallet-connect-btn"
              className="wc-btn"
              onClick={walletAddress ? onDisconnect : onConnect}
            >
              {walletAddress ? "DISCONNECT" : "CONNECT WALLET"}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span>{theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
            <div className={`toggle-switch ${theme === "dark" ? "active" : ""}`}>
              <div className="toggle-knob" />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
