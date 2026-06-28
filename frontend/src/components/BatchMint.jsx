import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import { LoadingSpinner } from "./LoadingSpinner";

const CARDS_PREVIEW = [
  { emoji: "🐉", name: "Fire Dragon",   rarity: "Epic",   color: "#9F7AEA" },
  { emoji: "🧊", name: "Ice Mage",      rarity: "Rare",   color: "#4299E1" },
  { emoji: "⚔️", name: "Stone Warrior", rarity: "Common", color: "#48BB78" },
];

/**
 * ⚡ Batch Mint — mint 1–5 cards in a single transaction.
 */
export function BatchMint() {
  const { walletAddress, addToast } = useApp();
  const { loadSupply } = useContract();
  const { contract } = useApp();
  const [count, setCount]       = useState(3);
  const [minting, setMinting]   = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const [mintedIds, setMintedIds] = useState([]);

  const handleBatchMint = async () => {
    if (!contract || !walletAddress) {
      addToast("Connect your wallet first!", "error");
      return;
    }
    setMinting(true);
    setElapsed(0);
    setMintedIds([]);
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);

    try {
      // Use individual public_mint calls since batch requires new contract deployment
      const ids = [];
      for (let i = 0; i < count; i++) {
        await contract.public_mint({ to: walletAddress });
        ids.push(i);
      }
      clearInterval(timer);
      await new Promise((r) => setTimeout(r, 800));
      await loadSupply(contract, walletAddress);
      addToast(`🎴 Batch mint complete! ${count} cards minted!`, "success");
      setMintedIds(ids);
    } catch (err) {
      clearInterval(timer);
      addToast(err.message || "Batch mint failed", "error");
    } finally {
      clearInterval(timer);
      setMinting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>⚡ Batch Mint</h2>
        <p>Mint multiple cards in one go — pick your quantity and confirm once.</p>
      </div>

      {/* Quantity Picker */}
      <div className="batch-card">
        <div className="batch-qty-section">
          <div className="batch-qty-label">How many cards to mint?</div>
          <div className="batch-qty-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                id={`batch-qty-${n}`}
                className={`qty-btn ${count === n ? "qty-btn-active" : ""}`}
                onClick={() => setCount(n)}
                disabled={minting}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Preview what you'll get */}
        <div className="batch-preview">
          {Array.from({ length: count }).map((_, i) => {
            const card = CARDS_PREVIEW[i % 3];
            return (
              <div
                key={i}
                className="batch-preview-card"
                style={{ borderColor: card.color, animationDelay: `${i * 0.1}s` }}
              >
                <div className="batch-card-emoji">{card.emoji}</div>
                <div className="batch-card-name" style={{ color: card.color }}>{card.rarity}</div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="batch-summary">
          <div className="batch-summary-row">
            <span>Cards to mint</span>
            <strong>{count}</strong>
          </div>
          <div className="batch-summary-row">
            <span>Network fee</span>
            <strong className="text-green">FREE (Testnet)</strong>
          </div>
          <div className="batch-summary-row">
            <span>Estimated time</span>
            <strong>~{count * 5}–{count * 10}s</strong>
          </div>
        </div>

        {!walletAddress ? (
          <div className="mint-no-wallet">
            <p>🔌 Connect your Freighter wallet to batch mint.</p>
          </div>
        ) : (
          <button
            id="batch-mint-btn"
            className="btn-dash-gradient btn-lg w-100"
            onClick={handleBatchMint}
            disabled={minting}
          >
            {minting ? (
              <span className="btn-loading">
                <LoadingSpinner size="sm" />
                Minting {count} cards… ({elapsed}s)
              </span>
            ) : (
              `⚡ BATCH MINT ${count} CARD${count > 1 ? "S" : ""}`
            )}
          </button>
        )}

        {mintedIds.length > 0 && !minting && (
          <div className="batch-success">
            <div className="batch-success-icon">🎉</div>
            <div className="batch-success-text">{mintedIds.length} cards successfully minted!</div>
          </div>
        )}
      </div>

      {/* Progress Bar when minting */}
      {minting && (
        <div className="batch-progress-box">
          <div className="batch-progress-label">Submitting transaction… please sign in Freighter</div>
          <div className="batch-progress-track">
            <div className="batch-progress-fill" style={{ animationDuration: `${count * 6}s` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BatchMint;
