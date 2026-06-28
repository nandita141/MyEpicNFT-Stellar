import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CardDisplay } from "../components/CardDisplay";

// Mock fetch for IPFS metadata
const MOCK_METADATA = {
  name: "Fire Dragon",
  description: "A legendary fire-breathing dragon",
  attributes: [
    { trait_type: "Rarity", value: "Epic" },
    { trait_type: "Attack", value: "90" },
    { trait_type: "Defense", value: "75" },
  ],
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => MOCK_METADATA,
  });
});

describe("CardDisplay", () => {
  it("renders token ID", () => {
    render(
      <CardDisplay
        tokenId={0}
        owner="GABC1234XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        uri="ipfs://QmUYrFddXf4SpEXWAp6RpSm6XZmwxiDRKLNixt58nuhwAo"
      />
    );
    expect(screen.getByText("#0")).toBeTruthy();
  });

  it("shows metadata name after fetch", async () => {
    render(
      <CardDisplay
        tokenId={1}
        owner="GABC1234XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        uri="ipfs://QmTest1234"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Fire Dragon")).toBeTruthy();
    });
  });

  it("shows rarity badge", async () => {
    render(
      <CardDisplay
        tokenId={2}
        owner="GABC1234XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        uri="ipfs://QmTest1234"
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Epic")).toBeTruthy();
    });
  });

  it("renders compact tile mode", () => {
    render(
      <CardDisplay
        tokenId={3}
        owner="GABC1234XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        uri="ipfs://QmTest"
        compact
      />
    );
    expect(document.querySelector(".card-tile")).toBeTruthy();
  });

  it("shows error message when fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));
    render(
      <CardDisplay
        tokenId={4}
        owner="GABC1234XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        uri="ipfs://QmFail"
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/unavailable/i)).toBeTruthy();
    });
  });
});
