import { useState, useEffect, useCallback, useRef } from "react";
import { SorobanRpc } from "@stellar/stellar-sdk";
import CONFIG from "../config";

/**
 * Polls the Stellar RPC for contract events and decodes them.
 * Returns a list of decoded events (newest first).
 *
 * @param {string|null} contractId - The contract ID to filter events for.
 * @param {boolean} enabled - Whether polling is active.
 */
export function useEventStream(contractId = CONFIG.CONTRACT_ID, enabled = true) {
  const [events, setEvents] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  const [lastLedger, setLastLedger] = useState(null);
  const serverRef = useRef(null);
  const timerRef = useRef(null);

  // Initialise the RPC server once
  useEffect(() => {
    serverRef.current = new SorobanRpc.Server(CONFIG.RPC_URL, { allowHttp: false });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchEvents = useCallback(async () => {
    const server = serverRef.current;
    if (!server || !contractId) return;
    setIsPolling(true);
    try {
      // Start from a recent ledger (last known or 5 ledgers back from latest)
      const latest = await server.getLatestLedger();
      const startLedger = lastLedger ? lastLedger + 1 : Math.max(1, latest.sequence - 200);

      const response = await server.getEvents({
        startLedger,
        filters: [
          {
            type: "contract",
            contractIds: [contractId],
            topics: [["*"]], // capture all topics
          },
        ],
        limit: 50,
      });

      if (response.events?.length > 0) {
        const decoded = response.events.map(decodeEvent).filter(Boolean).reverse();
        setEvents((prev) => {
          // Deduplicate by id
          const existing = new Set(prev.map((e) => e.id));
          const fresh = decoded.filter((e) => !existing.has(e.id));
          return [...fresh, ...prev].slice(0, 100); // cap at 100 events
        });
        setLastLedger(latest.sequence);
      } else {
        setLastLedger(latest.sequence);
      }
    } catch (err) {
      // Silently ignore poll errors (network may be intermittently unavailable)
      console.debug("[EventStream] Poll error:", err?.message);
    } finally {
      setIsPolling(false);
    }
  }, [contractId, lastLedger]);

  // Start/stop polling
  useEffect(() => {
    if (!enabled || !contractId) return;

    fetchEvents(); // immediate first fetch
    timerRef.current = setInterval(fetchEvents, CONFIG.EVENT_POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, contractId, fetchEvents]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, isPolling, clearEvents };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function decodeEvent(event) {
  try {
    const topicValues = event.topic?.map((t) => {
      try { return t.value?.() ?? t; } catch { return String(t); }
    }) ?? [];

    const eventType = topicValues[0]?.toString?.() ?? "unknown";
    const tokenId   = event.value?.value?.() ?? event.value;

    return {
      id:        event.id,
      type:      eventType,
      tokenId:   tokenId !== undefined ? String(tokenId) : "—",
      ledger:    event.ledger,
      timestamp: new Date().toLocaleTimeString(),
      raw:       topicValues,
    };
  } catch {
    return null;
  }
}
