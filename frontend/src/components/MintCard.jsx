import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * Public mint page with animated card reveal.
 */
export function MintCard() {
  const { walletAddress } = useApp();
  const { publicMint, mintLoading, mintElapsed } = useContract();

  const cards = [
    { name: "Fire Dragon",   emoji: "🐉", rarity: "Epic",   attack: 90, defense: 75, color: "#9F7AEA" },
    { name: "Ice Mage",      emoji: "🧊", rarity: "Rare",   attack: 70, defense: 85, color: "#4299E1" },
    { name: "Stone Warrior", emoji: "⚔️", rarity: "Common", attack: 60, defense: 90, color: "#48BB78" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>✨ Mint New Card</h2>
        <p>
          Mint a randomized Stellar Card NFT directly to your wallet.
          Cards cycle through Fire Dragon, Ice Mage, and Stone Warrior.
        </p>
      </div>

      {/* Preview Grid */}
      <div className="mint-preview-grid">
        {cards.map((c) => (
          <div
            key={c.name}
            className="mint-preview-card"
            style={{ borderColor: c.color, boxShadow: `0 4px 24px ${c.color}40` }}
          >
            <div className="mint-card-emoji">{c.emoji}</div>
            <div className="mint-card-name">{c.name}</div>
            <div className="mint-card-rarity" style={{ color: c.color }}>{c.rarity}</div>
            <div className="mint-card-stats">
              <span>⚔️ {c.attack}</span>
              <span>🛡️ {c.defense}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mint-cta-box">
        {!walletAddress ? (
          <div className="mint-no-wallet">
            <p>🔌 Connect your Freighter wallet to mint cards.</p>
          </div>
        ) : (
          <>
            <button
              id="public-mint-page-btn"
              className="btn-dash-gradient btn-lg w-100"
              onClick={publicMint}
              disabled={mintLoading}
            >
              {mintLoading ? (
                <span className="btn-loading">
                  <LoadingSpinner size="sm" /> Minting… ({mintElapsed}s)
                </span>
              ) : (
                "🎴 MINT RANDOM CARD"
              )}
            </button>
            <p className="mint-note">
              Transaction requires your Freighter wallet signature. No gas fees on testnet.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default MintCard;
