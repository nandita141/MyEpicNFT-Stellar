import { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";

/**
 * Custom hook that wraps all contract interactions.
 * Provides unified loading state, error handling, and toast feedback.
 */
export function useContract() {
  const { contract, walletAddress, addToast, setTotalSupply, setYourCards } = useApp();
  const [loading, setLoading]   = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [mintElapsed, setMintElapsed] = useState(0);
  const [queryLoading, setQueryLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  /** Load total supply and calculate user-owned count */
  const loadSupply = useCallback(async (client = contract, address = walletAddress) => {
    if (!client) return;
    try {
      const { result } = await client.total_supply();
      const count = Number(result);
      setTotalSupply(count);

      if (address && count > 0) {
        setYourCards("...");
        const checks = Array.from({ length: count }, (_, i) =>
          client.owner_of({ token_id: i })
            .then((r) => (r.result === address ? 1 : 0))
            .catch(() => 0)
        );
        const owned = (await Promise.all(checks)).reduce((a, b) => a + b, 0);
        setYourCards(owned);
      } else {
        setYourCards(0);
      }
    } catch (err) {
      console.warn("loadSupply failed:", err);
    }
  }, [contract, walletAddress, setTotalSupply, setYourCards]);

  /** Query a specific token's owner and URI */
  const queryToken = useCallback(async (tokenId) => {
    if (!contract) throw new Error("Contract not initialised");
    setQueryLoading(true);
    try {
      const [ownerRes, uriRes] = await Promise.all([
        contract.owner_of({ token_id: Number(tokenId) }),
        contract.token_uri({ token_id: Number(tokenId) }),
      ]);
      return { owner: ownerRes.result, uri: uriRes.result };
    } catch (err) {
      const msg = parseError(err);
      addToast(msg, "error");
      throw err;
    } finally {
      setQueryLoading(false);
    }
  }, [contract, addToast]);

  /** Get all tokens owned by address */
  const getMyCards = useCallback(async (address = walletAddress) => {
    if (!contract || !address) return [];
    const { result: total } = await contract.total_supply();
    const count = Number(total);
    if (count === 0) return [];

    const infoPromises = Array.from({ length: count }, async (_, i) => {
      try {
        const ownerRes = await contract.owner_of({ token_id: i });
        if (ownerRes.result !== address) return null;
        const uriRes = await contract.token_uri({ token_id: i });
        return { token_id: i, owner: ownerRes.result, uri: uriRes.result };
      } catch {
        return null;
      }
    });
    const results = await Promise.all(infoPromises);
    return results.filter(Boolean);
  }, [contract, walletAddress]);

  /** Public mint */
  const publicMint = useCallback(async () => {
    if (!contract || !walletAddress) {
      addToast("Connect your wallet first!", "error");
      return;
    }
    setMintLoading(true);
    setMintElapsed(0);
    const start = Date.now();
    const timer = setInterval(() => setMintElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    try {
      await contract.public_mint({ to: walletAddress });
      clearInterval(timer);
      await new Promise((r) => setTimeout(r, 800));
      await loadSupply();
      addToast("🎴 Card minted successfully!", "success");
    } catch (err) {
      clearInterval(timer);
      const msg = parseError(err);
      addToast(msg, "error");
      throw err;
    } finally {
      clearInterval(timer);
      setMintLoading(false);
      setMintElapsed(0);
    }
  }, [contract, walletAddress, addToast, loadSupply]);

  /** Admin mint */
  const adminMint = useCallback(async (to, uri) => {
    if (!contract) { addToast("Contract not connected", "error"); return; }
    if (!to || !uri) { addToast("Recipient address and URI are required", "warning"); return; }
    setLoading(true);
    try {
      const { result } = await contract.admin_mint({ to, uri });
      await loadSupply();
      addToast(`✅ Admin mint successful! Token ID: ${result ?? "?"}`, "success");
      return result;
    } catch (err) {
      const msg = parseError(err);
      addToast(msg, "error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract, addToast, loadSupply]);

  /** Transfer */
  const transfer = useCallback(async (from, to, tokenId) => {
    if (!contract) { addToast("Contract not connected", "error"); return; }
    if (!from || !to || tokenId === "") { addToast("Fill in all transfer fields", "warning"); return; }
    setTransferLoading(true);
    try {
      await contract.transfer({ from, to, token_id: Number(tokenId) });
      await loadSupply();
      addToast("🔁 Transfer successful!", "success");
    } catch (err) {
      const msg = parseError(err);
      addToast(msg, "error");
      throw err;
    } finally {
      setTransferLoading(false);
    }
  }, [contract, addToast, loadSupply]);

  return {
    loading, mintLoading, mintElapsed, queryLoading, transferLoading,
    loadSupply, queryToken, getMyCards, publicMint, adminMint, transfer,
  };
}

/**
 * Convert raw contract/network errors into user-friendly messages.
 */
function parseError(err) {
  const msg = err?.message || String(err);
  if (msg.includes("Freighter") || msg.includes("not connected"))
    return "Freighter wallet not detected. Please install or unlock it.";
  if (msg.includes("User declined") || msg.includes("rejected"))
    return "Transaction rejected by user.";
  if (msg.includes("insufficient") || msg.includes("balance"))
    return "Insufficient XLM balance. Visit the testnet faucet to fund your wallet.";
  if (msg.includes("token does not exist"))
    return "That token ID does not exist.";
  if (msg.includes("not the owner"))
    return "You do not own this token.";
  if (msg.includes("burned"))
    return "This token has been burned.";
  if (msg.includes("already been initialized"))
    return "Contract is already initialized.";
  if (msg.includes("NetworkError") || msg.includes("Failed to fetch"))
    return "Network error — check your connection and try again.";
  return `Error: ${msg.slice(0, 120)}`;
}
