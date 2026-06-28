import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useContract } from "../hooks/useContract";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * Transfer card form — send an NFT from one address to another.
 */
export function TransferCard() {
  const { walletAddress } = useApp();
  const { transfer, transferLoading } = useContract();

  const [from, setFrom]       = useState("");
  const [to, setTo]           = useState("");
  const [tokenId, setTokenId] = useState("");

  // Prefill "from" with connected wallet
  const useMyWallet = () => setFrom(walletAddress || "");

  const handleTransfer = async () => {
    await transfer(from, to, tokenId);
    setFrom(""); setTo(""); setTokenId("");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🔁 Transfer Card</h2>
        <p>Send an NFT from one wallet address to another. The sender must authorize the transaction.</p>
      </div>

      <div className="form-card max-w-lg">
        <div className="qt-input mb-3">
          <label htmlFor="transfer-from">From Address</label>
          <div className="input-row">
            <input
              id="transfer-from"
              type="text"
              placeholder="G…"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            {walletAddress && (
              <button
                className="btn-fill"
                onClick={useMyWallet}
                title="Fill with connected wallet"
              >
                Mine
              </button>
            )}
          </div>
        </div>

        <div className="qt-input mb-3">
          <label htmlFor="transfer-to">To Address</label>
          <input
            id="transfer-to"
            type="text"
            placeholder="G…"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="qt-input mb-4">
          <label htmlFor="transfer-token-id">Token ID</label>
          <input
            id="transfer-token-id"
            type="number"
            min="0"
            placeholder="0"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
        </div>

        <button
          id="confirm-transfer-btn"
          className="btn-dash-primary w-100"
          onClick={handleTransfer}
          disabled={transferLoading || !from || !to || tokenId === ""}
        >
          {transferLoading ? (
            <span className="btn-loading"><LoadingSpinner size="sm" /> Transferring…</span>
          ) : (
            "CONFIRM TRANSFER"
          )}
        </button>

        <div className="form-note mt-3">
          <span>ℹ️</span>
          <p>The sender&apos;s Freighter wallet must be connected and authorize this transfer.</p>
        </div>
      </div>
    </div>
  );
}

export default TransferCard;
