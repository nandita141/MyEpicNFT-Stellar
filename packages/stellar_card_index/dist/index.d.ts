import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128, Option } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CALV6QCVBAUDEZ3ANOGIUDJAKQTN3ZSY7X5JG5JM3YB4V2KGRCLREJTB";
    };
};
export type MktKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "NftContract";
    values: void;
} | {
    tag: "Listing";
    values: readonly [u64];
};
export interface ListingInfo {
    active: boolean;
    price_stroops: i128;
    seller: string;
    token_id: u64;
}
/**
 * Keys for all contract storage slots.
 */
export type DataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "TotalSupply";
    values: void;
} | {
    tag: "Owner";
    values: readonly [u64];
} | {
    tag: "URI";
    values: readonly [u64];
} | {
    tag: "Approved";
    values: readonly [u64];
} | {
    tag: "Burned";
    values: readonly [u64];
} | {
    tag: "Tier";
    values: readonly [u64];
} | {
    tag: "FusedCard";
    values: readonly [u64];
};
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
export type CardTier = {
    tag: "Common";
    values: void;
} | {
    tag: "Rare";
    values: void;
} | {
    tag: "Epic";
    values: void;
} | {
    tag: "Legendary";
    values: void;
};
export interface Client {
    /**
     * Construct and simulate a buy_card transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Buy a listed card. Buyer pays XLM to seller; marketplace transfers NFT.
     * `xlm_token`: The Stellar native XLM token contract address.
     */
    buy_card: ({ buyer, token_id, xlm_token }: {
        buyer: string;
        token_id: u64;
        xlm_token: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a list_card transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * List a card for sale. The seller must have approved this marketplace contract
     * to transfer the token (via NFT contract's `approve` function).
     * `price_xlm_stroops`: price in stroops (1 XLM = 10_000_000).
     */
    list_card: ({ seller, token_id, price_stroops }: {
        seller: string;
        token_id: u64;
        price_stroops: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_listing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get listing details for a token.
     */
    get_listing: ({ token_id }: {
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<ListingInfo>>;
    /**
     * Construct and simulate a init_market transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize marketplace with admin and NFT contract address.
     */
    init_market: ({ admin, nft_contract }: {
        admin: string;
        nft_contract: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a cancel_listing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Cancel a listing. Only the original seller can cancel.
     */
    cancel_listing: ({ seller, token_id }: {
        seller: string;
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a burn transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Permanently destroy a card. Only the owner can burn.
     * The token ID is marked burned; the supply count does NOT decrease.
     */
    burn: ({ owner, token_id }: {
        owner: string;
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a approve transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Approve `spender` to transfer `token_id` on behalf of the owner.
     * Used by the Marketplace contract for trustless listings.
     */
    approve: ({ owner, spender, token_id }: {
        owner: string;
        spender: string;
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_tier transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Returns the tier (Common/Rare/Epic/Legendary) of a card.
     */
    get_tier: ({ token_id }: {
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<CardTier>>;
    /**
     * Construct and simulate a is_fused transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Returns true if the card was created by fusing two cards.
     */
    is_fused: ({ token_id }: {
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>;
    /**
     * Construct and simulate a owner_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Returns the current owner address of `token_id`.
     * Panics if token does not exist or has been burned.
     */
    owner_of: ({ token_id }: {
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Transfer a card from `from` to `to`.
     * Caller must be the owner OR an approved spender.
     */
    transfer: ({ from, to, token_id }: {
        from: string;
        to: string;
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a is_burned transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Returns true if `token_id` has been burned.
     */
    is_burned: ({ token_id }: {
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>;
    /**
     * Construct and simulate a token_uri transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Returns the metadata URI of `token_id`.
     */
    token_uri: ({ token_id }: {
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a admin_mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Mint a new card with a specific metadata URI. Requires admin authorization.
     * Returns the newly minted Token ID.
     */
    admin_mint: ({ to, uri }: {
        to: string;
        uri: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a fuse_cards transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Fuse two owned cards into a new Legendary card.
     * Both source cards are burned. Returns the new Legendary token ID.
     */
    fuse_cards: ({ owner, token_id_a, token_id_b }: {
        owner: string;
        token_id_a: u64;
        token_id_b: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize the contract with an admin address.
     * Can only be called once; panics if already initialized.
     */
    initialize: ({ admin }: {
        admin: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a public_mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Public mint — assigns a randomized card URI based on current supply.
     * Requires the recipient to authorize the transaction.
     */
    public_mint: ({ to }: {
        to: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a get_approved transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Returns the approved spender for `token_id`, if any.
     */
    get_approved: ({ token_id }: {
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>;
    /**
     * Construct and simulate a total_supply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Returns the total number of tokens ever minted (including burned).
     */
    total_supply: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a get_card_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Returns owner, URI, token_id, and burned status in a single RPC call.
     * More efficient for frontend card display.
     */
    get_card_info: ({ token_id }: {
        token_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<CardInfo>>;
    /**
     * Construct and simulate a batch_public_mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Mint multiple random cards in one transaction (max 5).
     * Returns a list of the newly minted token IDs.
     */
    batch_public_mint: ({ to, count }: {
        to: string;
        count: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Array<u64>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        buy_card: (json: string) => AssembledTransaction<null>;
        list_card: (json: string) => AssembledTransaction<null>;
        get_listing: (json: string) => AssembledTransaction<ListingInfo>;
        init_market: (json: string) => AssembledTransaction<null>;
        cancel_listing: (json: string) => AssembledTransaction<null>;
        burn: (json: string) => AssembledTransaction<null>;
        approve: (json: string) => AssembledTransaction<null>;
        get_tier: (json: string) => AssembledTransaction<CardTier>;
        is_fused: (json: string) => AssembledTransaction<boolean>;
        owner_of: (json: string) => AssembledTransaction<string>;
        transfer: (json: string) => AssembledTransaction<null>;
        is_burned: (json: string) => AssembledTransaction<boolean>;
        token_uri: (json: string) => AssembledTransaction<string>;
        admin_mint: (json: string) => AssembledTransaction<bigint>;
        fuse_cards: (json: string) => AssembledTransaction<bigint>;
        initialize: (json: string) => AssembledTransaction<null>;
        public_mint: (json: string) => AssembledTransaction<bigint>;
        get_approved: (json: string) => AssembledTransaction<Option<string>>;
        total_supply: (json: string) => AssembledTransaction<bigint>;
        get_card_info: (json: string) => AssembledTransaction<CardInfo>;
        batch_public_mint: (json: string) => AssembledTransaction<bigint[]>;
    };
}
