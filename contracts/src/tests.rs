#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

/// Helper to setup a fresh test environment
fn setup() -> (Env, StellarCardContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, StellarCardContract);
    let client = StellarCardContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    
    (env, client, admin, user)
}

// ─── 1. Basic Initialization Test ──────────────────────────────────────────

#[test]
fn test_initialize() {
    let (env, client, admin, _) = setup();
    client.initialize(&admin);

    // Verify initial state
    assert_eq!(client.total_supply(), 0);
}

// ─── 2. Admin Mint Success Test ───────────────────────────────────────────

#[test]
fn test_admin_mint_success() {
    let (env, client, admin, user) = setup();
    client.initialize(&admin);

    let uri = String::from_str(&env, "ipfs://QmAdminCard");
    let token_id = client.admin_mint(&user, &uri);

    // Verify mint results
    assert_eq!(token_id, 0);
    assert_eq!(client.total_supply(), 1);
    assert_eq!(client.owner_of(&token_id), user);
    assert_eq!(client.token_uri(&token_id), uri);
}

// ─── 3. Public Mint Success Test ──────────────────────────────────────────

#[test]
fn test_public_mint_success() {
    let (env, client, admin, user) = setup();
    client.initialize(&admin);

    let token_id = client.public_mint(&user);

    // Verify public mint logic increments supply and assigns owner correctly
    assert_eq!(token_id, 0);
    assert_eq!(client.total_supply(), 1);
    assert_eq!(client.owner_of(&token_id), user);
}
