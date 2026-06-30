# 🎴 MyEpicNFT-Stellar

---

## ✅ Submission Checklist

- **Public GitHub repository:** [github.com/nandita141/MyEpicNFT-Stellar](https://github.com/nandita141/MyEpicNFT-Stellar)
- **README with complete documentation:** Yes (See below)
- **Minimum 10+ meaningful commits:** Yes
- **Live demo link (Vercel):** [my-epic-nft-stellar-frontend-48b7.vercel.app](https://my-epic-nft-stellar-frontend-48b7.vercel.app/)
- **Contract deployment address:** `CB4T7NWMGPN22AI2GZMPJ4OO4W5UR2JFIE46YQ6AVJ7PEE4Z5LOZFX2H`
- **Transaction hash for contract interaction:** `[Insert Transaction Hash Here]`
- **Screenshot showing Mobile responsive UI:** 
  <img width="397" height="716" alt="image" src="https://github.com/user-attachments/assets/9735e435-77f7-4b30-a9d0-8d40d8849355" />
  <img width="503" height="681" alt="image" src="https://github.com/user-attachments/assets/6d05bcfc-273e-47ac-920d-b6725415c52e" />
  <img width="443" height="645" alt="image" src="https://github.com/user-attachments/assets/6b40429b-4bda-4305-ad9d-be4da2287265" />



- **Screenshot showing CI/CD pipeline running:**
- <img width="1197" height="468" alt="image" src="https://github.com/user-attachments/assets/8fea50d3-c8cf-41d9-9e40-1002c7f2fb0b" />

- **Screenshot showing Test output with 3+ passing tests:**
- <img width="718" height="215" alt="image" src="https://github.com/user-attachments/assets/50d7ef34-e2ff-4d0d-a3a6-9c414e63fcdb" />

- **Demo video link (1–2 minutes):** [Watch the Demo]()

[![CI/CD](https://github.com/nandita141/MyEpicNFT-Stellar/actions/workflows/ci.yml/badge.svg)](https://github.com/nandita141/MyEpicNFT-Stellar/actions)
[![Stellar](https://img.shields.io/badge/Network-Stellar-blue.svg)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contract-Soroban/Rust-orange.svg)](https://soroban.stellar.org)
[![React](https://img.shields.io/badge/Frontend-React/Vite-61dafb.svg)](https://reactjs.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

**MyEpicNFT-Stellar** is a production-ready, full-stack NFT collectible card game built on the **Stellar/Soroban** ecosystem. It features an advanced Rust smart contract with inter-contract marketplace communication, a mobile-responsive React dashboard with real-time event streaming, comprehensive tests, and a CI/CD pipeline.

---

## 📺 Project Demo




### 🔗 [Watch the working Demo here](https://drive.google.com/file/d/14FOdGRAkNQ8m-eFQizyWrqPLVj54zoHz/view?usp=sharing)

### 🚀 [Live App on Vercel](https://my-epic-nft-stellar-frontend-48b7.vercel.app)
---
#images/
<img width="1153" height="540" alt="Screenshot 2026-06-30 173019" src="https://github.com/user-attachments/assets/7b0b4b4e-e17a-4bee-bdfb-3b9a14b8c115" />
<img width="1186" height="522" alt="Screenshot 2026-06-30 173153" src="https://github.com/user-attachments/assets/84f5a18a-db6a-4384-87d2-58ea98cf0029" />
<img width="1186" height="522" alt="Screenshot 2026-06-30 173153" src="https://github.com/user-attachments/assets/92200ba7-0042-45dc-a667-93d5450b8a37" />



## ✨ Key Features

| Feature | Description |
|---|---|
|  **Instant Minting** | Public mint with randomized card assignment |
|  **Admin Controls** | Admin mint for specific URIs |
|  **Burn** | Owners can permanently destroy cards |
|  **Approve / Delegate** | Approve a spender for marketplace use |
|  **Marketplace Contract** | Inter-contract cross-call for buying/selling cards |
|  **Event Streaming** | Real-time contract event log polled from Stellar RPC |
|  **Interactive Dashboard** | Real-time stats, contract overview, token query |
|  **My Collection** | 3D flip-card gallery of all owned NFTs |
|  **Asset Transfer** | Secure peer-to-peer transfers from the UI |
|  **Responsive UI** | Mobile-first glassmorphism design with dark/light mode |
|  **Full Test Suite** | Rust integration tests + Vitest frontend tests |
|  **CI/CD** | GitHub Actions: test + build + Vercel deploy |

---

## 🏗️ Architecture

```mermaid
graph TD
    User["👤 User / Freighter Wallet"]
    FE["⚛️ React Frontend (Vite)"]
    RPC["🌐 Stellar Soroban RPC"]
    NFT["📄 NFT Contract (Rust)"]
    MKT["🏪 Marketplace Contract (Rust)"]
    IPFS["🗄️ IPFS (Metadata)"]

    User -- "signTransaction" --> FE
    FE -- "Client SDK calls" --> RPC
    RPC -- "invoke" --> NFT
    NFT -- "cross-contract call" --> MKT
    MKT -- "approve / transfer" --> NFT
    FE -- "getEvents poll" --> RPC
    FE -- "fetch metadata" --> IPFS
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Soroban SDK (Rust) |
| Inter-contract | Soroban `contractclient` macro |
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (glassmorphism, responsive) |
| Wallet | Freighter Wallet API |
| Metadata | IPFS |
| Blockchain | Stellar Testnet |
| Tests | `cargo test` (Rust) + Vitest (React) |
| CI/CD | GitHub Actions + Vercel |

---

## 📄 Contract API Reference

### NFT Contract — `CB4T7NWMGPN22AI2GZMPJ4OO4W5UR2JFIE46YQ6AVJ7PEE4Z5LOZFX2H`

#### Write Functions (require wallet signature)

| Function | Arguments | Returns | Description |
|---|---|---|---|
| `initialize` | `admin: Address` | — | One-time setup. Sets admin. |
| `admin_mint` | `to: Address, uri: String` | `u64` (token ID) | Admin mints specific card. |
| `public_mint` | `to: Address` | `u64` (token ID) | Anyone mints a random card. |
| `transfer` | `from, to: Address, token_id: u64` | — | Transfer card ownership. |
| `burn` | `owner: Address, token_id: u64` | — | Permanently destroy a card. |
| `approve` | `owner, spender: Address, token_id: u64` | — | Delegate transfer to spender. |

#### Read-Only Functions (free, no signature)

| Function | Arguments | Returns | Description |
|---|---|---|---|
| `total_supply` | — | `u64` | Total cards ever minted. |
| `owner_of` | `token_id: u64` | `Address` | Get owner of a token. |
| `token_uri` | `token_id: u64` | `String` | Get metadata URI. |
| `is_burned` | `token_id: u64` | `bool` | Check if token was burned. |
| `get_approved` | `token_id: u64` | `Option<Address>` | Get approved spender. |
| `get_card_info` | `token_id: u64` | `CardInfo` | Batch: owner + uri + burned. |

#### Contract Events

| Event | Topics | Data |
|---|---|---|
| `mint` | `("mint", to)` | `token_id: u64` |
| `transfer` | `("transfer", from, to)` | `token_id: u64` |
| `burn` | `("burn", owner)` | `token_id: u64` |
| `approve` | `("approve", owner, spender)` | `token_id: u64` |

### Marketplace Contract (Inter-Contract)

| Function | Description |
|---|---|
| `initialize(admin, nft_contract)` | Setup marketplace with NFT contract address |
| `list_card(seller, token_id, price_stroops)` | List card for sale (calls NFT `approve`) |
| `buy_card(buyer, token_id, xlm_token)` | Buy card — transfers XLM + calls NFT `transfer` |
| `cancel_listing(seller, token_id)` | Delist a card |
| `get_listing(token_id)` | Read listing details |

---

## 🚀 Getting Started

### Prerequisites
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli)
- [Rust + Cargo](https://www.rust-lang.org/tools/install) with `wasm32v1-none` target
- [Node.js v18+](https://nodejs.org/) & `pnpm`
- [Freighter Wallet](https://freighter.app/) extension

### 1. Smart Contract — Build & Test
```bash
cd StellarCard/contracts

# Run all integration tests
cargo test --features testutils

# Build WASM
stellar contract build
```

### 2. Frontend — Install & Run
```bash
cd StellarCard/frontend

# Copy env vars
cp .env.example .env
# Edit .env with your contract ID

pnpm install
pnpm dev
```

### 3. Frontend Tests
```bash
cd StellarCard/frontend
pnpm test          # watch mode
pnpm test:run      # single run (for CI)
```

### 4. Deployment
The frontend deploys automatically to **Vercel** on push to `main` via GitHub Actions.

Required GitHub Secrets:
- `VERCEL_TOKEN` — from Vercel dashboard
- `VITE_CONTRACT_ID` — your deployed contract ID

---

## 📦 Project Structure

```
StellarCard/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD: test + build + deploy
├── contracts/
│   └── src/
│       ├── lib.rs              # NFT contract (events, burn, approve)
│       ├── nft_card.rs         # DataKey & CardInfo types
│       ├── marketplace.rs      # Inter-contract marketplace
│       └── tests.rs            # 10 Rust integration tests
├── frontend/
│   ├── src/
│   │   ├── components/         # Sidebar, Header, Dashboard, Cards, ...
│   │   ├── context/            # AppContext (wallet, toasts, theme)
│   │   ├── hooks/              # useContract, useEventStream
│   │   ├── tests/              # Vitest unit tests
│   │   ├── config.js           # Centralized env config
│   │   └── App.jsx             # Slim orchestrator
│   ├── .env.example
│   └── vite.config.js
├── packages/stellar_card/      # Contract client SDK
└── scripts/                    # Deploy & mint .bat scripts
```

---

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License
Licensed under the **ISC License**.

## 👤 Author
**Nandita**
- GitHub: [@nandita141](https://github.com/nandita141)
- Live App: [Vercel Deploy](https://my-epic-nft-stellar-frontend-48b7.vercel.app)

## 📚 Resources
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Freighter Wallet](https://freighter.app/)
- [Stellar Expert](https://stellar.expert/)
