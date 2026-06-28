import { useState } from "react";
import { useContract } from "../hooks/useContract";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * Admin mint form — mint a card with a specific IPFS URI.
 * Requires the connected wallet to be the contract admin.
 */
export function AdminMint() {
  const { adminMint, loading } = useContract();
  const [to, setTo]   = useState("");
  const [uri, setUri] = useState("");

  const SAMPLE_URIS = [
    { label: "🐉 Fire Dragon",   uri: "ipfs://QmUYrFddXf4SpEXWAp6RpSm6XZmwxiDRKLNixt58nuhwAo" },
    { label: "🧊 Ice Mage",      uri: "ipfs://QmbZEqRXpz35zfXkyhAoPAfZLZLZmr1rDSXKbtuS5UhNPm" },
    { label: "⚔️ Stone Warrior", uri: "ipfs://QmdwASjP4qiyhvn6vJrDr2P3sudJ45KLtiariQmdqQAG9g" },
  ];

  const handleMint = async () => {
    await adminMint(to, uri);
    setTo("");
    setUri("");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>⚙️ Admin Mint</h2>
        <p>Mint a card with a specific metadata URI. Requires admin authorization.</p>
      </div>

      <div className="form-card max-w-lg">
        <div className="qt-input mb-3">
          <label htmlFor="admin-mint-to">Recipient Address</label>
          <input
            id="admin-mint-to"
            type="text"
            placeholder="G…"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="qt-input mb-2">
          <label htmlFor="admin-mint-uri">Metadata URI (IPFS)</label>
          <input
            id="admin-mint-uri"
            type="text"
            placeholder="ipfs://..."
            value={uri}
            onChange={(e) => setUri(e.target.value)}
          />
        </div>

        {/* Sample URI quick-fill buttons */}
        <div className="sample-uris mb-4">
          <p className="sample-label">Quick-fill sample URIs:</p>
          <div className="sample-buttons">
            {SAMPLE_URIS.map((s) => (
              <button
                key={s.label}
                className="btn-sample"
                onClick={() => setUri(s.uri)}
                title={s.uri}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button
          id="admin-mint-btn"
          className="btn-dash-primary w-100"
          onClick={handleMint}
          disabled={loading || !to || !uri}
        >
          {loading ? <LoadingSpinner size="sm" /> : "MINT (ADMIN)"}
        </button>

        <div className="form-note mt-3">
          <span>⚠️</span>
          <p>Only the admin address that initialized the contract can call this function.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminMint;
