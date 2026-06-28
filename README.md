# 🎴 MyEpicNFT-Stellar

[![Stellar](https://img.shields.io/badge/Network-Stellar-blue.svg)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contract-Soroban/Rust-orange.svg)](https://soroban.stellar.org)
[![React](https://img.shields.io/badge/Frontend-React/Vite-61dafb.svg)](https://reactjs.org)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

**MyEpicNFT-Stellar** is a premium, full-stack NFT collectible card game built on the **Stellar/Soroban** ecosystem. It features a robust Rust smart contract and a modern, glassmorphism-inspired React dashboard for seamless interaction with the blockchain.

---

## 📺 Project Demo
Watch the full system in action, from wallet connection to NFT minting and transferring:

[<img src="image.png" width="800" alt="Watch the Demo" />](https://drive.google.com/file/d/1Xkpl9Ls5iMyuafxIwtyEXzn8LPR3ZIYO/view?usp=sharing)

### 🔗 Video Link ⬇️
[**Watch the working Demo here**](https://drive.google.com/file/d/1Xkpl9Ls5iMyuafxIwtyEXzn8LPR3ZIYO/view?usp=sharing)

> **Tip:** You can upload your video file directly to this GitHub repository and embed it here using:
> `![Demo Video](video_path.mp4)`

---

## ✨ Key Features

- **🚀 Instant Minting**: Public minting function with randomized card assignment.
- **🛡️ Admin Controls**: Dedicated admin minting for specific URIs and restricted initialization.
- **📊 Interactive Dashboard**: Real-time stats showing total supply, owned cards, and network status.
- **🔍 Token Explorer**: Deep-link integration with Stellar Expert and on-chain metadata querying.
- **🔁 Asset Transfer**: Secure peer-to-peer NFT transfers directly from the UI.
- **💎 Premium UI**: Sleek dark/light mode with glassmorphism design and smooth animations.

---

## 🛠️ Tech Stack

- **Smart Contract**: Soroban (Rust)
- **Frontend**: React.js, Vite, Vanilla CSS
- **Wallet Integration**: Freighter Wallet (@stellar/freighter-api)
- **Metadata Storage**: IPFS
- **Blockchain**: Stellar Testnet

---

## 🚀 Getting Started

### 1. Prerequisites
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli)
- [Rust & Cargo](https://www.rust-lang.org/tools/install)
- [Node.js (v18+)](https://nodejs.org/) & `pnpm`
- [Freighter Wallet](https://freighter.app/) extension

### 2. Smart Contract Setup
```bash
cd contracts
# Build the contract
stellar contract build
# Run tests
cargo test
```

### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
pnpm install
# Start development server
pnpm dev
```

### 4. Deployment
The frontend is optimized for **Vercel** deployment. Ensure you set the `VITE_CONTRACT_ID` environment variable.

---

## 📄 Contract Information

- **Contract ID**: `CDQ4LCGKICDNAQKRFGPCTDVDNWUU7JIVXGWKGSPA3A5A44Q45PCB7PD4`
- **Standard**: Custom NFT Implementation (Soroban)
- **Network**: Stellar Testnet

---

## 📦 Project Structure

```text
StellarCard/
├── contracts/          # Soroban smart contract (Rust)
│   ├── src/            # lib.rs & nft_card logic
│   └── tests/          # Integration tests
├── frontend/           # React + Vite application
│   └── src/            # Dashboard & UI components
├── ipfs/               # NFT Metadata samples
└── scripts/            # Deployment & automation tools
```

---

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

### Read-Only Functions

- `total_supply()` → `u64`: Get total number of cards minted
- `owner_of(token_id: u64)` → `Address`: Get owner of a specific card
- `token_uri(token_id: u64)` → `String`: Get metadata URI for a card

### State-Changing Functions

- `initialize(admin: Address)`: Initialize the contract (admin only)
- `admin_mint(to: Address, uri: String)` → `u64`: Admin mint a card with specific URI
- `public_mint(to: Address)`: Public mint a random card
- `transfer(from: Address, to: Address, token_id: u64)`: Transfer a card

## 🛠️ Development

### Build Contract
```bash
cd contracts
stellar contract build
```

### Test Contract
```bash
cd contracts
cargo test
```

### Run Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Build Frontend
```bash
cd frontend
pnpm build
```

## 📝 Scripts

- `scripts/deploy_contract.bat`: Deploy contract to testnet
- `scripts/mint_sample_cards.bat`: Mint sample cards (Fire Dragon, Ice Mage, Stone Warrior)
- `scripts/test_contracts.bat`: Run contract tests

## 🌐 IPFS Metadata

Card metadata is stored on IPFS. Sample cards include:

- **Fire Dragon**: Epic rarity, 90 Attack, 75 Defense
- **Ice Mage**: Rare rarity, 70 Attack, 85 Defense
- **Stone Warrior**: Common rarity, 60 Attack, 90 Defense

Metadata format:

```json
{
  "name": "Card Name",
  "description": "Card description",
  "image": "ipfs://...",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Epic"
    },
    {
      "trait_type": "Attack",
      "value": "90"
    }
  ]
}
```

## 🚢 Deployment

### Frontend Deployment (Vercel)

https://my-epic-nft-stellar-frontend-48b7.vercel.app

## DApp Interface Screenshot
<img width="1887" height="857" alt="Screenshot 2026-04-28 164937" src="https://github.com/user-attachments/assets/ea7515d7-3510-48b0-9e50-bdf3052aea9f" />
<img width="1914" height="875" alt="Screenshot 2026-04-28 165006" src="https://github.com/user-attachments/assets/0d77f260-efec-4ef6-8c54-6ce2dd5a9be7" />
<img width="1919" height="805" alt="Screenshot 2026-04-28 165022" src="https://github.com/user-attachments/assets/2d41db6d-7665-4803-9589-bd1c743a9f2a" />
<img width="1902" height="854" alt="Screenshot 2026-04-28 165038" src="https://github.com/user-attachments/assets/b37d47a4-656e-4ca7-be2b-b720d4e44a88" />



### 📺 Video Link ⬇️
[**Watch the working Demo Video here**](https://drive.google.com/file/d/1Xkpl9Ls5iMyuafxIwtyEXzn8LPR3ZIYO/view?usp=sharing)

## 📚 Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Freighter Wallet](https://freighter.app/)
- [Stellar Expert](https://stellar.expert/)

## 📄 License
This project is licensed under the **ISC License**.

## 👤 Author
**Nandita**
- GitHub: [@nandita141](https://github.com/nandita141)
