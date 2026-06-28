#![allow(dead_code)]
use soroban_sdk::contracttype;

/// Keys for all contract storage slots.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// The administrator address.
    Admin,
    /// Total number of NFTs ever minted (u64).
    TotalSupply,
    /// Owner (Address) of a given Token ID.
    Owner(u64),
    /// IPFS/HTTP metadata URI for a given Token ID.
    URI(u64),
    /// Approved spender (Address) for a given Token ID (for marketplace delegation).
    Approved(u64),
    /// Whether a given token has been burned (bool).
    Burned(u64),
}

/// Lightweight card info struct returned by `get_card_info`.
#[contracttype]
#[derive(Clone)]
pub struct CardInfo {
    pub owner: soroban_sdk::Address,
    pub uri: soroban_sdk::String,
    pub token_id: u64,
    pub burned: bool,
}