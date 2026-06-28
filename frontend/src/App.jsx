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

import "./App.css";

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
    "My Collection":<MyCollection />,
    "Transfer Card":<TransferCard />,
    "Admin Mint":   <AdminMint />,
    "Event Log":    <EventLog />,
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
          {PAGES[activeMenu] ?? (
            <div className="page-container text-center">
              <h2>{activeMenu}</h2>
              <p className="text-gray">This section is coming soon.</p>
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
