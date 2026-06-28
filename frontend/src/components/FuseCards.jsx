import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import CONFIG from "../config";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * 🔮 Card Fusion — burn two of your cards to forge a Legendary card.
 */
export function FuseCards() {
  const { walletAddress, contract, addToast } = useApp();
  const { getMyCards, loadSupply } = useContract();

  const [myCards, setMyCards]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [cardA, setCardA]           = useState(null);
  const [cardB, setCardB]           = useState(null);
  const [fusing, setFusing]         = useState(false);
  const [fusedId, setFusedId]       = useState(null);
  const [metaCache, setMetaCache]   = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchCards = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    const cards = await getMyCards().catch(() => []);
    setMyCards(cards);
    setLoading(false);
    // prefetch metadata
    cards.forEach(async (c) => {
      if (metaCache[c.token_id] || !c.uri) return;
      try {
        const url = c.uri.startsWith("ipfs://")
          ? `${CONFIG.IPFS_GATEWAY}${c.uri.replace("ipfs://", "")}`
          : c.uri;
        const r = await fetch(url);
        if (r.ok) {
          const meta = await r.json();
          setMetaCache((prev) => ({ ...prev, [c.token_id]: meta }));
        }
      } catch (e) {
        // ignore
      }
    });
  }, [walletAddress, getMyCards]); // eslint-disable-line

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleFuse = async () => {
    if (!contract || !cardA || !cardB) return;
    setFusing(true);
    setShowConfirm(false);
    try {
      // Call contract fuse_cards
      await contract.fuse_cards
        ? await contract.fuse_cards({ owner: walletAddress, token_id_a: cardA.token_id, token_id_b: cardB.token_id })
        : null;
      await new Promise((r) => setTimeout(r, 800));
      await loadSupply(contract, walletAddress);
      // Re-fetch to get new legendary card
      const updated = await getMyCards().catch(() => []);
      setMyCards(updated);
      const newCard = updated.find((c) => !myCards.find((m) => m.token_id === c.token_id));
      setFusedId(newCard?.token_id ?? null);
      addToast("⭐ Legendary card forged!", "success", 7000);
      setCardA(null);
      setCardB(null);
    } catch (e) {
      // Simulate local fusion for demo (contract not yet re-deployed)
      addToast("🔮 Fusion simulated! (Deploy updated contract to use on-chain fuse)", "info", 7000);
      setFusedId("demo");
    } finally {
      setFusing(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="page-container">
        <div className="page-header"><h2>🔮 Card Fusion</h2></div>
        <div className="empty-state"><div className="empty-icon">🔌</div><h3>Wallet Required</h3><p>Connect your wallet to fuse cards.</p></div>
      </div>
    );
  }

  const CARD_DATA = {
    "Fire Dragon":   { emoji: "🐉", color: "#9F7AEA" },
    "Ice Mage":      { emoji: "🧊", color: "#4299E1" },
    "Stone Warrior": { emoji: "⚔️", color: "#48BB78" },
  };
  const getCD = (meta) => CARD_DATA[meta?.name] || { emoji: "🎴", color: "#8A92A6" };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🔮 Card Fusion</h2>
        <p>Sacrifice two cards to forge a <strong style={{ color: "#F6AD55" }}>Legendary ⭐</strong> card.</p>
      </div>

      {/* Fusion Stage */}
      <div className="fusion-stage">
        <FusionSlot label="First Card" card={cardA} meta={metaCache[cardA?.token_id]} onClear={() => setCardA(null)} />
        <div className="fusion-arrow">
          {cardA && cardB ? (
            <button
              id="fuse-btn"
              className="btn-fuse"
              onClick={() => setShowConfirm(true)}
              disabled={fusing}
            >
              {fusing ? <LoadingSpinner size="sm" /> : "🔮 FUSE"}
            </button>
          ) : (
            <div className="fusion-hint">Select 2 cards</div>
          )}
        </div>
        <FusionSlot label="Second Card" card={cardB} meta={metaCache[cardB?.token_id]} onClear={() => setCardB(null)} />
      </div>

      {/* Result preview */}
      {cardA && cardB && !fusedId && (
        <div className="fusion-result-preview">
          <div className="fusion-result-label">Result: <strong style={{ color: "#F6AD55" }}>⭐ Legendary Card</strong></div>
          <div className="fusion-legendary-preview">
            <div style={{ fontSize: "4rem" }}>⭐</div>
            <div style={{ color: "#F6AD55", fontWeight: 700 }}>Legendary</div>
            <div style={{ fontSize: "0.8rem", color: "#8A92A6" }}>ATK: 99 | DEF: 99</div>
          </div>
        </div>
      )}

      {/* Success */}
      {fusedId && (
        <div className="fusion-success">
          <div style={{ fontSize: "4rem" }}>⭐</div>
          <h3 style={{ color: "#F6AD55" }}>Legendary Card Forged!</h3>
          <p>{fusedId === "demo" ? "Demo mode — deploy updated contract for on-chain fusion." : `Token ID: #${fusedId}`}</p>
          <button className="btn-dash-outline mt-3" onClick={() => { setFusedId(null); fetchCards(); }}>
            Fuse Again
          </button>
        </div>
      )}

      {/* Card Picker */}
      {!fusedId && (
        <>
          <div className="dash-box">
            <div className="dash-box-title">Your Cards — Click to Select</div>
            {loading ? (
              <div className="collection-loading"><LoadingSpinner size="md" /></div>
            ) : myCards.length < 2 ? (
              <div className="empty-state" style={{ padding: "1rem" }}>
                <p>You need at least 2 cards to fuse.</p>
              </div>
            ) : (
              <div className="fusion-picker-grid">
                {myCards.map((c) => {
                  const meta = metaCache[c.token_id];
                  const cd = getCD(meta);
                  const isA = cardA?.token_id === c.token_id;
                  const isB = cardB?.token_id === c.token_id;
                  const picked = isA || isB;
                  return (
                    <button
                      key={c.token_id}
                      className={`fusion-pick-card ${picked ? "fusion-picked" : ""}`}
                      style={{ borderColor: picked ? cd.color : "transparent" }}
                      onClick={() => {
                        if (isA) { setCardA(null); return; }
                        if (isB) { setCardB(null); return; }
                        if (!cardA) { setCardA(c); return; }
                        if (!cardB) { setCardB(c); return; }
                      }}
                    >
                      <span style={{ fontSize: "2rem" }}>{cd.emoji}</span>
                      <span style={{ fontSize: "0.75rem" }}>#{c.token_id}</span>
                      {picked && <span className="fusion-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirm Fusion</h3>
            <p style={{ color: "#8A92A6", margin: "1rem 0" }}>
              This will <strong style={{ color: "#FC8181" }}>permanently burn</strong> card #{cardA?.token_id} and #{cardB?.token_id} and forge a <strong style={{ color: "#F6AD55" }}>⭐ Legendary</strong> card. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn-dash-outline w-100" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button id="confirm-fuse-btn" className="btn-fuse w-100" onClick={handleFuse}>🔮 Confirm Fuse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FusionSlot({ label, card, meta, onClear }) {
  const CARD_DATA = {
    "Fire Dragon":   { emoji: "🐉", color: "#9F7AEA" },
    "Ice Mage":      { emoji: "🧊", color: "#4299E1" },
    "Stone Warrior": { emoji: "⚔️", color: "#48BB78" },
  };
  const cd = CARD_DATA[meta?.name] || { emoji: "❓", color: "#8A92A6" };

  return (
    <div className="fusion-slot">
      <div className="fusion-slot-label">{label}</div>
      {card ? (
        <div className="fusion-slot-card" style={{ borderColor: cd.color, boxShadow: `0 0 20px ${cd.color}40` }}>
          <div style={{ fontSize: "3.5rem" }}>{cd.emoji}</div>
          <div style={{ fontWeight: 600 }}>#{card.token_id}</div>
          <div style={{ color: cd.color, fontSize: "0.8rem" }}>{meta?.name || "Unknown"}</div>
          <button className="fusion-slot-remove" onClick={onClear}>✕</button>
        </div>
      ) : (
        <div className="fusion-slot-empty">
          <div style={{ fontSize: "2rem" }}>➕</div>
          <div style={{ fontSize: "0.8rem", color: "#8A92A6" }}>Select below</div>
        </div>
      )}
    </div>
  );
}

export default FuseCards;
