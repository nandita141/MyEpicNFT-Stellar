/**
 * Centralized application configuration.
 * All values are read from environment variables with safe fallbacks.
 */

export const CONFIG = {
  /** The deployed Soroban NFT contract ID */
  CONTRACT_ID:
    (import.meta.env.VITE_CONTRACT_ID ||
    "CB4T7NWMGPN22AI2GZMPJ4OO4W5UR2JFIE46YQ6AVJ7PEE4Z5LOZFX2H").trim(),

  /** Stellar RPC endpoint */
  RPC_URL:
    import.meta.env.VITE_RPC_URL ||
    "https://soroban-testnet.stellar.org:443",

  /** Network label: testnet | mainnet */
  NETWORK: import.meta.env.VITE_NETWORK || "testnet",

  /** Stellar network passphrase */
  NETWORK_PASSPHRASE:
    import.meta.env.VITE_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",

  /** IPFS gateway for fetching metadata */
  IPFS_GATEWAY: "https://ipfs.io/ipfs/",

  /** Stellar Expert explorer base URL */
  STELLAR_EXPERT_BASE: "https://stellar.expert/explorer/testnet",

  /** Testnet faucet URL */
  FAUCET_URL: "https://friendbot.stellar.org",

  /** Event polling interval in milliseconds */
  EVENT_POLL_INTERVAL_MS: 5000,

  /** Max attempts to poll for transaction confirmation */
  TX_POLL_MAX_ATTEMPTS: 60,
};

/**
 * Validate required config at startup (dev mode only).
 */
if (import.meta.env.DEV) {
  if (!CONFIG.CONTRACT_ID) {
    console.warn("[Config] VITE_CONTRACT_ID is not set. Using fallback contract ID.");
  }
}

export default CONFIG;
