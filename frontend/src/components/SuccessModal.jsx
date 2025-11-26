// Success Modal Component
import { useEffect } from 'react';
import './SuccessModal.css';

export default function SuccessModal({ isOpen, onClose, tokenId, txHash }) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>

        <h2 className="modal-title">🎉 Mint Successful!</h2>

        <div className="modal-info">
          <div className="info-item">
            <span className="info-label">NFT ID:</span>
            <span className="info-value">#{tokenId}</span>
          </div>

          {txHash && (
            <div className="info-item">
              <span className="info-label">Transaction:</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </div>
          )}
        </div>

        <p className="modal-message">
          Your Mystery NFT has been minted!<br />
          Scroll down to reveal its rarity 🔓
        </p>

        <button className="modal-close-btn" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
}
