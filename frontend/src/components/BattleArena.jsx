import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import CONFIG from "../config";
import { LoadingSpinner } from "./LoadingSpinner";

const CARD_DATA = {
  "Fire Dragon":   { emoji: "🐉", attack: 90, defense: 75, rarity: "Epic",   color: "#9F7AEA" },
  "Ice Mage":      { emoji: "🧊", attack: 70, defense: 85, rarity: "Rare",   color: "#4299E1" },
  "Stone Warrior": { emoji: "⚔️", attack: 60, defense: 90, rarity: "Common", color: "#48BB78" },
  "Legendary Card":{ emoji: "⭐", attack: 99, defense: 99, rarity: "Legendary", color: "#F6AD55" },
};

const MAX_HP = 200;

function getCardData(meta) {
  if (!meta) return CARD_DATA["Stone Warrior"];
  return CARD_DATA[meta.name] || CARD_DATA["Stone Warrior"];
}

/**
 * ⚔️ Card Battle Arena — choose two cards and battle!
 */
export function BattleArena() {
  const { walletAddress } = useApp();
  const { getMyCards } = useContract();

  const [myCards, setMyCards]         = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [selectedA, setSelectedA]     = useState(null);
  const [selectedB, setSelectedB]     = useState(null);
  const [battleLog, setBattleLog]     = useState([]);
  const [result, setResult]           = useState(null); // 'A' | 'B' | 'draw'
  const [battling, setBattling]       = useState(false);
  const [hpA, setHpA]                 = useState(MAX_HP);
  const [hpB, setHpB]                 = useState(MAX_HP);
  const [metaCache, setMetaCache]     = useState({});

  // Animation states
  const [animA, setAnimA] = useState("");
  const [animB, setAnimB] = useState("");
  const [dmgA, setDmgA]   = useState(null);
  const [dmgB, setDmgB]   = useState(null);

  useEffect(() => {
    if (!walletAddress) return;
    setLoadingCards(true);
    getMyCards().then((cards) => {
      setMyCards(cards);
      // prefetch metadata
      cards.forEach(async (c) => {
        if (!c.uri || metaCache[c.token_id]) return;
        try {
          const url = c.uri.startsWith("ipfs://")
            ? `${CONFIG.IPFS_GATEWAY}${c.uri.replace("ipfs://", "")}`
            : c.uri;
          const r = await fetch(url);
          if (r.ok) {
            const meta = await r.json();
            setMetaCache((prev) => ({ ...prev, [c.token_id]: meta }));
          }
        } catch {}
      });
    }).finally(() => setLoadingCards(false));
  }, [walletAddress]);

  const doBattle = async () => {
    if (!selectedA || !selectedB) return;
    setBattling(true);
    setBattleLog([]);
    setResult(null);

    const cardA = getCardData(metaCache[selectedA.token_id]);
    const cardB = getCardData(metaCache[selectedB.token_id]);

    let _hpA = MAX_HP, _hpB = MAX_HP;
    const log = [];

    for (let round = 1; round <= 10; round++) {
      const dmgToB = Math.max(0, cardA.attack - cardB.defense / 3 + Math.floor(Math.random() * 20));
      const dmgToA = Math.max(0, cardB.attack - cardA.defense / 3 + Math.floor(Math.random() * 20));
      _hpA = Math.max(0, _hpA - dmgToA);
      _hpB = Math.max(0, _hpB - dmgToB);

      log.push({ round, dmgToA, dmgToB, hpA: _hpA, hpB: _hpB });

      if (_hpA <= 0 || _hpB <= 0) break;
    }

    // Animate rounds
    for (let i = 0; i < log.length; i++) {
      const entry = log[i];
      
      // A attacks B
      setAnimA("lunge-right-active");
      setBattleLog((prev) => [...prev, `Round ${entry.round}: ${cardA.emoji} attacks for ${entry.dmgToB} dmg!`]);
      await new Promise((r) => setTimeout(r, 200));
      
      setAnimB("shake-active");
      setDmgB(`-${entry.dmgToB}`);
      setHpB(entry.hpB);
      await new Promise((r) => setTimeout(r, 500));
      
      setAnimA(""); setAnimB(""); setDmgB(null);
      if (entry.hpB <= 0) break;
      
      await new Promise((r) => setTimeout(r, 200));

      // B attacks A
      setAnimB("lunge-left-active");
      setBattleLog((prev) => [...prev, `${cardB.emoji} counter-attacks for ${entry.dmgToA} dmg!`]);
      await new Promise((r) => setTimeout(r, 200));
      
      setAnimA("shake-active");
      setDmgA(`-${entry.dmgToA}`);
      setHpA(entry.hpA);
      await new Promise((r) => setTimeout(r, 500));
      
      setAnimB(""); setAnimA(""); setDmgA(null);
      await new Promise((r) => setTimeout(r, 200));
    }

    const finalHpA = log[log.length - 1]?.hpA ?? MAX_HP;
    const finalHpB = log[log.length - 1]?.hpB ?? MAX_HP;
    if (finalHpA > finalHpB) setResult("A");
    else if (finalHpB > finalHpA) setResult("B");
    else setResult("draw");

    setBattling(false);
  };

  const resetBattle = () => {
    setResult(null);
    setBattleLog([]);
    setHpA(MAX_HP);
    setHpB(MAX_HP);
    setAnimA("");
    setAnimB("");
    setDmgA(null);
    setDmgB(null);
  };

  if (!walletAddress) {
    return (
      <div className="page-container">
        <div className="page-header"><h2>⚔️ Battle Arena</h2></div>
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>Wallet Required</h3>
          <p>Connect your Freighter wallet to battle your cards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>⚔️ Battle Arena</h2>
        <p>Choose two of your cards and battle! Stats determine the winner.</p>
      </div>

      {/* Card Selector */}
      {loadingCards ? (
        <div className="collection-loading"><LoadingSpinner size="md" /><p>Loading your cards…</p></div>
      ) : myCards.length < 2 ? (
        <div className="empty-state">
          <div className="empty-icon">🃏</div>
          <h3>You need at least 2 cards to battle</h3>
          <p>Mint more cards to unlock the Battle Arena!</p>
        </div>
      ) : (
        <>
          <div className="battle-selector-row">
            <CardSelector
              label="Your Challenger"
              cards={myCards}
              selected={selectedA}
              exclude={selectedB?.token_id}
              onSelect={setSelectedA}
              metaCache={metaCache}
            />
            <div className="battle-vs">VS</div>
            <CardSelector
              label="Your Opponent"
              cards={myCards}
              selected={selectedB}
              exclude={selectedA?.token_id}
              onSelect={setSelectedB}
              metaCache={metaCache}
            />
          </div>

          {/* Battle Stage */}
          {selectedA && selectedB && (
            <div className="battle-stage">
              <BattleFighter 
                card={selectedA} meta={metaCache[selectedA.token_id]} hp={hpA} maxHp={MAX_HP} 
                side="left" winner={result === "A"} loser={result === "B"} 
                animClass={animA} dmgText={dmgA}
              />
              <div className="battle-middle">
                {!result && !battling && (
                  <button id="start-battle-btn" className="btn-battle" onClick={doBattle}>
                    ⚔️ FIGHT!
                  </button>
                )}
                {battling && <div className="battle-clash">⚡</div>}
                {result && (
                  <div className="battle-result-box">
                    <div className="battle-result-emoji">
                      {result === "A" ? "🏆" : result === "B" ? "💀" : "🤝"}
                    </div>
                    <div className="battle-result-text">
                      {result === "A" ? "Your Challenger Wins!" : result === "B" ? "Your Opponent Wins!" : "Draw!"}
                    </div>
                    <button className="btn-dash-outline mt-3" onClick={resetBattle}>
                      ↻ Battle Again
                    </button>
                  </div>
                )}
              </div>
              <BattleFighter 
                card={selectedB} meta={metaCache[selectedB.token_id]} hp={hpB} maxHp={MAX_HP} 
                side="right" winner={result === "B"} loser={result === "A"} 
                animClass={animB} dmgText={dmgB}
              />
            </div>
          )}

          {/* Battle Log */}
          {battleLog.length > 0 && (
            <div className="battle-log-box">
              <h3>📜 Battle Log</h3>
              <div className="battle-log-entries">
                {battleLog.map((line, i) => (
                  <div key={i} className="battle-log-line">{line}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CardSelector({ label, cards, selected, exclude, onSelect, metaCache }) {
  return (
    <div className="battle-selector">
      <div className="battle-selector-label">{label}</div>
      <div className="battle-card-list">
        {cards.filter((c) => c.token_id !== exclude).map((c) => {
          const meta = metaCache[c.token_id];
          const data = getCardData(meta);
          return (
            <button
              key={c.token_id}
              className={`battle-card-pick ${selected?.token_id === c.token_id ? "picked" : ""}`}
              style={{ borderColor: selected?.token_id === c.token_id ? data.color : "transparent" }}
              onClick={() => onSelect(c)}
            >
              <span>{data.emoji}</span>
              <span>#{c.token_id}</span>
              <span style={{ fontSize: "0.7rem", color: data.color }}>{data.rarity}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BattleFighter({ card, meta, hp, maxHp, side, winner, loser, animClass, dmgText }) {
  const data = getCardData(meta);
  const hpPct = Math.max(0, Math.round((hp / maxHp) * 100));
  const hpColor = hpPct > 60 ? "#10b981" : hpPct > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative" }}>
      <div 
        className={`battle-fighter ${winner ? "winner-glow" : ""} ${loser ? "loser-fade" : ""} ${animClass}`}
        style={{
          background: winner ? `radial-gradient(circle at center, rgba(246,173,85,0.2) 0%, rgba(255,255,255,0.03) 100%)` : `rgba(255,255,255,0.03)`,
          transform: winner ? "scale(1.05)" : loser ? "scale(0.95)" : "scale(1)",
          boxShadow: winner ? `0 0 40px ${data.color}` : "none",
          borderColor: winner ? data.color : "var(--border)"
        }}
      >
        <div className="fighter-emoji" style={{ filter: `drop-shadow(0 0 20px ${data.color})` }}>
          {data.emoji}
        </div>
        <div className="fighter-name" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}>{meta?.name || `Card #${card.token_id}`}</div>
        <div className="fighter-rarity" style={{ color: data.color }}>{data.rarity}</div>
        <div className="fighter-stats">
          <span>⚔️ {data.attack}</span>
          <span>🛡️ {data.defense}</span>
        </div>
        <div className="hp-bar-wrap mt-3">
          <div className="hp-label" style={{ fontFamily: "var(--font-display)" }}>HP {hp}/{maxHp}</div>
          <div className="hp-bar-track">
            <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor, boxShadow: `0 0 10px ${hpColor}` }} />
          </div>
        </div>
      </div>
      
      {/* Floating Damage Text Overlay */}
      {dmgText && (
        <div className="floating-dmg-container">
          <div className="floating-dmg">{dmgText}</div>
        </div>
      )}
    </div>
  );
}

export default BattleArena;
