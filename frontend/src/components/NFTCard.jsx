// NFTCard component - Display NFT with reveal functionality
import { useState } from 'react';
import { getRarityInfo } from '../utils/fhevm';

export default function NFTCard({ tokenId, nftInfo, onReveal, isRevealing }) {
  const [revealedRarity, setRevealedRarity] = useState(null);

  async function handleReveal() {
    const result = await onReveal(tokenId);
    if (result.success) {
      setRevealedRarity(result.rarity);
    }
  }

  const isRevealed = nftInfo?.isRevealed || revealedRarity !== null;
  const rarity = revealedRarity || (isRevealed ? null : null);
  const rarityInfo = rarity ? getRarityInfo(rarity) : null;

  return (
    <div className="nft-card">
      <div className="nft-card-image">
        {!isRevealed ? (
          <div className="mystery-box">
            <span className="mystery-icon">🎁</span>
            <p className="mystery-text">Mystery Box</p>
          </div>
        ) : (
          <div
            className="revealed-box"
            style={{ backgroundColor: rarityInfo?.color }}
          >
            {rarityInfo?.image ? (
              <img
                src={rarityInfo.image}
                alt={rarityInfo.name}
                className="rarity-image"
              />
            ) : (
              <>
                <span className="rarity-emoji">{rarityInfo?.emoji}</span>
                <p className="rarity-name">{rarityInfo?.name}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="nft-card-content">
        <h3 className="nft-title">Mystery NFT #{tokenId}</h3>

        {rarityInfo && (
          <div className="rarity-badge">
            <span className="rarity-badge-emoji">{rarityInfo.emoji}</span>
            <span className="rarity-badge-name">{rarityInfo.name}</span>
          </div>
        )}

        {nftInfo && (
          <div className="nft-info">
            <p className="nft-minted">
              Minted: {new Date(nftInfo.mintedAt * 1000).toLocaleDateString()}
            </p>
          </div>
        )}

        {!isRevealed ? (
          <button
            className="reveal-button"
            onClick={handleReveal}
            disabled={isRevealing}
          >
            {isRevealing ? 'Revealing...' : '🔓 Reveal Rarity'}
          </button>
        ) : (
          <div className="revealed-badge">
            ✅ Revealed
          </div>
        )}
      </div>
    </div>
  );
}
