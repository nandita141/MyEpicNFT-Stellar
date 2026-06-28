import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import { CardDisplay } from "./CardDisplay";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * Shows all NFTs owned by the connected wallet as flip-cards.
 */
export function MyCollection() {
  const { walletAddress, setActiveMenu } = useApp();
  const { getMyCards } = useContract();

  const [cards, setCards]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);

  const fetchCards = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const result = await getMyCards();
      setCards(result);
    } catch {
      // error already toasted
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [walletAddress, getMyCards]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleTransfer = () => {
    setActiveMenu("Transfer Card");
  };

  if (!walletAddress) {
    return (
      <div className="page-container">
        <div className="page-header"><h2>🃏 My Collection</h2></div>
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>Wallet Not Connected</h3>
          <p>Connect your Freighter wallet to view your NFT collection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🃏 My Collection</h2>
        <p>All NFTs owned by your connected wallet.</p>
        <button
          id="refresh-collection-btn"
          className="btn-dash-outline"
          onClick={fetchCards}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : "↻ Refresh"}
        </button>
      </div>

      {loading && !loaded && (
        <div className="collection-loading">
          <LoadingSpinner size="lg" label="Loading your cards…" />
          <p>Fetching your NFTs from the blockchain…</p>
        </div>
      )}

      {loaded && cards.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎴</div>
          <h3>No Cards Yet</h3>
          <p>You don&apos;t own any Stellar Cards yet. Mint your first one!</p>
          <button
            id="go-mint-from-collection-btn"
            className="btn-dash-gradient"
            onClick={() => setActiveMenu("Mint New Card")}
          >
            Mint a Card
          </button>
        </div>
      )}

      {cards.length > 0 && (
        <div className="collection-grid">
          {cards.map((card) => (
            <CardDisplay
              key={card.token_id}
              tokenId={card.token_id}
              owner={card.owner}
              uri={card.uri}
              onTransfer={handleTransfer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCollection;
