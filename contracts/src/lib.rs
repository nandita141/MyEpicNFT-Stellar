#![no_std]

use soroban_sdk::{
    contract, contractimpl,
    Address, Env, String, symbol_short,
};

mod nft_card;
use nft_card::{DataKey, CardInfo, CardTier};


// Marketplace contract (inter-contract communication demo)
#[allow(dead_code)]
mod marketplace;

// Integration tests removed per user request

// ─────────────────────────────────────────────────────────────────────────────
// Events (emitted via env.events().publish)
// ─────────────────────────────────────────────────────────────────────────────
fn emit_mint(env: &Env, to: &Address, token_id: u64) {
    let topics = (symbol_short!("mint"), to.clone());
    env.events().publish(topics, token_id);
}

fn emit_transfer(env: &Env, from: &Address, to: &Address, token_id: u64) {
    let topics = (symbol_short!("transfer"), from.clone(), to.clone());
    env.events().publish(topics, token_id);
}

fn emit_burn(env: &Env, owner: &Address, token_id: u64) {
    let topics = (symbol_short!("burn"), owner.clone());
    env.events().publish(topics, token_id);
}

fn emit_approve(env: &Env, owner: &Address, spender: &Address, token_id: u64) {
    let topics = (symbol_short!("approve"), owner.clone(), spender.clone());
    env.events().publish(topics, token_id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract
// ─────────────────────────────────────────────────────────────────────────────
#[contract]
pub struct StellarCardContract;

#[contractimpl]
impl StellarCardContract {

    // ─── 1. Initialize ───────────────────────────────────────────────────────

    /// Initialize the contract with an admin address.
    /// Can only be called once; panics if already initialized.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("contract has already been initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0u64);
    }

    // ─── 2. Admin Mint ───────────────────────────────────────────────────────

    /// Mint a new card with a specific metadata URI. Requires admin authorization.
    /// Returns the newly minted Token ID.
    pub fn admin_mint(env: Env, to: Address, uri: String) -> u64 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let token_id: u64 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);

        if env.storage().instance().has(&DataKey::Owner(token_id)) {
            panic!("token ID already exists");
        }

        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        env.storage().instance().set(&DataKey::URI(token_id), &uri);
        env.storage().instance().set(&DataKey::Burned(token_id), &false);
        env.storage().instance().set(&DataKey::TotalSupply, &(token_id + 1));

        emit_mint(&env, &to, token_id);

        token_id
    }

    // ─── 3. Public Mint ──────────────────────────────────────────────────────

    /// Public mint — assigns a randomized card URI based on current supply.
    /// Requires the recipient to authorize the transaction.
    pub fn public_mint(env: Env, to: Address) -> u64 {
        to.require_auth();

        let token_id: u64 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);

        if env.storage().instance().has(&DataKey::Owner(token_id)) {
            panic!("token ID already exists");
        }

        let dragon_uri  = String::from_str(&env, "ipfs://QmUYrFddXf4SpEXWAp6RpSm6XZmwxiDRKLNixt58nuhwAo");
        let mage_uri    = String::from_str(&env, "ipfs://QmbZEqRXpz35zfXkyhAoPAfZLZLZmr1rDSXKbtuS5UhNPm");
        let warrior_uri = String::from_str(&env, "ipfs://QmdwASjP4qiyhvn6vJrDr2P3sudJ45KLtiariQmdqQAG9g");

        let new_uri = match token_id % 3 {
            0 => dragon_uri,
            1 => mage_uri,
            _ => warrior_uri,
        };

        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        env.storage().instance().set(&DataKey::URI(token_id), &new_uri);
        env.storage().instance().set(&DataKey::Burned(token_id), &false);
        env.storage().instance().set(&DataKey::TotalSupply, &(token_id + 1));

        emit_mint(&env, &to, token_id);

        token_id
    }

    // ─── 4. Transfer ─────────────────────────────────────────────────────────

    /// Transfer a card from `from` to `to`.
    /// Caller must be the owner OR an approved spender.
    pub fn transfer(env: Env, from: Address, to: Address, token_id: u64) {
        // Either the owner or an approved spender can transfer
        let owner = Self::owner_of(env.clone(), token_id);
        let approved: Option<Address> = env.storage().instance().get(&DataKey::Approved(token_id));

        let caller_is_owner = owner == from;
        let caller_is_approved = approved.map(|a| a == from).unwrap_or(false);

        if !caller_is_owner && !caller_is_approved {
            panic!("caller is not owner or approved spender");
        }
        from.require_auth();

        if Self::is_burned(env.clone(), token_id) {
            panic!("token has been burned");
        }

        env.storage().instance().set(&DataKey::Owner(token_id), &to);
        // Clear approval after transfer
        env.storage().instance().remove(&DataKey::Approved(token_id));

        emit_transfer(&env, &from, &to, token_id);
    }

    // ─── 5. Burn ─────────────────────────────────────────────────────────────

    /// Permanently destroy a card. Only the owner can burn.
    /// The token ID is marked burned; the supply count does NOT decrease.
    pub fn burn(env: Env, owner: Address, token_id: u64) {
        owner.require_auth();

        let actual_owner = Self::owner_of(env.clone(), token_id);
        if actual_owner != owner {
            panic!("caller is not the owner");
        }
        if Self::is_burned(env.clone(), token_id) {
            panic!("token has already been burned");
        }

        env.storage().instance().set(&DataKey::Burned(token_id), &true);
        // Remove owner & approval records
        env.storage().instance().remove(&DataKey::Owner(token_id));
        env.storage().instance().remove(&DataKey::Approved(token_id));

        emit_burn(&env, &owner, token_id);
    }

    // ─── 6. Approve ──────────────────────────────────────────────────────────

    /// Approve `spender` to transfer `token_id` on behalf of the owner.
    /// Used by the Marketplace contract for trustless listings.
    pub fn approve(env: Env, owner: Address, spender: Address, token_id: u64) {
        owner.require_auth();

        let actual_owner = Self::owner_of(env.clone(), token_id);
        if actual_owner != owner {
            panic!("caller is not the owner");
        }

        env.storage().instance().set(&DataKey::Approved(token_id), &spender);
        emit_approve(&env, &owner, &spender, token_id);
    }

    // ─── 7. Read-Only: owner_of ───────────────────────────────────────────────

    /// Returns the current owner address of `token_id`.
    /// Panics if token does not exist or has been burned.
    pub fn owner_of(env: Env, token_id: u64) -> Address {
        if Self::is_burned(env.clone(), token_id) {
            panic!("token has been burned");
        }
        env.storage().instance().get(&DataKey::Owner(token_id))
            .unwrap_or_else(|| panic!("token does not exist"))
    }

    /// Returns the metadata URI of `token_id`.
    pub fn token_uri(env: Env, token_id: u64) -> String {
        env.storage().instance().get(&DataKey::URI(token_id))
            .unwrap_or_else(|| panic!("token does not exist"))
    }

    /// Returns the total number of tokens ever minted (including burned).
    pub fn total_supply(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    /// Returns true if `token_id` has been burned.
    pub fn is_burned(env: Env, token_id: u64) -> bool {
        env.storage().instance().get(&DataKey::Burned(token_id)).unwrap_or(false)
    }

    /// Returns the approved spender for `token_id`, if any.
    pub fn get_approved(env: Env, token_id: u64) -> Option<Address> {
        env.storage().instance().get(&DataKey::Approved(token_id))
    }

    /// Returns owner, URI, token_id, and burned status in a single RPC call.
    /// More efficient for frontend card display.
    pub fn get_card_info(env: Env, token_id: u64) -> CardInfo {
        let burned: bool = env.storage().instance().get(&DataKey::Burned(token_id)).unwrap_or(false);
        let owner: Address = env.storage().instance().get(&DataKey::Owner(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));
        let uri: String = env.storage().instance().get(&DataKey::URI(token_id))
            .unwrap_or_else(|| panic!("token does not exist"));
        CardInfo { owner, uri, token_id, burned }
    }

    /// Returns the tier (Common/Rare/Epic/Legendary) of a card.
    pub fn get_tier(env: Env, token_id: u64) -> CardTier {
        env.storage().instance().get(&DataKey::Tier(token_id)).unwrap_or(CardTier::Common)
    }

    /// Returns true if the card was created by fusing two cards.
    pub fn is_fused(env: Env, token_id: u64) -> bool {
        env.storage().instance().get(&DataKey::FusedCard(token_id)).unwrap_or(false)
    }

    // ─── 8. Batch Public Mint ─────────────────────────────────────────────────

    /// Mint multiple random cards in one transaction (max 5).
    /// Returns a list of the newly minted token IDs.
    pub fn batch_public_mint(env: Env, to: Address, count: u32) -> soroban_sdk::Vec<u64> {
        to.require_auth();
        if count == 0 || count > 5 {
            panic!("count must be between 1 and 5");
        }

        let dragon_uri  = String::from_str(&env, "ipfs://QmUYrFddXf4SpEXWAp6RpSm6XZmwxiDRKLNixt58nuhwAo");
        let mage_uri    = String::from_str(&env, "ipfs://QmbZEqRXpz35zfXkyhAoPAfZLZLZmr1rDSXKbtuS5UhNPm");
        let warrior_uri = String::from_str(&env, "ipfs://QmdwASjP4qiyhvn6vJrDr2P3sudJ45KLtiariQmdqQAG9g");

        let mut minted = soroban_sdk::Vec::new(&env);
        let mut token_id: u64 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);

        for _ in 0..count {
            let new_uri = match token_id % 3 {
                0 => dragon_uri.clone(),
                1 => mage_uri.clone(),
                _ => warrior_uri.clone(),
            };

            env.storage().instance().set(&DataKey::Owner(token_id), &to);
            env.storage().instance().set(&DataKey::URI(token_id), &new_uri);
            env.storage().instance().set(&DataKey::Burned(token_id), &false);
            env.storage().instance().set(&DataKey::Tier(token_id), &CardTier::Common);
            emit_mint(&env, &to, token_id);

            minted.push_back(token_id);
            token_id += 1;
        }

        env.storage().instance().set(&DataKey::TotalSupply, &token_id);
        minted
    }

    // ─── 9. Fuse Cards ────────────────────────────────────────────────────────

    /// Fuse two owned cards into a new Legendary card.
    /// Both source cards are burned. Returns the new Legendary token ID.
    pub fn fuse_cards(env: Env, owner: Address, token_id_a: u64, token_id_b: u64) -> u64 {
        owner.require_auth();

        if token_id_a == token_id_b {
            panic!("cannot fuse a card with itself");
        }

        // Verify ownership of both cards
        let owner_a = Self::owner_of(env.clone(), token_id_a);
        let owner_b = Self::owner_of(env.clone(), token_id_b);
        if owner_a != owner || owner_b != owner {
            panic!("you must own both cards to fuse them");
        }

        // Burn source cards
        env.storage().instance().set(&DataKey::Burned(token_id_a), &true);
        env.storage().instance().set(&DataKey::Burned(token_id_b), &true);
        env.storage().instance().remove(&DataKey::Owner(token_id_a));
        env.storage().instance().remove(&DataKey::Owner(token_id_b));

        emit_burn(&env, &owner, token_id_a);
        emit_burn(&env, &owner, token_id_b);

        // Mint the Legendary fused card
        let new_id: u64 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        let legendary_uri = String::from_str(&env, "ipfs://QmLegendaryCardXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

        env.storage().instance().set(&DataKey::Owner(new_id), &owner);
        env.storage().instance().set(&DataKey::URI(new_id), &legendary_uri);
        env.storage().instance().set(&DataKey::Burned(new_id), &false);
        env.storage().instance().set(&DataKey::Tier(new_id), &CardTier::Legendary);
        env.storage().instance().set(&DataKey::FusedCard(new_id), &true);
        env.storage().instance().set(&DataKey::TotalSupply, &(new_id + 1));

        emit_mint(&env, &owner, new_id);

        new_id
    }
}