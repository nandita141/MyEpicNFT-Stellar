import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import CONFIG from "../config";
import { CardDisplay } from "./CardDisplay";
import { LoadingSpinner } from "./LoadingSpinner";

const PAGE_SIZE = 9;
const RARITY_FILTER = ["All", "Epic", "Rare", "Common", "Legendary"];

/**
 * 🌐 Global Gallery — browse every minted card on the contract.
 */
export function GlobalGallery() {
  const { contract, totalSupply } = useApp();

  const [cards, setCards]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(0);
  const [filter, setFilter]     = useState("All");
  const [metaMap, setMetaMap]   = useState({});
  const [selected, setSelected] = useState(null); // modal

  const totalPages = Math.ceil(totalSupply / PAGE_SIZE);

  const loadPage = useCallback(async (p) => {
    if (!contract) return;
    setLoading(true);
    const start = p * PAGE_SIZE;
    const end   = Math.min(start + PAGE_SIZE, totalSupply);
    const items = [];

    for (let i = start; i < end; i++) {
      try {
        const [ownerRes, uriRes] = await Promise.all([
          contract.owner_of({ token_id: i }),
          contract.token_uri({ token_id: i }),
        ]);
        items.push({ token_id: i, owner: ownerRes.result, uri: uriRes.result });
      } catch {
        // skip burned/missing tokens
      }
    }
    setCards(items);
    setLoading(false);

    // prefetch metadata
    items.forEach(async (c) => {
      if (metaMap[c.token_id] || !c.uri) return;
      try {
        const url = c.uri.startsWith("ipfs://")
          ? `${CONFIG.IPFS_GATEWAY}${c.uri.replace("ipfs://", "")}`
          : c.uri;
        const r = await fetch(url);
        if (r.ok) {
          const meta = await r.json();
          setMetaMap((prev) => ({ ...prev, [c.token_id]: meta }));
        }
      } catch (e) {
        void e; // ignore
      }
      });
  }, [contract, totalSupply, metaMap]);

  useEffect(() => { loadPage(page); }, [page, contract, totalSupply]); // eslint-disable-line

  // Filter by rarity
  const visibleCards = cards.filter((c) => {
    if (filter === "All") return true;
    const meta = metaMap[c.token_id];
    const attrs = meta?.attributes || [];
    const rarity = attrs.find((a) => a.trait_type === "Rarity")?.value;
    return rarity === filter;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>🌐 Global Gallery</h2>
          <p>Browse all {totalSupply} minted Stellar Cards</p>
        </div>
        <div className="gallery-controls">
          <select
            id="gallery-filter-select"
            className="dash-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {RARITY_FILTER.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {!contract ? (
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>Connect your wallet</h3>
          <p>Connect Freighter to browse the global gallery.</p>
        </div>
      ) : totalSupply === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎴</div>
          <h3>No cards minted yet</h3>
          <p>Be the first to mint a Stellar Card!</p>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="collection-loading"><LoadingSpinner size="lg" /><p>Loading cards…</p></div>
          ) : (
            <div className="collection-grid">
              {visibleCards.map((c) => (
                <div key={c.token_id} onClick={() => setSelected(c)} style={{ cursor: "pointer" }}>
                  <CardDisplay
                    tokenId={c.token_id}
                    owner={c.owner}
                    uri={c.uri}
                  />
                </div>
              ))}
              {visibleCards.length === 0 && (
                <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                  <p>No {filter} cards on this page</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="pagination-row">
            <button
              id="gallery-prev-btn"
              className="btn-dash-outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
            >
              ← Prev
            </button>
            <span className="page-label">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              id="gallery-next-btn"
              className="btn-dash-outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <h3>Token #{selected.token_id}</h3>
            <CardDisplay tokenId={selected.token_id} owner={selected.owner} uri={selected.uri} />
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalGallery;
