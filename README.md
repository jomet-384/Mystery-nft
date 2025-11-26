# 🎁 Mystery NFT - FHEVM

A mystery box NFT dApp with **encrypted rarity** using Fully Homomorphic Encryption (FHEVM by Zama).

## Features

- 🎲 **Random Encrypted Rarity**: Uses FHE.randEuint8() for secure random generation
- 🔐 **User Decryption**: Only NFT owner can decrypt and reveal rarity via EIP-712 signature
- 🎁 **Mystery Box Experience**: NFTs appear as mystery boxes until revealed
- 🌈 **4 Rarity Levels**:
  - ⚪ Common (50%)
  - 🔵 Rare (30%)
  - 🟣 Epic (15%)
  - 🟡 Legendary (5%)
- 💰 **Free to Mint**: No cost to mint NFTs (only gas fees)
- 🎨 **Modern UI**: Beautiful gradient design with animations

## Tech Stack

- **Smart Contract**: Solidity 0.8.24 + FHEVM 0.9.1
- **Frontend**: React 18 + Vite
- **Blockchain**: Hardhat (local) / Sepolia (testnet)
- **Encryption**: Zama FHEVM + Relayer SDK

## Project Structure

```
mystery-nft-fhevm/
├── contracts/
│   └── MysteryNFT.sol          # Main NFT contract with encrypted rarity
├── scripts/
│   └── deploy.js               # Deployment script
├── test/                       # Contract tests (TODO)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NFTCard.jsx     # NFT display with reveal button
│   │   │   └── WalletConnect.jsx # Wallet connection component
│   │   ├── hooks/
│   │   │   ├── useWallet.js    # Wallet connection hook
│   │   │   └── useMysteryNFT.js # Contract interaction hook
│   │   ├── utils/
│   │   │   ├── fhevm.js        # FHEVM initialization and decryption
│   │   │   └── wallet.js       # Wallet utilities
│   │   ├── App.jsx             # Main application
│   │   ├── App.css             # Styles
│   │   └── main.jsx            # Entry point
│   └── package.json
├── hardhat.config.js
└── package.json
```

## Installation

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- MetaMask browser extension

### 1. Install Dependencies

```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `SEPOLIA_RPC_URL`: Your Infura/Alchemy RPC URL
- `PRIVATE_KEY`: Your deployer private key (for testnet deployment)
- `ETHERSCAN_API_KEY`: For contract verification

## Usage

### Local Development

#### 1. Start Hardhat Node

```bash
npx hardhat node
```

This will start a local Ethereum node at `http://localhost:8545` with FHEVM support.

#### 2. Deploy Contract

In a new terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy the MysteryNFT contract
- Save deployment info to `deployments/localhost.json`
- Copy ABI to `frontend/src/contracts/MysteryNFT.json`

#### 3. Start Frontend

```bash
cd frontend
npm run dev
```

The app will open at `http://localhost:3000`

#### 4. Connect MetaMask

- Add Hardhat Network to MetaMask:
  - Network Name: Hardhat Local
  - RPC URL: http://localhost:8545
  - Chain ID: 31337
  - Currency: ETH

- Import one of the test accounts from Hardhat node output

### Testnet Deployment (Sepolia)

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Update frontend FHEVM chainId
# Edit frontend/src/utils/fhevm.js:
# Change chainId: 31337 to chainId: 11155111
```

## How It Works

### 1. Minting Process

```solidity
function mint() external returns (uint256) {
    // Generate encrypted random number (0-255)
    euint8 randomValue = FHE.randEuint8();

    // Map to rarity based on probability:
    // 0-127 (50%) -> Common
    // 128-179 (30%) -> Rare
    // 180-217 (15%) -> Epic
    // 218-255 (5%) -> Legendary

    // Store encrypted rarity
    // Allow owner to decrypt
}
```

### 2. Reveal (Decrypt) Process

```javascript
// Frontend: Get encrypted handle
const encryptedHandle = await contract.getEncryptedRarity(tokenId);

// User signs EIP-712 message to prove ownership
const rarity = await fhe.userDecrypt(
  encryptedHandle,
  contractAddress,
  userAddress,
  signer
);

// Display revealed rarity!
```

### 3. Encryption Flow

```
User clicks "Mint"
    ↓
Contract generates FHE.randEuint8()
    ↓
Maps random value to rarity (1-4)
    ↓
Stores encrypted rarity
    ↓
Grants decrypt permission to owner
    ↓
NFT appears as 🎁 mystery box
    ↓
Owner clicks "Reveal"
    ↓
Signs EIP-712 decryption request
    ↓
Relayer SDK decrypts value
    ↓
Displays rarity (Common/Rare/Epic/Legendary)
```

## Smart Contract API

### MysteryNFT.sol

#### Functions

- `mint()` - Mint a new mystery NFT with encrypted random rarity
- `getEncryptedRarity(tokenId)` - Get encrypted rarity handle (owner only)
- `markAsRevealed(tokenId)` - Mark NFT as revealed
- `isRevealed(tokenId)` - Check if NFT is revealed
- `getNFTInfo(tokenId)` - Get public NFT metadata
- `totalSupply()` - Get total minted NFTs
- `tokensOfOwner(address)` - Get all NFTs owned by an address

#### Events

- `NFTMinted(tokenId, owner, timestamp)`
- `RarityRevealed(tokenId, owner, timestamp)`

## Frontend Hooks

### useWallet()

```javascript
const { address, signer, isConnected, connect, disconnect } = useWallet();
```

### useMysteryNFT(signer)

```javascript
const {
  mint,              // Mint new NFT
  getMyNFTs,         // Get user's NFTs
  getNFTInfo,        // Get NFT metadata
  revealRarity,      // Decrypt and reveal rarity
  getTotalSupply,    // Get total supply
  loading,
  error
} = useMysteryNFT(signer);
```

## Testing

```bash
# Run contract tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## Deployment Info

After deployment, contract info is saved to:
- `deployments/{network}.json` - Contract address and deployment details
- `frontend/src/contracts/MysteryNFT.json` - ABI and address for frontend

## Troubleshooting

### MetaMask shows "Internal JSON-RPC error"

Make sure you're on the correct network (Hardhat Local or Sepolia).

### "Contract not deployed" error

Run the deployment script first:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### FHEVM initialization fails

Make sure the Relayer SDK can load. Check browser console for errors.

### Decryption requires signature but nothing happens

MetaMask should popup for EIP-712 signature. Check if popups are blocked.

## Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Solidity Library](https://github.com/zama-ai/fhevm)
- [Relayer SDK](https://github.com/zama-ai/fhevm-relayer-sdk)

## License

MIT

## Author

Built with ❤️ using Zama FHEVM
