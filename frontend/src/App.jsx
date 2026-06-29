import { useEffect } from "react";
import {
  isConnected, isAllowed, setAllowed, requestAccess, signTransaction,
} from "@stellar/freighter-api";
import { useSorobanReact } from "@soroban-react/core";
import * as Client from "@stellar_card/index.js";

import { AppProvider, useApp } from "./context/AppContext";
import { useContract } from "./hooks/useContract";
import CONFIG from "./config";

import { Sidebar }        from "./components/Sidebar";
import { Header }         from "./components/Header";
import { ToastContainer } from "./components/Toast";
import { Dashboard }      from "./components/Dashboard";
import { MintCard }       from "./components/MintCard";
import { AdminMint }      from "./components/AdminMint";
import { TransferCard }   from "./components/TransferCard";
import { MyCollection }   from "./components/MyCollection";
import { EventLog }       from "./components/EventLog";
import { BattleArena }    from "./components/BattleArena";
import { Analytics }      from "./components/Analytics";
import { GlobalGallery }  from "./components/GlobalGallery";
import { BatchMint }      from "./components/BatchMint";
import { FuseCards }      from "./components/FuseCards";
import { ActivityFeed }   from "./components/ActivityFeed";
import { ShareCard }      from "./components/ShareCard";

import "./App.css";

// ─────────────────────────────────────────────────────────────────────────────
// Welcome Screen (Disconnected State)
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeScreen({ onConnect }) {
  return (
    <div className="welcome-screen" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem'
    }}>
      <div className="logo-box" style={{ width: '80px', height: '80px', fontSize: '3rem', marginBottom: '1.5rem', margin: '0 auto' }}>
        🌌
      </div>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Welcome to Stellar Card
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2.5rem', lineHeight: '1.8' }}>
        Step into the arena! Mint unique Soroban NFT cards, fuse them into legendary tiers, and battle other players on the Stellar network.
      </p>
      <button className="btn-dash-primary" onClick={onConnect} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
        CONNECT WALLET TO BEGIN
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner App — uses context
// ─────────────────────────────────────────────────────────────────────────────
function AppInner() {
  const sorobanReact = useSorobanReact();
  const { connect, disconnect, activeChain } = sorobanReact;

  const {
    walletAddress, setWalletAddress,
    setContract,
    theme,
    activeMenu,
    addToast,
  } = useApp();

  const { loadSupply } = useContract();

  // ── Initialise contract client when wallet connects ──────────────────────
  useEffect(() => {
    if (!walletAddress) { setContract(null); return; }

    const contractClient = new Client.Client({
      ...Client.networks.testnet,
      rpcUrl: CONFIG.RPC_URL,
      contractId: CONFIG.CONTRACT_ID,
      wallet: {
        address: walletAddress,
        signTransaction: async (xdr) => {
          const res = await signTransaction(xdr, {
            network: "TESTNET",
            networkPassphrase: CONFIG.NETWORK_PASSPHRASE,
            address: walletAddress,
          });
          if (res.error) throw new Error(res.error);
          return res.signedTxXdr;
        },
      },
    });

    setContract(contractClient);
    loadSupply(contractClient, walletAddress);
  }, [walletAddress, activeChain]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wallet handlers ───────────────────────────────────────────────────────
  const handleConnect = async () => {
    try {
      const connRes = await isConnected();
      if (connRes.error || !connRes.isConnected) {
        addToast("Freighter wallet not detected. Please install the extension.", "error", 8000);
        return;
      }
      const allowRes = await isAllowed();
      if (allowRes.error || !allowRes.isAllowed) {
        const setRes = await setAllowed();
        if (setRes.error || !setRes.isAllowed) {
          addToast("Permission denied by Freighter.", "error"); return;
        }
      }
      const accessRes = await requestAccess();
      if (accessRes.error || !accessRes.address) {
        addToast("Could not retrieve wallet address.", "error"); return;
      }
      setWalletAddress(accessRes.address);
      if (sorobanReact?.connectors?.length > 0) {
        await connect({ connector: sorobanReact.connectors[0] });
      } else {
        await connect();
      }
      addToast("Wallet connected!", "success", 3000);
    } catch (err) {
      addToast(`Connection failed: ${err.message}`, "error");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setContract(null);
    setWalletAddress(null);
    addToast("Wallet disconnected.", "info", 2500);
  };

  // ── Page routing ──────────────────────────────────────────────────────────
  const PAGES = {
    "Dashboard":    <Dashboard />,
    "Mint New Card":<MintCard />,
    "Batch Mint":   <BatchMint />,
    "My Collection":<MyCollection />,
    "Transfer Card":<TransferCard />,
    "Admin Mint":   <AdminMint />,
    "Event Log":    <EventLog />,
    "Battle Arena": <BattleArena />,
    "Analytics":    <Analytics />,
    "Gallery":      <GlobalGallery />,
    "Fuse Cards":   <FuseCards />,
    "Activity Feed":<ActivityFeed />,
    "Share Card":   <ShareCard />,
  };

  return (
    <div className={`layout-full ${theme === "light" ? "light-theme" : ""}`}>
      <Sidebar
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="main-area" id="main-content">
        <Header walletAddress={walletAddress} />

        <div className="scroll-content">
          {!walletAddress ? (
            <WelcomeScreen onConnect={handleConnect} />
          ) : PAGES[activeMenu] ? (
            PAGES[activeMenu]
          ) : (
            <div className="page-container text-center" style={{ padding: '10vh 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>🚧</div>
              <h2>{activeMenu}</h2>
              <p className="text-gray" style={{ marginTop: '10px' }}>This section is currently under construction. Check back soon!</p>
            </div>
          )}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export — wraps with context provider
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;
