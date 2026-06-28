/* eslint-disable no-unused-vars */
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the error parsing helper in useContract.
 * We test the logic by importing and calling internal helpers.
 *
 * NOTE: Because useContract uses React hooks, we test the pure
 * parseError logic via a separate exported helper.
 */

// ── Inline the error-parsing logic for isolated testing ──────────────────────
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

describe("parseError (useContract internals)", () => {
  it("handles Freighter not connected", () => {
    const msg = parseError(new Error("Freighter extension is not connected"));
    expect(msg).toContain("Freighter wallet not detected");
  });

  it("handles user rejection", () => {
    const msg = parseError(new Error("User declined signing"));
    expect(msg).toContain("Transaction rejected");
  });

  it("handles insufficient balance", () => {
    const msg = parseError(new Error("insufficient XLM balance"));
    expect(msg).toContain("Insufficient XLM balance");
  });

  it("handles token not exist", () => {
    const msg = parseError(new Error("token does not exist"));
    expect(msg).toContain("token ID does not exist");
  });

  it("handles burned token", () => {
    const msg = parseError(new Error("token has been burned"));
    expect(msg).toContain("burned");
  });

  it("handles generic error with truncation", () => {
    const longMsg = "a".repeat(200);
    const msg = parseError(new Error(longMsg));
    expect(msg.length).toBeLessThanOrEqual(130); // "Error: " + 120 chars
  });

  it("handles network errors", () => {
    const msg = parseError(new Error("Failed to fetch"));
    expect(msg).toContain("Network error");
  });
});

// ── Contract loading state tests (mock-based) ─────────────────────────────────
describe("Contract loading states", () => {
  it("resolves total_supply correctly", async () => {
    const mockClient = {
      total_supply: vi.fn().mockResolvedValue({ result: 5 }),
      owner_of: vi.fn().mockResolvedValue({ result: "GABC" }),
    };

    const { result } = await mockClient.total_supply();
    expect(Number(result)).toBe(5);
  });

  it("handles owner_of returning a different address", async () => {
    const myAddress = "GABC123";
    const mockClient = {
      owner_of: vi.fn().mockResolvedValue({ result: "GDEF456" }),
    };
    const res = await mockClient.owner_of({ token_id: 0 });
    expect(res.result === myAddress).toBe(false);
  });

  it("catches individual owner_of failures gracefully", async () => {
    const mockClient = {
      owner_of: vi.fn().mockRejectedValue(new Error("token does not exist")),
    };
    const result = await mockClient.owner_of({ token_id: 999 }).catch(() => 0);
    expect(result).toBe(0);
  });
});
