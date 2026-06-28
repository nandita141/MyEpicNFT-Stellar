import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import CONFIG from "../config";
import { LoadingSpinner } from "./LoadingSpinner";

const RARITY_WEIGHTS = { Legendary: 100, Epic: 40, Rare: 20, Common: 10 };
const RARITY_COLORS  = { Legendary: "#F6AD55", Epic: "#9F7AEA", Rare: "#4299E1", Common: "#48BB78" };

/**
 * 📊 Portfolio Analytics — rich data visualizations for your NFT collection.
 */
export function Analytics() {
  const { walletAddress, totalSupply } = useApp();
  const { getMyCards } = useContract();

  const [cards, setCards]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [metaMap, setMetaMap]     = useState({});


  const fetchAll = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const myCards = await getMyCards();
      setCards(myCards);
      const fetches = myCards.map(async (c) => {
        if (!c.uri) return [c.token_id, null];
        try {
          const url = c.uri.startsWith("ipfs://")
            ? `${CONFIG.IPFS_GATEWAY}${c.uri.replace("ipfs://", "")}`
            : c.uri;
          const r = await fetch(url);
          return [c.token_id, r.ok ? await r.json() : null];
        } catch {
          return [c.token_id, null];
        }
      });
      const results = await Promise.all(fetches);
      setMetaMap(Object.fromEntries(results));
    } finally {
      setLoading(false);
    }
  }, [walletAddress, getMyCards]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (!walletAddress) {
    return (
      <div className="page-container">
        <div className="page-header"><h2>📊 Portfolio Analytics</h2></div>
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>Wallet Required</h3>
          <p>Connect your wallet to view your portfolio analytics.</p>
        </div>
      </div>
    );
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const rarityCount = { Legendary: 0, Epic: 0, Rare: 0, Common: 0 };
  let totalAttack = 0, totalDefense = 0, valueScore = 0;
  const CARD_STATS = {
    "Fire Dragon":    { attack: 90, defense: 75, rarity: "Epic"      },
    "Ice Mage":       { attack: 70, defense: 85, rarity: "Rare"      },
    "Stone Warrior":  { attack: 60, defense: 90, rarity: "Common"    },
    "Legendary Card": { attack: 99, defense: 99, rarity: "Legendary" },
  };

  cards.forEach((c) => {
    const meta = metaMap[c.token_id];
    const stats = CARD_STATS[meta?.name] || CARD_STATS["Stone Warrior"];
    rarityCount[stats.rarity] = (rarityCount[stats.rarity] || 0) + 1;
    totalAttack  += stats.attack;
    totalDefense += stats.defense;
    valueScore   += RARITY_WEIGHTS[stats.rarity] || 10;
  });

  const ownedPct = totalSupply > 0 ? Math.round((cards.length / totalSupply) * 100) : 0;
  const avgAtk   = cards.length > 0 ? Math.round(totalAttack  / cards.length) : 0;
  const avgDef   = cards.length > 0 ? Math.round(totalDefense / cards.length) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📊 Portfolio Analytics</h2>
        <p>Deep insights into your Stellar Card collection.</p>
        <button className="btn-dash-outline" onClick={fetchAll} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : "↻ Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="collection-loading"><LoadingSpinner size="lg" /><p>Analyzing your collection…</p></div>
      ) : (
        <>
          {/* ── Top KPI Row ─── */}
          <div className="analytics-kpi-row">
            <KpiCard label="Total Owned"    value={cards.length}       icon="🃏" color="blue"   />
            <KpiCard label="Value Score"    value={valueScore}         icon="💎" color="purple" />
            <KpiCard label="Avg Attack"     value={`${avgAtk} ⚔️`}    icon="🗡️" color="orange" />
            <KpiCard label="Avg Defense"    value={`${avgDef} 🛡️`}    icon="🛡️" color="green"  />
          </div>

          {/* ── Rarity Pie + Ownership Ring ─── */}
          <div className="analytics-charts-row">
            <div className="dash-box">
              <div className="dash-box-title">Rarity Distribution</div>
              {cards.length === 0 ? (
                <div className="empty-state" style={{ padding: "2rem" }}>
                  <p>No cards yet</p>
                </div>
              ) : (
                <RarityPieChart data={rarityCount} total={cards.length} />
              )}
            </div>

            <div className="dash-box">
              <div className="dash-box-title">Collection Share</div>
              <div className="ring-wrap">
                <RingChart pct={ownedPct} color="#9F7AEA" />
                <div className="ring-label">
                  <strong>{cards.length}</strong>
                  <span>of {totalSupply} total</span>
                </div>
              </div>
              <div className="ring-sub">You own <strong>{ownedPct}%</strong> of all minted cards</div>
            </div>

            <div className="dash-box">
              <div className="dash-box-title">Combat Power</div>
              <div className="combat-bars">
                <StatBar label="Total ATK" value={totalAttack} max={900} color="#9F7AEA" icon="⚔️" />
                <StatBar label="Total DEF" value={totalDefense} max={900} color="#4299E1" icon="🛡️" />
                <StatBar label="Value Score" value={valueScore} max={500} color="#F6AD55" icon="💎" />
              </div>
            </div>
          </div>

          {/* ── Rarity Legend ─── */}
          <div className="dash-box">
            <div className="dash-box-title">Rarity Breakdown</div>
            <div className="rarity-table">
              {Object.entries(rarityCount).map(([rarity, count]) => (
                <div key={rarity} className="rarity-table-row">
                  <div className="rarity-dot" style={{ background: RARITY_COLORS[rarity] }} />
                  <span className="rarity-name">{rarity}</span>
                  <div className="rarity-bar-wrap">
                    <div
                      className="rarity-bar-fill"
                      style={{
                        width: cards.length > 0 ? `${(count / cards.length) * 100}%` : "0%",
                        background: RARITY_COLORS[rarity],
                      }}
                    />
                  </div>
                  <span className="rarity-count">{count} cards</span>
                  <span className="rarity-weight">+{RARITY_WEIGHTS[rarity]} pts each</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
      <div className="sc-icon">{icon}</div>
    </div>
  );
}

function RarityPieChart({ data, total }) {
  const COLORS = RARITY_COLORS;
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  let cumAngle = -90;
  const r = 70, cx = 90, cy = 90;

  const slices = entries.map(([rarity, count]) => {
    const pct   = count / total;
    const angle = pct * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { rarity, count, pct, startAngle: start, endAngle: cumAngle };
  });

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arc = (startDeg, endDeg, r, cx, cy) => {
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="pie-wrap">
      <svg viewBox="0 0 180 180" width="180" height="180">
        {slices.map((s) => (
          <path key={s.rarity} d={arc(s.startAngle, s.endAngle, r, cx, cy)} fill={COLORS[s.rarity]} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        ))}
      </svg>
      <div className="pie-legend">
        {slices.map((s) => (
          <div key={s.rarity} className="pie-leg-item">
            <div className="pie-dot" style={{ background: COLORS[s.rarity] }} />
            <span>{s.rarity}: {s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RingChart({ pct, color }) {
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const dash  = (pct / 100) * circ;
  return (
    <svg viewBox="0 0 140 140" width="140" height="140" className="ring-svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatBar({ label, value, max, color, icon }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="stat-bar-row">
      <div className="stat-bar-label"><span>{icon}</span><span>{label}</span><span className="stat-bar-value">{value}</span></div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default Analytics;
