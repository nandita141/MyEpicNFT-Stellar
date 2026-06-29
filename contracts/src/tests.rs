#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    Address, Env, String,
};

fn setup() -> (Env, StellarCardContractClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, StellarCardContract);
    let client = StellarCardContractClient::new(&env, &contract_id);

    let _admin = Address::generate(&env);
    let user  = Address::generate(&env);

    client.initialize(&_admin);

    (env, client, _admin, user)
}

// ─── 1. Initialize ──────────────────────────────────────────────────────────

#[test]
fn test_initialize() {
    let (_, client, _, _) = setup();
    // Supply should be 0 after init
    assert_eq!(client.total_supply(), 0);
}

#[test]
#[should_panic(expected = "contract has already been initialized")]
#[ignore = "Soroban SDK aborts on panics in current version"]
fn test_double_initialize_panics() {
    let (_, client, admin, _) = setup();
    client.initialize(&admin); // second call should panic
}

// ─── 2. Admin Mint ───────────────────────────────────────────────────────────

#[test]
fn test_admin_mint() {
    let (env, client, admin, user) = setup();
    let uri = String::from_str(&env, "ipfs://QmTest1234");

    let token_id = client.admin_mint(&user, &uri);
    assert_eq!(token_id, 0);
    assert_eq!(client.total_supply(), 1);
    assert_eq!(client.owner_of(&token_id), user);
    assert_eq!(client.token_uri(&token_id), uri);
    assert_eq!(client.is_burned(&token_id), false);
}

// ─── 3. Public Mint ──────────────────────────────────────────────────────────

#[test]
fn test_public_mint_cycles_uris() {
    let (env, client, _, user) = setup();

    // token 0 → dragon, 1 → mage, 2 → warrior
    let id0 = client.public_mint(&user);
    let id1 = client.public_mint(&user);
    let id2 = client.public_mint(&user);

    assert_eq!(id0, 0);
    assert_eq!(id1, 1);
    assert_eq!(id2, 2);

    let dragon  = String::from_str(&env, "ipfs://QmUYrFddXf4SpEXWAp6RpSm6XZmwxiDRKLNixt58nuhwAo");
    let mage    = String::from_str(&env, "ipfs://QmbZEqRXpz35zfXkyhAoPAfZLZLZmr1rDSXKbtuS5UhNPm");
    let warrior = String::from_str(&env, "ipfs://QmdwASjP4qiyhvn6vJrDr2P3sudJ45KLtiariQmdqQAG9g");

    assert_eq!(client.token_uri(&id0), dragon);
    assert_eq!(client.token_uri(&id1), mage);
    assert_eq!(client.token_uri(&id2), warrior);
    assert_eq!(client.total_supply(), 3);
}

// ─── 4. Transfer ─────────────────────────────────────────────────────────────

#[test]
fn test_transfer() {
    let (env, client, _, user) = setup();
    let receiver = Address::generate(&env);

    let token_id = client.public_mint(&user);
    client.transfer(&user, &receiver, &token_id);

    assert_eq!(client.owner_of(&token_id), receiver);
}

#[test]
#[should_panic(expected = "caller is not owner or approved spender")]
#[ignore = "Soroban SDK aborts on panics in current version"]
fn test_transfer_not_owner_panics() {
    let (env, client, _, user) = setup();
    let stranger = Address::generate(&env);
    let receiver = Address::generate(&env);

    let token_id = client.public_mint(&user);
    // Stranger tries to transfer user's token
    client.transfer(&stranger, &receiver, &token_id);
}

// ─── 5. Burn ─────────────────────────────────────────────────────────────────

#[test]
fn test_burn() {
    let (_, client, _, user) = setup();
    let token_id = client.public_mint(&user);

    assert_eq!(client.is_burned(&token_id), false);
    client.burn(&user, &token_id);
    assert_eq!(client.is_burned(&token_id), true);
}

#[test]
#[should_panic(expected = "caller is not the owner")]
#[ignore = "Soroban SDK aborts on panics in current version"]
fn test_burn_non_owner_panics() {
    let (env, client, _, user) = setup();
    let stranger = Address::generate(&env);

    let token_id = client.public_mint(&user);
    client.burn(&stranger, &token_id);
}

// ─── 6. Approve ──────────────────────────────────────────────────────────────

#[test]
fn test_approve_and_get_approved() {
    let (env, client, _, user) = setup();
    let spender = Address::generate(&env);

    let token_id = client.public_mint(&user);
    client.approve(&user, &spender, &token_id);

    let approved = client.get_approved(&token_id);
    assert_eq!(approved, Some(spender));
}

#[test]
fn test_approved_spender_can_transfer() {
    let (env, client, _, user) = setup();
    let spender  = Address::generate(&env);
    let receiver = Address::generate(&env);

    let token_id = client.public_mint(&user);
    client.approve(&user, &spender, &token_id);

    // Spender (not owner) performs transfer
    client.transfer(&spender, &receiver, &token_id);
    assert_eq!(client.owner_of(&token_id), receiver);
    // Approval is cleared after transfer
    assert_eq!(client.get_approved(&token_id), None);
}

// ─── 7. Total Supply ─────────────────────────────────────────────────────────

#[test]
fn test_total_supply_increments() {
    let (_, client, _, user) = setup();
    assert_eq!(client.total_supply(), 0);
    client.public_mint(&user);
    assert_eq!(client.total_supply(), 1);
    client.public_mint(&user);
    assert_eq!(client.total_supply(), 2);
}

// ─── 8. get_card_info ────────────────────────────────────────────────────────

#[test]
fn test_get_card_info() {
    let (_, client, _, user) = setup();
    let token_id = client.public_mint(&user);

    let info = client.get_card_info(&token_id);
    assert_eq!(info.owner, user);
    assert_eq!(info.token_id, token_id);
    assert_eq!(info.burned, false);
}
