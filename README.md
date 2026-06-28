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

## 📄 License
This project is licensed under the **ISC License**.

## 👤 Author
**Nandita**
- GitHub: [@nandita141](https://github.com/nandita141)
