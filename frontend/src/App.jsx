import { useState, useEffect } from "react";
import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";
import { useSorobanReact } from "@soroban-react/core";
import * as Client from "@stellar_card/index.js";
import "./App.css";

// Basic config
const CONTRACT_ID =
  process.env.VITE_CONTRACT_ID ||
  "CAYYKVYVHV3WFNM6CYSL3YB6QPTSDZQNC3MTQR6WM2UAIYGNU2WG5GSD";



function App() {
  const sorobanReact = useSorobanReact();
  const { activeChain, connect, disconnect } = sorobanReact;
  
  const [walletAddress, setWalletAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [yourCards, setYourCards] = useState("-");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Layout State
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [theme, setTheme] = useState("dark");

  // Query States
  const [queryTokenId, setQueryTokenId] = useState("");
  const [tokenOwner, setTokenOwner] = useState("");
  const [tokenUri, setTokenUri] = useState("");
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState(null);

  // Mint States
  const [mintTo, setMintTo] = useState("");
  const [mintUri, setMintUri] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintElapsed, setMintElapsed] = useState(0);

  // Transfer States
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferTokenId, setTransferTokenId] = useState("");

  // Initialize Contract
  useEffect(() => {
    if (!walletAddress) {
      setContract(null);
      return;
    }
    const contractClient = new Client.Client({
      ...Client.networks.testnet,
      rpcUrl: "https://soroban-testnet.stellar.org:443",
      contractId: CONTRACT_ID,
      wallet: {
        address: walletAddress,
        signTransaction: async (xdr) => {
          const res = await signTransaction(xdr, {
            network: "TESTNET",
            networkPassphrase: "Test SDF Network ; September 2015",
            address: walletAddress,
          });
          if (res.error) throw new Error(res.error);
          return res.signedTxXdr;
        },
      },
    });

    setError(null);
    setContract(contractClient);
    loadTotalSupply(contractClient);
  }, [activeChain, walletAddress]);

  const loadTotalSupply = async (client = contract, address = walletAddress) => {
    if (!client) return;
    try {
      const { result } = await client.total_supply();
      setTotalSupply(result);
      
      if (address && result > 0) {
        setYourCards("Loading...");
        let count = 0;
        // Search through all tokens to count balance (works well for testnet)
        for(let i = 0; i < result; i++) {
            try {
               const ownerData = await client.owner_of({ token_id: i });
               if (ownerData.result === address) count++;
            } catch (e) {}
        }
        setYourCards(count);
      } else {
        setYourCards(0);
      }
    } catch (err) {
      console.warn("Supply fetch issue", err);
    }
  };

  const handleConnect = async () => {
    try {
      const connectedResult = await isConnected();
      if (connectedResult.error || !connectedResult.isConnected) {
        setError("Freighter wallet not detected."); return;
      }
      const allowedResult = await isAllowed();
      if (allowedResult.error || !allowedResult.isAllowed) {
        const setAllowedResult = await setAllowed();
        if (setAllowedResult.error || !setAllowedResult.isAllowed) {
          setError("Permission denied."); return;
        }
      }
      const accessResult = await requestAccess();
      if (accessResult.error || !accessResult.address) {
        setError("Unable to retrieve address."); return;
      }

      setWalletAddress(accessResult.address);
      if (sorobanReact?.connectors?.length > 0) {
        await connect({ connector: sorobanReact.connectors[0] });
      } else {
        await connect();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setContract(null);
    setTotalSupply(0);
    setWalletAddress(null);
  };

  const handleQueryToken = async () => {
    if (!contract || !queryTokenId) return;
    try {
      setLoading(true); setError(null);
      const tokenId = parseInt(queryTokenId);
      const ownerResult = await contract.owner_of({ token_id: tokenId });
      const uriResult = await contract.token_uri({ token_id: tokenId });

      setTokenOwner(ownerResult.result);
      setTokenUri(uriResult.result);

      if (uriResult.result?.startsWith("ipfs://")) {
        setMetadataLoading(true);
        try {
          const gateway = `https://ipfs.io/ipfs/${uriResult.result.replace("ipfs://", "")}`;
          const res = await fetch(gateway);
          if (!res.ok) throw new Error("Metadata fetch failed");
          setTokenMetadata(await res.json());
        } catch (e) {
          setMetadataError(e.message);
        } finally {
          setMetadataLoading(false);
        }
      }
    } catch (err) {
      setError(err.message);
      setTokenOwner(""); setTokenUri(""); setTokenMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePublicMint = async () => {
    if (!contract || !walletAddress) { setError("Connect wallet first!"); return; }
    try {
      setMinting(true); setMintElapsed(0); setError(null);
      const start = Date.now();
      const t = setInterval(() => setMintElapsed(Math.floor((Date.now() - start)/1000)), 1000);

      await contract.public_mint({ to: walletAddress });
      clearInterval(t); setMinting(false);
      
      let mintedId = "";
      try {
        await new Promise(r => setTimeout(r, 800));
        const { result: tsAfter } = await contract.total_supply();
        if (typeof tsAfter === "number" && tsAfter > 0) mintedId = String(tsAfter - 1);
      } catch(e) {}

      await loadTotalSupply(contract, walletAddress);
      alert(`Public Mint Successful! ${mintedId ? "Token ID: "+mintedId : ""}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setMinting(false);
    }
  };

  const handleAdminMint = async () => {
    if (!contract || !mintTo || !mintUri) { setError("Fill recipient & URI"); return; }
    try {
      setLoading(true); setError(null);
      const { result } = await contract.admin_mint({ to: mintTo, uri: mintUri });
      await loadTotalSupply(contract, walletAddress);
      alert(`Admin Mint Successful! Token ID: ${result}`);
      setMintTo(""); setMintUri("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!contract || !transferFrom || !transferTo || !transferTokenId) { 
      setError("Fill all transfer fields"); return; 
    }
    try {
      setLoading(true); setError(null);
      await contract.transfer({
        from: transferFrom,
        to: transferTo,
        token_id: parseInt(transferTokenId),
      });
      await loadTotalSupply(contract, walletAddress);
      alert("Transfer Successful!");
      setTransferFrom(""); setTransferTo(""); setTransferTokenId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UI Components
  const SidebarItem = ({ label, icon, active }) => (
    <div 
      className={`sidebar-item ${activeMenu === label ? "active" : ""} ${active === false ? 'disabled' : ''}`}
      onClick={() => active !== false && setActiveMenu(label)}
    >
      <span className="sb-icon">{icon}</span>
      <span className="sb-label">{label}</span>
      {active === false && <span className="sb-badge">Coming Soon</span>}
    </div>
  );

  return (
    <div className={`layout-full ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* LEFT SIDEBAR */}
      <aside className="sidebar-main">
        <div className="sidebar-logo">
          <div className="logo-box">🎴</div>
          <h3>My Epic NFT</h3>
        </div>

        <div className="sidebar-nav">
          <SidebarItem label="Dashboard" icon="📊" />
          <SidebarItem label="Mint New Card" icon="➕" />
          <SidebarItem label="Transfer Card" icon="🔁" />
          <SidebarItem label="Admin Mint" icon="⚙️" />
        </div>

        <div className="sidebar-bottom">
           <div className="wallet-card">
              <div className="wc-header">
                 <div className="wc-icon">🛡️</div>
                 <div>
                   <p className="wc-title">My Wallet</p>
                   <p className="wc-addr">
                     {walletAddress 
                        ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}`
                        : "Not Connected"}
                   </p>
                 </div>
              </div>
              <button 
                className="wc-btn" 
                onClick={walletAddress ? handleDisconnect : handleConnect}
              >
                {walletAddress ? "DISCONNECT" : "CONNECT"}
              </button>
           </div>
           
           <div 
              className="theme-toggle" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{cursor: "pointer"}}
           >
              <span>{theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
              <div className={`toggle-switch ${theme === "dark" ? "active" : ""}`}><div className="toggle-knob"></div></div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-area">
        {/* TOP HEADER */}
        <header className="main-header">
           <div className="greeting">
              <h2>Welcome back! 👋</h2>
              <p>Manage your Stellar Card NFTs with ease.</p>
           </div>
           
           <div className="header-actions">
              <div className="network-pill">
                 <span className="dot"></span>
                 Connected<br/>
                 <strong>{walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : "None"}</strong>
              </div>
              <button className="icon-btn">🔔<span className="badge">3</span></button>
              <button className="icon-btn">👤</button>
           </div>
        </header>

        {error && (
          <div className="global-error">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✖</button>
          </div>
        )}

        <div className="scroll-content">
          {activeMenu === "Dashboard" && (
            <div className="dashboard-grid-complex">
              {/* TOP STATS ROW */}
              <div className="stats-row">
                 <div className="stat-card blue">
                    <div>
                      <p>Total Supply</p>
                      <h3>{totalSupply}</h3>
                      <small>Cards minted</small>
                    </div>
                    <div className="sc-icon">📊</div>
                    <div className="sc-graph"><svg viewBox="0 0 100 30"><path d="M0 30 L20 20 L40 25 L60 10 L80 15 L100 5 L100 30 Z" fill="rgba(66, 153, 225, 0.2)"/><path d="M0 30 L20 20 L40 25 L60 10 L80 15 L100 5" fill="none" stroke="#4299E1" strokeWidth="2"/></svg></div>
                 </div>

                 <div className="stat-card purple">
                    <div>
                      <p>Your Cards</p>
                      <h3>{!walletAddress ? "-" : yourCards}</h3>
                      <small>Owned NFTs</small>
                    </div>
                    <div className="sc-icon">💳</div>
                    <div className="sc-graph"><svg viewBox="0 0 100 30"><path d="M0 30 L20 25 L40 10 L60 20 L80 5 L100 15 L100 30 Z" fill="rgba(159, 122, 234, 0.2)"/><path d="M0 30 L20 25 L40 10 L60 20 L80 5 L100 15" fill="none" stroke="#9F7AEA" strokeWidth="2"/></svg></div>
                 </div>

                 <div className="stat-card orange">
                    <div>
                      <p>Network</p>
                      <h3>Stellar</h3>
                      <small className="orange-text">Testnet</small>
                    </div>
                    <div className="sc-icon">🌐</div>
                    <div className="sc-graph"><svg viewBox="0 0 100 30"><path d="M0 30 L20 25 L40 28 L60 15 L80 20 L100 10 L100 30 Z" fill="rgba(237, 137, 54, 0.2)"/><path d="M0 30 L20 25 L40 28 L60 15 L80 20 L100 10" fill="none" stroke="#ED8936" strokeWidth="2"/></svg></div>
                 </div>
              </div>

              {/* MIDDLE ROW */}
              <div className="middle-row">
                 {/* Contract Overview */}
                 <div className="dash-box">
                    <h3>Contract Overview</h3>
                    <div className="co-item">
                      <span>Contract Address</span>
                      <div className="copy-box">{CONTRACT_ID.slice(0,4)}...{CONTRACT_ID.slice(-4)} 📋</div>
                    </div>
                    <div className="co-item">
                      <span>Token Standard</span>
                      <strong>SCP-005 (Stellar)</strong>
                    </div>
                    <div className="co-item">
                      <span>Decimals</span>
                      <strong>0</strong>
                    </div>
                    <div className="co-item">
                      <span>Last Updated</span>
                      <strong className="text-blue">Just now ↻</strong>
                    </div>
                    <a href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`} target="_blank" rel="noreferrer" className="btn-dash-outline mt-auto text-center">
                      VIEW ON STELLAR EXPERT ↗
                    </a>
                 </div>

                 {/* Query Token */}
                 <div className="dash-box">
                    <h3>Query Token</h3>
                    <div className="qt-input">
                       <label>Token ID</label>
                       <div className="input-wrap">
                          <input type="number" placeholder="Enter Token ID" value={queryTokenId} onChange={e=>setQueryTokenId(e.target.value)} />
                          <span className="icon">🔍</span>
                       </div>
                    </div>
                    <button className="btn-dash-primary w-100" onClick={handleQueryToken} disabled={loading || !queryTokenId}>QUERY TOKEN</button>
                    
                    <div className="qt-result">
                      {!loading && !tokenOwner && !tokenUri && (
                        <div className="qt-empty">
                          <div className="spinner-icon">💠</div>
                          <p>Enter a Token ID to view<br/>card details, metadata,<br/>and current status.</p>
                        </div>
                      )}
                      
                      {(tokenOwner || tokenUri) && (
                         <div className="qt-data">
                           <p><strong>Owner:</strong> {tokenOwner.slice(0,10)}...</p>
                           <p><strong>URI:</strong> {tokenUri.slice(0,15)}...</p>
                           {tokenMetadata && <p><strong>Name:</strong> {tokenMetadata.name}</p>}
                         </div>
                      )}
                    </div>
                 </div>

                 {/* Quick Mint */}
                 <div className="dash-box">
                    <h3>✨ Quick Mint</h3>
                    <div className="qm-buttons mt-3">
                       <button className="btn-dash-gradient w-100 mb-3" onClick={handlePublicMint} disabled={minting}>
                         {minting ? `MINTING (${mintElapsed}s)` : "MINT CARD (PUBLIC)"}
                       </button>
                       <button className="btn-dash-outline w-100" onClick={()=>setActiveMenu("Admin Mint")}>
                         MINT CARD (ADMIN)
                       </button>
                    </div>
                    <p className="qm-desc mt-auto text-center">
                       Create a new Stellar Card NFT<br/>and add it to the blockchain.
                    </p>
                 </div>


              </div>

              {/* BOTTOM ROW */}
              <div className="bottom-row">


                 {/* Helpful Links */}
                 <div className="dash-box links-box">
                    <h3>Helpful Links</h3>
                    <div className="links-list mt-3">
                       <a href="https://stellar.org" target="_blank" rel="noreferrer" className="link-item">
                          <span>🌐 Stellar Network</span>
                          <span className="link-url">stellar.org ↗</span>
                       </a>
                       <a href="https://stellar.expert" target="_blank" rel="noreferrer" className="link-item">
                          <span>🔍 Stellar Expert</span>
                          <span className="link-url">stellar.expert ↗</span>
                       </a>
                       <a href="https://developers.stellar.org/docs/tokens/scp-005" target="_blank" rel="noreferrer" className="link-item">
                          <span>📄 SCP-005 Standard</span>
                          <span className="link-url">developers.stellar.org ↗</span>
                       </a>
                       <a href="https://github.com" target="_blank" rel="noreferrer" className="link-item">
                          <span>💻 GitHub Repository</span>
                          <span className="link-url">github.com ↗</span>
                       </a>
                    </div>
                 </div>
              </div>
              
              <div className="footer-text mt-4 mb-4 text-center">
                 <small>© 2024 Stellar Card NFT. All rights reserved.</small>
              </div>
            </div>
          )}

          {/* OTHER FORMS mapping */}
          {activeMenu === "Admin Mint" && (
             <div className="isolated-form-container">
               <div className="dash-box w-100 max-w-lg">
                  <h2 className="mb-4">Admin Mint</h2>
                  <div className="qt-input mb-3">
                     <label>Recipient Address</label>
                     <input type="text" placeholder="G..." value={mintTo} onChange={e=>setMintTo(e.target.value)} />
                  </div>
                  <div className="qt-input mb-4">
                     <label>Metadata URI (IPFS)</label>
                     <input type="text" placeholder="ipfs://..." value={mintUri} onChange={e=>setMintUri(e.target.value)} />
                  </div>
                  <button className="btn-dash-primary w-100" onClick={handleAdminMint} disabled={loading || !mintTo || !mintUri}>MINT (ADMIN)</button>
               </div>
             </div>
          )}

          {activeMenu === "Transfer Card" && (
             <div className="isolated-form-container">
               <div className="dash-box w-100 max-w-lg">
                  <h2 className="mb-4">Transfer Asset</h2>
                  <div className="qt-input mb-3">
                     <label>From Address</label>
                     <input type="text" placeholder="G..." value={transferFrom} onChange={e=>setTransferFrom(e.target.value)} />
                  </div>
                  <div className="qt-input mb-3">
                     <label>To Address</label>
                     <input type="text" placeholder="G..." value={transferTo} onChange={e=>setTransferTo(e.target.value)} />
                  </div>
                  <div className="qt-input mb-4">
                     <label>Token ID</label>
                     <input type="number" placeholder="0" value={transferTokenId} onChange={e=>setTransferTokenId(e.target.value)} />
                  </div>
                  <button className="btn-dash-primary w-100" onClick={handleTransfer} disabled={loading}>CONFIRM TRANSFER</button>
               </div>
             </div>
          )}

          {activeMenu === "Mint New Card" && (
             <div className="isolated-form-container">
               <div className="dash-box w-100 max-w-lg text-center">
                  <h2 className="mb-3">Mint New Card</h2>
                  <p className="mb-4">Use the public mint function to generate a randomized asset and add it to your connected wallet.</p>
                  <button className="btn-dash-gradient w-100" onClick={handlePublicMint} disabled={minting || !walletAddress}>
                    {minting ? `Minting (${mintElapsed}s)...` : "MINT CARD (PUBLIC)"}
                  </button>
               </div>
             </div>
          )}
          
          {(!["Dashboard", "Admin Mint", "Transfer Card", "Mint New Card"].includes(activeMenu)) && (
            <div className="isolated-form-container">
               <div className="dash-box text-center">
                 <h2 className="mb-3 text-purple">{activeMenu}</h2>
                 <p className="text-gray">This section is currently under construction and will be available soon.</p>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* Global Loader Overlay */}
      {loading && (
        <div className="loader-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default App;
