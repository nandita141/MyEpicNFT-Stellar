import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import CONFIG from "../config";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * Dashboard page: stats row, contract overview, token query, and quick mint.
 */
export function Dashboard() {
  const { walletAddress, totalSupply, yourCards, setActiveMenu } = useApp();
  const { queryToken, publicMint, mintLoading, mintElapsed, queryLoading } = useContract();

  const [queryId, setQueryId]       = useState("");
  const [tokenOwner, setTokenOwner] = useState("");
  const [tokenUri, setTokenUri]     = useState("");
  const [tokenMeta, setTokenMeta]   = useState(null);

  const handleQuery = async () => {
    if (!queryId) return;
    setTokenOwner(""); setTokenUri(""); setTokenMeta(null);
    try {
      const { owner, uri } = await queryToken(queryId);
      setTokenOwner(owner);
      setTokenUri(uri);

      if (uri?.startsWith("ipfs://")) {
        const url = `${CONFIG.IPFS_GATEWAY}${uri.replace("ipfs://", "")}`;
        const res = await fetch(url);
        if (res.ok) setTokenMeta(await res.json());
      }
    } catch {
      // error already toasted by useContract
    }
  };

  return (
    <div className="dashboard-grid-complex">
      {/* ── STATS ROW ─────────────────────────────────────────── */}
      <div className="stats-row">
        <StatCard
          label="Total Supply"
          value={totalSupply}
          sub="Cards minted"
          color="blue"
          icon="📊"
          graph="M0 30 L20 20 L40 25 L60 10 L80 15 L100 5 L100 30 Z"
          line="M0 30 L20 20 L40 25 L60 10 L80 15 L100 5"
          fillColor="rgba(66,153,225,0.2)"
          strokeColor="#4299E1"
        />
        <StatCard
          label="Your Cards"
          value={!walletAddress ? "—" : yourCards}
          sub="Owned NFTs"
          color="purple"
          icon="💳"
          graph="M0 30 L20 25 L40 10 L60 20 L80 5 L100 15 L100 30 Z"
          line="M0 30 L20 25 L40 10 L60 20 L80 5 L100 15"
          fillColor="rgba(159,122,234,0.2)"
          strokeColor="#9F7AEA"
        />
        <StatCard
          label="Network"
          value="Stellar"
          sub="Testnet"
          subClass="orange-text"
          color="orange"
          icon="🌐"
          graph="M0 30 L20 25 L40 28 L60 15 L80 20 L100 10 L100 30 Z"
          line="M0 30 L20 25 L40 28 L60 15 L80 20 L100 10"
          fillColor="rgba(237,137,54,0.2)"
          strokeColor="#ED8936"
        />
      </div>

      {/* ── MIDDLE ROW ────────────────────────────────────────── */}
      <div className="middle-row">
        {/* Contract Overview */}
        <div className="dash-box">
          <h2 className="dash-box-title">Contract Overview</h2>
          <InfoRow label="Contract ID">
            <span className="copy-box" title={CONFIG.CONTRACT_ID}>
              {CONFIG.CONTRACT_ID.slice(0, 6)}…{CONFIG.CONTRACT_ID.slice(-4)} 📋
            </span>
          </InfoRow>
          <InfoRow label="Standard"><strong>Custom NFT (Soroban)</strong></InfoRow>
          <InfoRow label="Network"><strong>Stellar Testnet</strong></InfoRow>
          <InfoRow label="Decimals"><strong>0</strong></InfoRow>
          <a
            href={`${CONFIG.STELLAR_EXPERT_BASE}/contract/${CONFIG.CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="btn-dash-outline w-100 text-center mt-3"
            id="view-contract-btn"
          >
            VIEW ON STELLAR EXPERT ↗
          </a>
        </div>

        {/* Token Query */}
        <div className="dash-box">
          <h2 className="dash-box-title">Query Token</h2>
          <div className="qt-input">
            <label htmlFor="query-token-id">Token ID</label>
            <div className="input-wrap">
              <input
                id="query-token-id"
                type="number"
                min="0"
                placeholder="Enter Token ID"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              />
              <span className="icon" aria-hidden="true">🔍</span>
            </div>
          </div>
          <button
            id="query-token-btn"
            className="btn-dash-primary w-100"
            onClick={handleQuery}
            disabled={queryLoading || !queryId}
          >
            {queryLoading ? <LoadingSpinner size="sm" /> : "QUERY TOKEN"}
          </button>

          <div className="qt-result">
            {!queryLoading && !tokenOwner && !tokenUri && (
              <div className="qt-empty">
                <div className="spinner-icon mb-2">💠</div>
                <p>Enter a Token ID to view its on-chain metadata.</p>
              </div>
            )}
            {(tokenOwner || tokenUri) && (
              <div className="qt-data">
                <p><strong>Owner:</strong> {tokenOwner.slice(0, 10)}…</p>
                <p><strong>URI:</strong> {tokenUri.slice(0, 20)}…</p>
                {tokenMeta?.name && <p><strong>Name:</strong> {tokenMeta.name}</p>}
                {tokenMeta?.attributes?.map((a) => (
                  <p key={a.trait_type}><strong>{a.trait_type}:</strong> {a.value}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Mint */}
        <div className="dash-box">
          <h2 className="dash-box-title">✨ Quick Mint</h2>
          <div className="qm-buttons mt-3">
            <button
              id="public-mint-btn"
              className="btn-dash-gradient w-100 mb-3"
              onClick={publicMint}
              disabled={mintLoading || !walletAddress}
            >
              {mintLoading
                ? <><LoadingSpinner size="sm" /> Minting ({mintElapsed}s)…</>
                : "MINT CARD (PUBLIC)"}
            </button>
            <button
              id="go-admin-mint-btn"
              className="btn-dash-outline w-100"
              onClick={() => setActiveMenu("Admin Mint")}
            >
              MINT CARD (ADMIN)
            </button>
          </div>
          <p className="qm-desc mt-3 text-center">
            Mint a random Stellar Card NFT to your connected wallet.
          </p>
        </div>
      </div>

      {/* ── LINKS ROW ─────────────────────────────────────────── */}
      <div className="dash-box links-box">
        <h2 className="dash-box-title">Helpful Links</h2>
        <div className="links-list mt-3">
          {[
            { label: "🌐 Stellar Network", url: "https://stellar.org", text: "stellar.org ↗" },
            { label: "🔍 Stellar Expert",  url: "https://stellar.expert", text: "stellar.expert ↗" },
            { label: "📄 Soroban Docs",    url: "https://soroban.stellar.org/docs", text: "soroban.stellar.org ↗" },
            { label: "💧 Testnet Faucet",  url: CONFIG.FAUCET_URL, text: "friendbot.stellar.org ↗" },
            { label: "💻 GitHub Repo",     url: "https://github.com/nandita141/MyEpicNFT-Stellar", text: "github.com ↗" },
          ].map(({ label, url, text }) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="link-item">
              <span>{label}</span>
              <span className="link-url">{text}</span>
            </a>
          ))}
        </div>
      </div>

      <footer className="footer-text mt-4 mb-4 text-center">
        <small>© 2024 Stellar Card NFT · Soroban Testnet · Built by Nandita</small>
      </footer>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subClass, color, icon, graph, line, fillColor, strokeColor }) {
  return (
    <div className={`stat-card ${color}`}>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
        <small className={subClass}>{sub}</small>
      </div>
      <div className="sc-icon" aria-hidden="true">{icon}</div>
      <div className="sc-graph">
        <svg viewBox="0 0 100 30" aria-hidden="true">
          <path d={graph} fill={fillColor} />
          <path d={line} fill="none" stroke={strokeColor} strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="co-item">
      <span>{label}</span>
      {children}
    </div>
  );
}

export default Dashboard;
