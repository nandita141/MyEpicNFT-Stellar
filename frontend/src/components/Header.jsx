import { useApp } from "../context/AppContext";
import CONFIG from "../config";

/**
 * Top application header with breadcrumb, network pill, and hamburger menu.
 */
export function Header({ walletAddress }) {
  const { activeMenu, setSidebarOpen } = useApp();

  return (
    <header className="main-header" role="banner">
      {/* Hamburger for mobile */}
      <button
        id="hamburger-btn"
        className="hamburger-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded="false"
      >
        <span />
        <span />
        <span />
      </button>

      <div className="greeting">
        <h1 className="header-title">
          {activeMenu}
        </h1>
        <p className="header-sub">Stellar Card NFT · Soroban Testnet</p>
      </div>

      <div className="header-actions">
        <div className="network-pill" title={`Contract: ${CONFIG.CONTRACT_ID}`}>
          <span className="dot" aria-hidden="true" />
          <span>{walletAddress ? "Connected" : "Disconnected"}</span>
          {walletAddress && (
            <strong>{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</strong>
          )}
        </div>

        <a
          href={`${CONFIG.STELLAR_EXPERT_BASE}/contract/${CONFIG.CONTRACT_ID}`}
          target="_blank"
          rel="noreferrer"
          className="icon-btn"
          title="View contract on Stellar Expert"
          aria-label="View on Stellar Expert"
          id="explorer-link-btn"
        >
          🔍
        </a>
      </div>
    </header>
  );
}

export default Header;
