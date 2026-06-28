import { useApp } from "../context/AppContext";
import { useEventStream } from "../hooks/useEventStream";
import CONFIG from "../config";

const EVENT_ICONS = {
  mint:     { icon: "🌱", color: "#48BB78", label: "Mint"     },
  transfer: { icon: "🔁", color: "#4299E1", label: "Transfer" },
  burn:     { icon: "🔥", color: "#ED8936", label: "Burn"     },
  approve:  { icon: "✅", color: "#9F7AEA", label: "Approve"  },
  unknown:  { icon: "📡", color: "#8A92A6", label: "Event"    },
};

/**
 * Real-time event log — polls the Stellar RPC and displays decoded contract events.
 */
export function EventLog() {
  const { contract } = useApp();
  const enabled = Boolean(contract);
  const { events, isPolling, clearEvents } = useEventStream(CONFIG.CONTRACT_ID, enabled);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>📡 Event Log</h2>
          <p>
            Real-time contract events streamed from the Stellar RPC.
            {isPolling && <span className="polling-badge">● Polling</span>}
          </p>
        </div>
        <button
          id="clear-events-btn"
          className="btn-dash-outline"
          onClick={clearEvents}
          disabled={events.length === 0}
        >
          Clear
        </button>
      </div>

      {!enabled && (
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>Wallet Required</h3>
          <p>Connect your wallet to start streaming contract events.</p>
        </div>
      )}

      {enabled && events.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <h3>{isPolling ? "Listening for events…" : "No events yet"}</h3>
          <p>Mint, transfer, or burn a card to see events appear here.</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="event-log-list">
          {events.map((ev) => {
            const style = EVENT_ICONS[ev.type] || EVENT_ICONS.unknown;
            return (
              <div
                key={ev.id}
                className="event-row"
                style={{ borderLeftColor: style.color }}
              >
                <div className="event-icon" aria-hidden="true">{style.icon}</div>
                <div className="event-body">
                  <div className="event-top">
                    <span
                      className="event-type-badge"
                      style={{ background: `${style.color}22`, color: style.color }}
                    >
                      {style.label}
                    </span>
                    <span className="event-token">Token #{ev.tokenId}</span>
                    <span className="event-time">{ev.timestamp}</span>
                  </div>
                  <div className="event-ledger">Ledger {ev.ledger}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="event-footer">
        <small>
          Polling every {CONFIG.EVENT_POLL_INTERVAL_MS / 1000}s ·{" "}
          <a
            href={`${CONFIG.STELLAR_EXPERT_BASE}/contract/${CONFIG.CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
          >
            View all on Stellar Expert ↗
          </a>
        </small>
      </div>
    </div>
  );
}

export default EventLog;
