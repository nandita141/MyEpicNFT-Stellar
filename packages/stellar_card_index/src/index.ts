import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CALV6QCVBAUDEZ3ANOGIUDJAKQTN3ZSY7X5JG5JM3YB4V2KGRCLREJTB",
  }
} as const

export type MktKey = {tag: "Admin", values: void} | {tag: "NftContract", values: void} | {tag: "Listing", values: readonly [u64]};


export interface ListingInfo {
  active: boolean;
  price_stroops: i128;
  seller: string;
  token_id: u64;
}

/**
 * Keys for all contract storage slots.
 */
export type DataKey = {tag: "Admin", values: void} | {tag: "TotalSupply", values: void} | {tag: "Owner", values: readonly [u64]} | {tag: "URI", values: readonly [u64]} | {tag: "Approved", values: readonly [u64]} | {tag: "Burned", values: readonly [u64]} | {tag: "Tier", values: readonly [u64]} | {tag: "FusedCard", values: readonly [u64]};


/**
 * Lightweight card info struct returned by `get_card_info`.
 */
export interface CardInfo {
  burned: boolean;
  owner: string;
  token_id: u64;
  uri: string;
}

/**
 * Card rarity tier
 */
export type CardTier = {tag: "Common", values: void} | {tag: "Rare", values: void} | {tag: "Epic", values: void} | {tag: "Legendary", values: void};

export interface Client {
  /**
   * Construct and simulate a buy_card transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Buy a listed card. Buyer pays XLM to seller; marketplace transfers NFT.
   * `xlm_token`: The Stellar native XLM token contract address.
   */
  buy_card: ({buyer, token_id, xlm_token}: {buyer: string, token_id: u64, xlm_token: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a list_card transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * List a card for sale. The seller must have approved this marketplace contract
   * to transfer the token (via NFT contract's `approve` function).
   * `price_xlm_stroops`: price in stroops (1 XLM = 10_000_000).
   */
  list_card: ({seller, token_id, price_stroops}: {seller: string, token_id: u64, price_stroops: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_listing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get listing details for a token.
   */
  get_listing: ({token_id}: {token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<ListingInfo>>

  /**
   * Construct and simulate a init_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize marketplace with admin and NFT contract address.
   */
  init_market: ({admin, nft_contract}: {admin: string, nft_contract: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a cancel_listing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancel a listing. Only the original seller can cancel.
   */
  cancel_listing: ({seller, token_id}: {seller: string, token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a burn transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Permanently destroy a card. Only the owner can burn.
   * The token ID is marked burned; the supply count does NOT decrease.
   */
  burn: ({owner, token_id}: {owner: string, token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a approve transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Approve `spender` to transfer `token_id` on behalf of the owner.
   * Used by the Marketplace contract for trustless listings.
   */
  approve: ({owner, spender, token_id}: {owner: string, spender: string, token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_tier transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the tier (Common/Rare/Epic/Legendary) of a card.
   */
  get_tier: ({token_id}: {token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<CardTier>>

  /**
   * Construct and simulate a is_fused transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns true if the card was created by fusing two cards.
   */
  is_fused: ({token_id}: {token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a owner_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the current owner address of `token_id`.
   * Panics if token does not exist or has been burned.
   */
  owner_of: ({token_id}: {token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfer a card from `from` to `to`.
   * Caller must be the owner OR an approved spender.
   */
  transfer: ({from, to, token_id}: {from: string, to: string, token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a is_burned transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns true if `token_id` has been burned.
   */
  is_burned: ({token_id}: {token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a token_uri transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the metadata URI of `token_id`.
   */
  token_uri: ({token_id}: {token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a admin_mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Mint a new card with a specific metadata URI. Requires admin authorization.
   * Returns the newly minted Token ID.
   */
  admin_mint: ({to, uri}: {to: string, uri: string}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a fuse_cards transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Fuse two owned cards into a new Legendary card.
   * Both source cards are burned. Returns the new Legendary token ID.
   */
  fuse_cards: ({owner, token_id_a, token_id_b}: {owner: string, token_id_a: u64, token_id_b: u64}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract with an admin address.
   * Can only be called once; panics if already initialized.
   */
  initialize: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a public_mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Public mint — assigns a randomized card URI based on current supply.
   * Requires the recipient to authorize the transaction.
   */
  public_mint: ({to}: {to: string}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_approved transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the approved spender for `token_id`, if any.
   */
  get_approved: ({token_id}: {token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>

  /**
   * Construct and simulate a total_supply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the total number of tokens ever minted (including burned).
   */
  total_supply: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_card_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns owner, URI, token_id, and burned status in a single RPC call.
   * More efficient for frontend card display.
   */
  get_card_info: ({token_id}: {token_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<CardInfo>>

  /**
   * Construct and simulate a batch_public_mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Mint multiple random cards in one transaction (max 5).
   * Returns a list of the newly minted token IDs.
   */
  batch_public_mint: ({to, count}: {to: string, count: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Array<u64>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAINCdXkgYSBsaXN0ZWQgY2FyZC4gQnV5ZXIgcGF5cyBYTE0gdG8gc2VsbGVyOyBtYXJrZXRwbGFjZSB0cmFuc2ZlcnMgTkZULgpgeGxtX3Rva2VuYDogVGhlIFN0ZWxsYXIgbmF0aXZlIFhMTSB0b2tlbiBjb250cmFjdCBhZGRyZXNzLgAAAAAIYnV5X2NhcmQAAAADAAAAAAAAAAVidXllcgAAAAAAABMAAAAAAAAACHRva2VuX2lkAAAABgAAAAAAAAAJeGxtX3Rva2VuAAAAAAAAEwAAAAA=",
        "AAAAAgAAAAAAAAAAAAAABk1rdEtleQAAAAAAAwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAALTmZ0Q29udHJhY3QAAAAAAQAAAAAAAAAHTGlzdGluZwAAAAABAAAABg==",
        "AAAAAAAAAMhMaXN0IGEgY2FyZCBmb3Igc2FsZS4gVGhlIHNlbGxlciBtdXN0IGhhdmUgYXBwcm92ZWQgdGhpcyBtYXJrZXRwbGFjZSBjb250cmFjdAp0byB0cmFuc2ZlciB0aGUgdG9rZW4gKHZpYSBORlQgY29udHJhY3QncyBgYXBwcm92ZWAgZnVuY3Rpb24pLgpgcHJpY2VfeGxtX3N0cm9vcHNgOiBwcmljZSBpbiBzdHJvb3BzICgxIFhMTSA9IDEwXzAwMF8wMDApLgAAAAlsaXN0X2NhcmQAAAAAAAADAAAAAAAAAAZzZWxsZXIAAAAAABMAAAAAAAAACHRva2VuX2lkAAAABgAAAAAAAAANcHJpY2Vfc3Ryb29wcwAAAAAAAAsAAAAA",
        "AAAAAAAAACBHZXQgbGlzdGluZyBkZXRhaWxzIGZvciBhIHRva2VuLgAAAAtnZXRfbGlzdGluZwAAAAABAAAAAAAAAAh0b2tlbl9pZAAAAAYAAAABAAAH0AAAAAtMaXN0aW5nSW5mbwA=",
        "AAAAAAAAADtJbml0aWFsaXplIG1hcmtldHBsYWNlIHdpdGggYWRtaW4gYW5kIE5GVCBjb250cmFjdCBhZGRyZXNzLgAAAAALaW5pdF9tYXJrZXQAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAxuZnRfY29udHJhY3QAAAATAAAAAA==",
        "AAAAAQAAAAAAAAAAAAAAC0xpc3RpbmdJbmZvAAAAAAQAAAAAAAAABmFjdGl2ZQAAAAAAAQAAAAAAAAANcHJpY2Vfc3Ryb29wcwAAAAAAAAsAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAIdG9rZW5faWQAAAAG",
        "AAAAAAAAADZDYW5jZWwgYSBsaXN0aW5nLiBPbmx5IHRoZSBvcmlnaW5hbCBzZWxsZXIgY2FuIGNhbmNlbC4AAAAAAA5jYW5jZWxfbGlzdGluZwAAAAAAAgAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAh0b2tlbl9pZAAAAAYAAAAA",
        "AAAAAAAAAHdQZXJtYW5lbnRseSBkZXN0cm95IGEgY2FyZC4gT25seSB0aGUgb3duZXIgY2FuIGJ1cm4uClRoZSB0b2tlbiBJRCBpcyBtYXJrZWQgYnVybmVkOyB0aGUgc3VwcGx5IGNvdW50IGRvZXMgTk9UIGRlY3JlYXNlLgAAAAAEYnVybgAAAAIAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAIdG9rZW5faWQAAAAGAAAAAA==",
        "AAAAAAAAAHlBcHByb3ZlIGBzcGVuZGVyYCB0byB0cmFuc2ZlciBgdG9rZW5faWRgIG9uIGJlaGFsZiBvZiB0aGUgb3duZXIuClVzZWQgYnkgdGhlIE1hcmtldHBsYWNlIGNvbnRyYWN0IGZvciB0cnVzdGxlc3MgbGlzdGluZ3MuAAAAAAAAB2FwcHJvdmUAAAAAAwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAdzcGVuZGVyAAAAABMAAAAAAAAACHRva2VuX2lkAAAABgAAAAA=",
        "AAAAAAAAADhSZXR1cm5zIHRoZSB0aWVyIChDb21tb24vUmFyZS9FcGljL0xlZ2VuZGFyeSkgb2YgYSBjYXJkLgAAAAhnZXRfdGllcgAAAAEAAAAAAAAACHRva2VuX2lkAAAABgAAAAEAAAfQAAAACENhcmRUaWVy",
        "AAAAAAAAADlSZXR1cm5zIHRydWUgaWYgdGhlIGNhcmQgd2FzIGNyZWF0ZWQgYnkgZnVzaW5nIHR3byBjYXJkcy4AAAAAAAAIaXNfZnVzZWQAAAABAAAAAAAAAAh0b2tlbl9pZAAAAAYAAAABAAAAAQ==",
        "AAAAAAAAAGNSZXR1cm5zIHRoZSBjdXJyZW50IG93bmVyIGFkZHJlc3Mgb2YgYHRva2VuX2lkYC4KUGFuaWNzIGlmIHRva2VuIGRvZXMgbm90IGV4aXN0IG9yIGhhcyBiZWVuIGJ1cm5lZC4AAAAACG93bmVyX29mAAAAAQAAAAAAAAAIdG9rZW5faWQAAAAGAAAAAQAAABM=",
        "AAAAAAAAAFVUcmFuc2ZlciBhIGNhcmQgZnJvbSBgZnJvbWAgdG8gYHRvYC4KQ2FsbGVyIG11c3QgYmUgdGhlIG93bmVyIE9SIGFuIGFwcHJvdmVkIHNwZW5kZXIuAAAAAAAACHRyYW5zZmVyAAAAAwAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAh0b2tlbl9pZAAAAAYAAAAA",
        "AAAAAAAAACtSZXR1cm5zIHRydWUgaWYgYHRva2VuX2lkYCBoYXMgYmVlbiBidXJuZWQuAAAAAAlpc19idXJuZWQAAAAAAAABAAAAAAAAAAh0b2tlbl9pZAAAAAYAAAABAAAAAQ==",
        "AAAAAAAAACdSZXR1cm5zIHRoZSBtZXRhZGF0YSBVUkkgb2YgYHRva2VuX2lkYC4AAAAACXRva2VuX3VyaQAAAAAAAAEAAAAAAAAACHRva2VuX2lkAAAABgAAAAEAAAAQ",
        "AAAAAAAAAG5NaW50IGEgbmV3IGNhcmQgd2l0aCBhIHNwZWNpZmljIG1ldGFkYXRhIFVSSS4gUmVxdWlyZXMgYWRtaW4gYXV0aG9yaXphdGlvbi4KUmV0dXJucyB0aGUgbmV3bHkgbWludGVkIFRva2VuIElELgAAAAAACmFkbWluX21pbnQAAAAAAAIAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAN1cmkAAAAAEAAAAAEAAAAG",
        "AAAAAAAAAHFGdXNlIHR3byBvd25lZCBjYXJkcyBpbnRvIGEgbmV3IExlZ2VuZGFyeSBjYXJkLgpCb3RoIHNvdXJjZSBjYXJkcyBhcmUgYnVybmVkLiBSZXR1cm5zIHRoZSBuZXcgTGVnZW5kYXJ5IHRva2VuIElELgAAAAAAAApmdXNlX2NhcmRzAAAAAAADAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACnRva2VuX2lkX2EAAAAAAAYAAAAAAAAACnRva2VuX2lkX2IAAAAAAAYAAAABAAAABg==",
        "AAAAAAAAAGZJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIGFuIGFkbWluIGFkZHJlc3MuCkNhbiBvbmx5IGJlIGNhbGxlZCBvbmNlOyBwYW5pY3MgaWYgYWxyZWFkeSBpbml0aWFsaXplZC4AAAAAAAppbml0aWFsaXplAAAAAAABAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAA",
        "AAAAAAAAAHtQdWJsaWMgbWludCDigJQgYXNzaWducyBhIHJhbmRvbWl6ZWQgY2FyZCBVUkkgYmFzZWQgb24gY3VycmVudCBzdXBwbHkuClJlcXVpcmVzIHRoZSByZWNpcGllbnQgdG8gYXV0aG9yaXplIHRoZSB0cmFuc2FjdGlvbi4AAAAAC3B1YmxpY19taW50AAAAAAEAAAAAAAAAAnRvAAAAAAATAAAAAQAAAAY=",
        "AAAAAAAAADRSZXR1cm5zIHRoZSBhcHByb3ZlZCBzcGVuZGVyIGZvciBgdG9rZW5faWRgLCBpZiBhbnkuAAAADGdldF9hcHByb3ZlZAAAAAEAAAAAAAAACHRva2VuX2lkAAAABgAAAAEAAAPoAAAAEw==",
        "AAAAAAAAAEJSZXR1cm5zIHRoZSB0b3RhbCBudW1iZXIgb2YgdG9rZW5zIGV2ZXIgbWludGVkIChpbmNsdWRpbmcgYnVybmVkKS4AAAAAAAx0b3RhbF9zdXBwbHkAAAAAAAAAAQAAAAY=",
        "AAAAAAAAAG9SZXR1cm5zIG93bmVyLCBVUkksIHRva2VuX2lkLCBhbmQgYnVybmVkIHN0YXR1cyBpbiBhIHNpbmdsZSBSUEMgY2FsbC4KTW9yZSBlZmZpY2llbnQgZm9yIGZyb250ZW5kIGNhcmQgZGlzcGxheS4AAAAADWdldF9jYXJkX2luZm8AAAAAAAABAAAAAAAAAAh0b2tlbl9pZAAAAAYAAAABAAAH0AAAAAhDYXJkSW5mbw==",
        "AAAAAAAAAGRNaW50IG11bHRpcGxlIHJhbmRvbSBjYXJkcyBpbiBvbmUgdHJhbnNhY3Rpb24gKG1heCA1KS4KUmV0dXJucyBhIGxpc3Qgb2YgdGhlIG5ld2x5IG1pbnRlZCB0b2tlbiBJRHMuAAAAEWJhdGNoX3B1YmxpY19taW50AAAAAAAAAgAAAAAAAAACdG8AAAAAABMAAAAAAAAABWNvdW50AAAAAAAABAAAAAEAAAPqAAAABg==",
        "AAAAAgAAACRLZXlzIGZvciBhbGwgY29udHJhY3Qgc3RvcmFnZSBzbG90cy4AAAAAAAAAB0RhdGFLZXkAAAAACAAAAAAAAAAaVGhlIGFkbWluaXN0cmF0b3IgYWRkcmVzcy4AAAAAAAVBZG1pbgAAAAAAAAAAAAAnVG90YWwgbnVtYmVyIG9mIE5GVHMgZXZlciBtaW50ZWQgKHU2NCkuAAAAAAtUb3RhbFN1cHBseQAAAAABAAAAJE93bmVyIChBZGRyZXNzKSBvZiBhIGdpdmVuIFRva2VuIElELgAAAAVPd25lcgAAAAAAAAEAAAAGAAAAAQAAACxJUEZTL0hUVFAgbWV0YWRhdGEgVVJJIGZvciBhIGdpdmVuIFRva2VuIElELgAAAANVUkkAAAAAAQAAAAYAAAABAAAATUFwcHJvdmVkIHNwZW5kZXIgKEFkZHJlc3MpIGZvciBhIGdpdmVuIFRva2VuIElEIChmb3IgbWFya2V0cGxhY2UgZGVsZWdhdGlvbikuAAAAAAAACEFwcHJvdmVkAAAAAQAAAAYAAAABAAAALVdoZXRoZXIgYSBnaXZlbiB0b2tlbiBoYXMgYmVlbiBidXJuZWQgKGJvb2wpLgAAAAAAAAZCdXJuZWQAAAAAAAEAAAAGAAAAAQAAABxUaWVyIG9mIHRoZSBjYXJkIChDYXJkVGllcikuAAAABFRpZXIAAAABAAAABgAAAAEAAAAnRnVzZWQgY2FyZCAoYm9vbCkgZm9yIGEgZ2l2ZW4gVG9rZW4gSUQuAAAAAAlGdXNlZENhcmQAAAAAAAABAAAABg==",
        "AAAAAQAAADlMaWdodHdlaWdodCBjYXJkIGluZm8gc3RydWN0IHJldHVybmVkIGJ5IGBnZXRfY2FyZF9pbmZvYC4AAAAAAAAAAAAACENhcmRJbmZvAAAABAAAAAAAAAAGYnVybmVkAAAAAAABAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACHRva2VuX2lkAAAABgAAAAAAAAADdXJpAAAAABA=",
        "AAAAAgAAABBDYXJkIHJhcml0eSB0aWVyAAAAAAAAAAhDYXJkVGllcgAAAAQAAAAAAAAAAAAAAAZDb21tb24AAAAAAAAAAAAAAAAABFJhcmUAAAAAAAAAAAAAAARFcGljAAAAAAAAAAAAAAAJTGVnZW5kYXJ5AAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    buy_card: this.txFromJSON<null>,
        list_card: this.txFromJSON<null>,
        get_listing: this.txFromJSON<ListingInfo>,
        init_market: this.txFromJSON<null>,
        cancel_listing: this.txFromJSON<null>,
        burn: this.txFromJSON<null>,
        approve: this.txFromJSON<null>,
        get_tier: this.txFromJSON<CardTier>,
        is_fused: this.txFromJSON<boolean>,
        owner_of: this.txFromJSON<string>,
        transfer: this.txFromJSON<null>,
        is_burned: this.txFromJSON<boolean>,
        token_uri: this.txFromJSON<string>,
        admin_mint: this.txFromJSON<u64>,
        fuse_cards: this.txFromJSON<u64>,
        initialize: this.txFromJSON<null>,
        public_mint: this.txFromJSON<u64>,
        get_approved: this.txFromJSON<Option<string>>,
        total_supply: this.txFromJSON<u64>,
        get_card_info: this.txFromJSON<CardInfo>,
        batch_public_mint: this.txFromJSON<Array<u64>>
  }
}