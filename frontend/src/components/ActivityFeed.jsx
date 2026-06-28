import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useEventStream } from "../hooks/useEventStream";
import CONFIG from "../config";
import { LoadingSpinner } from "./LoadingSpinner";

const EVENT_ICONS = {
  mint:     { icon: "🌱", color: "#48BB78", label: "Mint"     },
  transfer: { icon: "🔁", color: "#4299E1", label: "Transfer" },
  burn:     { icon: "🔥", color: "#ED8936", label: "Burn"     },
  approve:  { icon: "✅", color: "#9F7AEA", label: "Approve"  },
  unknown:  { icon: "📡", color: "#8A92A6", label: "Event"    },
};

/**
 * 🕒 Activity Feed — per-token history + global on-chain activity stream.
 */
export function ActivityFeed() {
  const { contract } = useApp();
  const { events, isPolling, clearEvents } = useEventStream(CONFIG.CONTRACT_ID, Boolean(contract));

  const [filterTokenId, setFilterTokenId] = useState("");
  const [filterType, setFilterType]       = useState("All");

  const filtered = events.filter((ev) => {
    const matchId   = !filterTokenId || ev.tokenId === filterTokenId;
    const matchType = filterType === "All" || ev.type === filterType.toLowerCase();
    return matchId && matchType;
  });

  // Group events by token ID for the timeline view
  const byToken = {};
  filtered.forEach((ev) => {
    if (!byToken[ev.tokenId]) byToken[ev.tokenId] = [];
    byToken[ev.tokenId].push(ev);
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>🕒 Activity Feed</h2>
          <p>
            On-chain history for all contract events.
            {isPolling && <span className="polling-badge">● Live</span>}
          </p>
        </div>
        <button className="btn-dash-outline" onClick={clearEvents} disabled={events.length === 0}>
          Clear
        </button>
      </div>

      {/* Filters */}
      <div className="activity-filters">
        <div className="input-wrap" style={{ flex: 1 }}>
          <input
            type="number"
            id="activity-filter-token"
            placeholder="Filter by Token ID…"
            value={filterTokenId}
            onChange={(e) => setFilterTokenId(e.target.value)}
          />
          <span className="icon">🎴</span>
        </div>
        <select
          id="activity-filter-type"
          className="dash-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          {["All", "Mint", "Transfer", "Burn", "Approve"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {!contract ? (
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>Wallet Required</h3>
          <p>Connect your wallet to stream on-chain activity.</p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{isPolling ? "📡" : "💤"}</div>
          <h3>{isPolling ? "Listening for events…" : "No events yet"}</h3>
          <p>Mint, transfer, or burn a card to see activity here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No events match your filters.</p>
        </div>
      ) : (
        <div className="activity-timeline">
          {filtered.map((ev) => {
            const style = EVENT_ICONS[ev.type] || EVENT_ICONS.unknown;
            return (
              <div key={ev.id} className="activity-event-row" style={{ borderLeftColor: style.color }}>
                <div className="activity-event-icon" style={{ background: `${style.color}20`, color: style.color }}>
                  {style.icon}
                </div>
                <div className="activity-event-body">
                  <div className="activity-event-top">
                    <span className="event-type-badge" style={{ background: `${style.color}22`, color: style.color }}>
                      {style.label}
                    </span>
                    <span className="event-token">Token #{ev.tokenId}</span>
                    <span className="event-time">{ev.timestamp}</span>
                  </div>
                  <div className="activity-event-ledger">
                    <span>Ledger {ev.ledger}</span>
                    <a
                      href={`${CONFIG.STELLAR_EXPERT_BASE}/contract/${CONFIG.CONTRACT_ID}`}
                      target="_blank"
                      rel="noreferrer"
                      className="card-link"
                    >
                      Explorer ↗
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="event-footer">
        <small>
          {events.length} events loaded · Polling every {CONFIG.EVENT_POLL_INTERVAL_MS / 1000}s
        </small>
      </div>
    </div>
  );
}

export default ActivityFeed;
