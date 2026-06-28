import { useState, useEffect } from "react";
import CONFIG from "../config";
import { LoadingSpinner } from "./LoadingSpinner";

const RARITY_COLORS = {
  Epic:   { bg: "rgba(159,122,234,0.15)", border: "#9F7AEA", glow: "rgba(159,122,234,0.5)" },
  Rare:   { bg: "rgba(66,153,225,0.15)",  border: "#4299E1", glow: "rgba(66,153,225,0.5)"  },
  Common: { bg: "rgba(72,187,120,0.15)",  border: "#48BB78", glow: "rgba(72,187,120,0.5)"  },
};

const CARD_EMOJIS = {
  "Fire Dragon":    "🐉",
  "Ice Mage":       "🧊",
  "Stone Warrior":  "⚔️",
};

/**
 * Displays an NFT card with its on-chain metadata and IPFS image.
 *
 * @param {number}  tokenId - The token ID to display
 * @param {string}  owner   - Owner address
 * @param {string}  uri     - IPFS URI to fetch metadata from
 * @param {boolean} compact - If true, render a smaller tile
 * @param {function} onTransfer - Optional transfer callback
 */
export function CardDisplay({ tokenId, owner, uri, compact = false, onTransfer }) {
  const [metadata, setMetadata] = useState(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

  const handleMouseMove = (e) => {
    if (compact) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mx = (x / rect.width) * 100;
    const my = (y / rect.height) * 100;
    const rx = ((y / rect.height) - 0.5) * -25; // max 12.5deg tilt
    const ry = ((x / rect.width) - 0.5) * 25;
    setTilt({ rx, ry, mx, my, active: true });
  };

  const handleMouseLeave = () => {
    setTilt((prev) => ({ ...prev, active: false, rx: 0, ry: 0 }));
  };

  useEffect(() => {
    if (!uri) return;
    setMetaLoading(true);
    setMetaError(null);

    const url = uri.startsWith("ipfs://")
      ? `${CONFIG.IPFS_GATEWAY}${uri.replace("ipfs://", "")}`
      : uri;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setMetadata)
      .catch((e) => setMetaError(e.message))
      .finally(() => setMetaLoading(false));
  }, [uri]);

  const rarity = metadata?.attributes?.find((a) => a.trait_type === "Rarity")?.value;
  const attack = metadata?.attributes?.find((a) => a.trait_type === "Attack")?.value;
  const defense = metadata?.attributes?.find((a) => a.trait_type === "Defense")?.value;
  const theme = RARITY_COLORS[rarity] || RARITY_COLORS.Common;
  const emoji = CARD_EMOJIS[metadata?.name] || "🎴";

  if (compact) {
    return (
      <div
        className="card-tile"
        style={{ borderColor: theme.border, background: theme.bg }}
        title={`Token #${tokenId} — ${metadata?.name || "Loading..."}`}
      >
        <div className="card-tile-emoji">{metaLoading ? "⏳" : emoji}</div>
        <div className="card-tile-id">#{tokenId}</div>
        <div className="card-tile-name">{metadata?.name || (metaLoading ? "…" : "Unknown")}</div>
        {rarity && <div className="card-tile-rarity" style={{ color: theme.border }}>{rarity}</div>}
      </div>
    );
  }

  return (
    <div 
      className="card-3d-wrapper" 
      onClick={() => setFlipped((f) => !f)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={`card-3d ${flipped ? "flipped" : ""}`}
        style={tilt.active ? { transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) ${flipped ? "rotateY(180deg)" : ""}` } : {}}
      >
        {/* FRONT */}
        <div
          className="card-face card-front"
          style={{
            borderColor: theme.border,
            background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, ${theme.bg} 100%)`,
            boxShadow: `0 8px 32px ${theme.glow}, inset 0 0 20px ${theme.bg}`,
          }}
        >
          <div className="card-header">
            <span className="card-id">#{tokenId}</span>
            {rarity && (
              <span className="card-rarity-badge" style={{ background: theme.border, boxShadow: `0 0 10px ${theme.border}` }}>
                {rarity}
              </span>
            )}
          </div>

          <div className="card-artwork">
            {metaLoading ? (
              <LoadingSpinner size="md" />
            ) : metaError ? (
              <div className="card-error">📡<br /><small>Metadata unavailable</small></div>
            ) : (
              <div className="card-emoji-art" style={{ filter: `drop-shadow(0 0 20px ${theme.border})` }}>{emoji}</div>
            )}
          </div>

          <div className="card-name" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}>{metadata?.name || (metaLoading ? "Loading…" : "Unknown")}</div>
          {metadata?.description && (
            <p className="card-desc">{metadata.description}</p>
          )}

          {(attack || defense) && (
            <div className="card-stats">
              {attack  && <div className="card-stat"><span>⚔️ ATK</span><strong>{attack}</strong></div>}
              {defense && <div className="card-stat"><span>🛡️ DEF</span><strong>{defense}</strong></div>}
            </div>
          )}

          <div className="card-footer">
            <span className="card-flip-hint">Click to flip</span>
          </div>
          
          {/* Glare and Foil Overlays */}
          <div 
            className="card-glare" 
            style={{ 
              "--mx": `${tilt.mx}%`, 
              "--my": `${tilt.my}%`, 
              "--glare-op": tilt.active && !flipped ? 1 : 0 
            }} 
          />
          {(rarity === "Legendary" || rarity === "Epic") && (
            <div className="foil-fx" />
          )}
        </div>

        {/* BACK */}
        <div className="card-face card-back" style={{ borderColor: theme.border }}>
          <div className="card-back-title">Token Details</div>
          <div className="card-detail-row">
            <span>Token ID</span>
            <strong>#{tokenId}</strong>
          </div>
          <div className="card-detail-row">
            <span>Owner</span>
            <strong className="monospace">{owner?.slice(0, 8)}…{owner?.slice(-4)}</strong>
          </div>
          <div className="card-detail-row">
            <span>Metadata</span>
            <a
              href={uri?.startsWith("ipfs://")
                ? `${CONFIG.IPFS_GATEWAY}${uri.replace("ipfs://", "")}`
                : uri}
              target="_blank"
              rel="noreferrer"
              className="card-link"
              onClick={(e) => e.stopPropagation()}
            >
              View ↗
            </a>
          </div>
          <div className="card-detail-row">
            <span>Explorer</span>
            <a
              href={`${CONFIG.STELLAR_EXPERT_BASE}/contract/${CONFIG.CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="card-link"
              onClick={(e) => e.stopPropagation()}
            >
              Stellar Expert ↗
            </a>
          </div>

          {onTransfer && (
            <button
              className="btn-card-transfer"
              onClick={(e) => { e.stopPropagation(); onTransfer(tokenId); }}
            >
              Transfer Card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardDisplay;
