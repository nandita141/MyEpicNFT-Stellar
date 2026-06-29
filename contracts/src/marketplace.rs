use soroban_sdk::{
    contract, contractimpl,
    Address, Env,
    token::TokenClient,
};

// Cross-contract interface — calls our NFT contract
mod nft_interface {
    use soroban_sdk::{contractclient, Address, Env};

    #[contractclient(name = "NftClient")]
    pub trait NftContract {
        fn approve(env: Env, owner: Address, spender: Address, token_id: u64);
        fn transfer(env: Env, from: Address, to: Address, token_id: u64);
        fn owner_of(env: Env, token_id: u64) -> Address;
    }
}

use nft_interface::NftClient;
use soroban_sdk::contracttype;

#[contracttype]
#[derive(Clone)]
pub enum MktKey {
    Admin,
    NftContract,
    Listing(u64), // token_id → ListingInfo
}

#[contracttype]
#[derive(Clone)]
pub struct ListingInfo {
    pub seller: Address,
    pub price_stroops: i128, // Price in XLM stroops (1 XLM = 10_000_000 stroops)
    pub token_id: u64,
    pub active: bool,
}

#[contract]
pub struct MarketplaceContract;

#[contractimpl]
impl MarketplaceContract {

    /// Initialize marketplace with admin and NFT contract address.
    pub fn init_market(env: Env, admin: Address, nft_contract: Address) {
        if env.storage().instance().has(&MktKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&MktKey::Admin, &admin);
        env.storage().instance().set(&MktKey::NftContract, &nft_contract);
    }

    /// List a card for sale. The seller must have approved this marketplace contract
    /// to transfer the token (via NFT contract's `approve` function).
    /// `price_xlm_stroops`: price in stroops (1 XLM = 10_000_000).
    pub fn list_card(env: Env, seller: Address, token_id: u64, price_stroops: i128) {
        seller.require_auth();

        // Verify seller owns the card via cross-contract call
        let nft_addr: Address = env.storage().instance().get(&MktKey::NftContract).unwrap();
        let nft_client = NftClient::new(&env, &nft_addr);
        let owner = nft_client.owner_of(&token_id);

        if owner != seller {
            panic!("seller does not own this token");
        }

        // Approve this marketplace contract to transfer the token on seller's behalf
        // NOTE: seller must sign this transaction — the auth propagates
        nft_client.approve(&seller, &env.current_contract_address(), &token_id);

        let listing = ListingInfo {
            seller: seller.clone(),
            price_stroops,
            token_id,
            active: true,
        };
        env.storage().instance().set(&MktKey::Listing(token_id), &listing);
    }

    /// Cancel a listing. Only the original seller can cancel.
    pub fn cancel_listing(env: Env, seller: Address, token_id: u64) {
        seller.require_auth();

        let listing: ListingInfo = env.storage().instance()
            .get(&MktKey::Listing(token_id))
            .unwrap_or_else(|| panic!("listing not found"));

        if listing.seller != seller {
            panic!("only the seller can cancel");
        }

        let mut updated = listing;
        updated.active = false;
        env.storage().instance().set(&MktKey::Listing(token_id), &updated);
    }

    /// Buy a listed card. Buyer pays XLM to seller; marketplace transfers NFT.
    /// `xlm_token`: The Stellar native XLM token contract address.
    pub fn buy_card(env: Env, buyer: Address, token_id: u64, xlm_token: Address) {
        buyer.require_auth();

        let listing: ListingInfo = env.storage().instance()
            .get(&MktKey::Listing(token_id))
            .unwrap_or_else(|| panic!("listing not found"));

        if !listing.active {
            panic!("listing is not active");
        }

        // Transfer XLM from buyer to seller via Stellar token contract
        let token = TokenClient::new(&env, &xlm_token);
        token.transfer(&buyer, &listing.seller, &listing.price_stroops);

        // Cross-contract call: Transfer NFT from seller to buyer
        let nft_addr: Address = env.storage().instance().get(&MktKey::NftContract).unwrap();
        let nft_client = NftClient::new(&env, &nft_addr);
        nft_client.transfer(&listing.seller, &buyer, &token_id);

        // Mark listing inactive
        let mut updated = listing;
        updated.active = false;
        env.storage().instance().set(&MktKey::Listing(token_id), &updated);
    }

    /// Get listing details for a token.
    pub fn get_listing(env: Env, token_id: u64) -> ListingInfo {
        env.storage().instance()
            .get(&MktKey::Listing(token_id))
            .unwrap_or_else(|| panic!("listing not found"))
    }
}
