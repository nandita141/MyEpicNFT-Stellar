import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import CONFIG from "../config";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * 📤 Share Card — generate shareable URLs and social share buttons.
 * Also auto-loads a card if ?token=X is in the URL on mount.
 */
export function ShareCard() {
  const { addToast, walletAddress } = useApp();
  const { queryToken } = useContract();

  const [tokenId, setTokenId]   = useState("");
  const [cardData, setCardData] = useState(null);
  const [meta, setMeta]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

  // Auto-load from URL query param ?token=X
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) { setTokenId(t); loadCard(t); }
  }, []); // eslint-disable-line

  const loadCard = async (id = tokenId) => {
    if (!id && id !== 0) return;
    setLoading(true);
    setCardData(null);
    setMeta(null);
    try {
      const data = await queryToken(id);
      setCardData({ ...data, token_id: id });
      if (data.uri?.startsWith("ipfs://")) {
        const url = `${CONFIG.IPFS_GATEWAY}${data.uri.replace("ipfs://", "")}`;
        const r = await fetch(url);
        if (r.ok) setMeta(await r.json());
      }
    } catch {
      // error toasted by useContract
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?token=${tokenId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast("🔗 Share link copied!", "success", 3000);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Copy failed — please copy manually.", "error");
    }
  };

  const tweetText = encodeURIComponent(
    `🎴 Check out my Stellar Card NFT! Token #${tokenId} on @StellarOrg Testnet\n${shareUrl}`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  const CARD_EMOJI = {
    "Fire Dragon":    "🐉",
    "Ice Mage":       "🧊",
    "Stone Warrior":  "⚔️",
    "Legendary Card": "⭐",
  };
  const CARD_COLOR = {
    "Fire Dragon":    "#9F7AEA",
    "Ice Mage":       "#4299E1",
    "Stone Warrior":  "#48BB78",
    "Legendary Card": "#F6AD55",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📤 Share Card</h2>
        <p>Generate a shareable link for any token or share your cards on social media.</p>
      </div>

      {/* Token Lookup */}
      <div className="form-card max-w-lg">
        <div className="qt-input mb-3">
          <label htmlFor="share-token-id">Token ID to share</label>
          <div className="input-wrap">
            <input
              id="share-token-id"
              type="number"
              min="0"
              placeholder="Enter Token ID…"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadCard()}
            />
            <span className="icon">🎴</span>
          </div>
        </div>
        <button
          id="share-load-btn"
          className="btn-dash-primary w-100"
          onClick={() => loadCard()}
          disabled={loading || !tokenId}
        >
          {loading ? <LoadingSpinner size="sm" /> : "Load Card"}
        </button>
      </div>

      {/* Card Preview & Share */}
      {cardData && (
        <div className="share-card-box">
          {/* Card Preview */}
          <div
            className="share-card-preview"
            style={{
              borderColor: CARD_COLOR[meta?.name] || "#8A92A6",
              boxShadow: `0 0 40px ${CARD_COLOR[meta?.name] || "#8A92A6"}40`,
            }}
          >
            <div className="share-preview-emoji">
              {CARD_EMOJI[meta?.name] || "🎴"}
            </div>
            <div className="share-preview-name">{meta?.name || `Token #${tokenId}`}</div>
            <div className="share-preview-sub">Token ID #{tokenId}</div>
            {meta?.attributes && (
              <div className="share-preview-attrs">
                {meta.attributes.map((a) => (
                  <div key={a.trait_type} className="share-attr">
                    <span>{a.trait_type}</span>
                    <strong>{a.value}</strong>
                  </div>
                ))}
              </div>
            )}
            <div className="share-preview-owner">
              Owner: <span className="monospace">{cardData.owner?.slice(0, 8)}…{cardData.owner?.slice(-4)}</span>
            </div>
            <div className="share-preview-network">Stellar Testnet · My Epic NFT</div>
          </div>

          {/* Share Actions */}
          <div className="share-actions">
            <div className="share-url-box">
              <div className="share-url-label">Share Link</div>
              <div className="share-url-row">
                <input
                  readOnly
                  value={shareUrl}
                  className="share-url-input"
                  onClick={(e) => e.target.select()}
                />
                <button
                  id="copy-share-link-btn"
                  className={`btn-copy ${copied ? "copied" : ""}`}
                  onClick={copyLink}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="share-buttons">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-share-twitter"
                id="share-twitter-btn"
              >
                𝕏 Share on X (Twitter)
              </a>
              <a
                href={`${CONFIG.STELLAR_EXPERT_BASE}/contract/${CONFIG.CONTRACT_ID}`}
                target="_blank"
                rel="noreferrer"
                className="btn-dash-outline"
                id="share-explorer-btn"
              >
                🔍 View on Stellar Expert
              </a>
            </div>
          </div>
        </div>
      )}

      {/* My Cards — Quick Share */}
      {walletAddress && (
        <div className="dash-box">
          <div className="dash-box-title">💡 Tip</div>
          <p style={{ fontSize: "0.88rem", color: "#8A92A6" }}>
            You can share any token by entering its ID above, even cards you don't own.
            The share link auto-loads the card when someone opens it.
          </p>
        </div>
      )}
    </div>
  );
}

export default ShareCard;
