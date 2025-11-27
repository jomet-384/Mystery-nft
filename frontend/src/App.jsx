// Main App component
import { useState, useEffect } from 'react';
import { useWalletRainbow } from './hooks/useWalletRainbow';
import { useMysteryNFT } from './hooks/useMysteryNFT';
import { initializeFhevm, resetFhevmInstance } from './utils/fhevm';
import WalletConnectRainbow from './components/WalletConnectRainbow';
import NFTCard from './components/NFTCard';
import SuccessModal from './components/SuccessModal';
import GiftBoxIcon from './components/GiftBoxIcon';
import './App.css';

export default function App() {
  const { address, provider, signer, isConnected } = useWalletRainbow();
  const nft = useMysteryNFT(signer);

  const [myNFTs, setMyNFTs] = useState([]);
  const [nftInfos, setNftInfos] = useState({});
  const [isMinting, setIsMinting] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [fhevmReady, setFhevmReady] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mintedNFT, setMintedNFT] = useState({ tokenId: null, txHash: null });

  // Initialize FHEVM after wallet is connected
  useEffect(() => {
    async function init() {
      if (!provider) {
        // Reset FHEVM instance when wallet disconnects
        resetFhevmInstance();
        setFhevmReady(false);
        return;
      }

      try {
        console.log('🔐 Initializing FHEVM with connected wallet...');
        await initializeFhevm(provider);
        setFhevmReady(true);
        console.log('✅ FHEVM ready');
      } catch (error) {
        console.error('❌ Failed to initialize FHEVM:', error);
        setFhevmReady(false);
      }
    }
    init();
  }, [provider]); // Re-initialize when provider changes

  // Load NFTs when wallet connects and FHEVM is ready
  useEffect(() => {
    if (isConnected && address && fhevmReady) {
      loadMyNFTs();
      loadTotalSupply();
    }
  }, [isConnected, address, fhevmReady]);

  async function loadMyNFTs() {
    const tokenIds = await nft.getMyNFTs(address);
    setMyNFTs(tokenIds);

    // Load info for each NFT
    const infos = {};
    for (const tokenId of tokenIds) {
      try {
        const info = await nft.getNFTInfo(tokenId);
        infos[tokenId] = info;
      } catch (error) {
        console.error(`Failed to load info for token ${tokenId}:`, error);
      }
    }
    setNftInfos(infos);
  }

  async function loadTotalSupply() {
    const total = await nft.getTotalSupply();
    setTotalSupply(total);
  }

  async function handleMint() {
    setIsMinting(true);
    const result = await nft.mint();

    if (result.success) {
      // Show success modal instead of alert
      setMintedNFT({
        tokenId: result.tokenId,
        txHash: result.txHash
      });
      setShowSuccessModal(true);

      // Reload NFTs
      await loadMyNFTs();
      await loadTotalSupply();
    } else {
      alert(`❌ Mint failed: ${result.error}`);
    }

    setIsMinting(false);
  }

  async function handleReveal(tokenId) {
    return await nft.revealRarity(tokenId);
  }

  if (!isConnected) {
    return (
      <div className="app">
        <header className="header">
          <h1 className="title">🎁 Mystery NFT</h1>
          <p className="subtitle">Encrypted rarity with FHEVM</p>
          <WalletConnectRainbow />
        </header>

        <div className="connect-prompt">
          <p>👆 Connect your wallet to get started</p>
        </div>

        <footer className="footer">
          <p>
            Powered by{' '}
            <a
              href="https://docs.zama.ai/fhevm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zama FHEVM
            </a>
          </p>
        </footer>
      </div>
    );
  }

  if (!fhevmReady) {
    return (
      <div className="app">
        <header className="header">
          <h1 className="title">🎁 Mystery NFT</h1>
          <p className="subtitle">Encrypted rarity with FHEVM</p>
          <WalletConnectRainbow />
        </header>

        <div className="loading">
          <div className="spinner"></div>
          <p>Initializing FHEVM with your wallet...</p>
        </div>

        <footer className="footer">
          <p>
            Powered by{' '}
            <a
              href="https://docs.zama.ai/fhevm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zama FHEVM
            </a>
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">🎁 Mystery NFT</h1>
        <p className="subtitle">Encrypted rarity with FHEVM</p>
        <WalletConnectRainbow />
      </header>

      <main className="main">
        <section className="mint-section">
          <h2>Mint Mystery NFT</h2>
          <p>Mint a mystery box NFT with encrypted rarity!</p>
          <p className="stats">Total Minted: {totalSupply}</p>

          <button
            className="mint-button gift-box-button"
            onClick={handleMint}
            disabled={isMinting || nft.loading}
          >
            <GiftBoxIcon className="gift-box-icon" />
            <span className="button-text">
              {isMinting ? 'Minting...' : 'Mint Free NFT'}
            </span>
          </button>

          {nft.error && (
            <div className="error-message">
              ❌ {nft.error}
            </div>
          )}
        </section>

        <section className="nfts-section">
          <h2>My Mystery NFTs ({myNFTs.length})</h2>

          {myNFTs.length === 0 ? (
            <p className="no-nfts">You don't have any NFTs yet. Mint one above!</p>
          ) : (
            <div className="nft-grid">
              {myNFTs.map(tokenId => (
                <NFTCard
                  key={tokenId}
                  tokenId={tokenId}
                  nftInfo={nftInfos[tokenId]}
                  onReveal={handleReveal}
                  isRevealing={nft.loading}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          Powered by{' '}
          <a
            href="https://docs.zama.ai/fhevm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zama FHEVM
          </a>
        </p>
        {nft.contractAddress && (
          <p className="contract-address">
            Contract: {nft.contractAddress.slice(0, 8)}...{nft.contractAddress.slice(-6)}
          </p>
        )}
      </footer>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        tokenId={mintedNFT.tokenId}
        txHash={mintedNFT.txHash}
      />
    </div>
  );
}
