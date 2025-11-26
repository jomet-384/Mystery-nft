// WalletConnect component
import { useWallet } from '../hooks/useWallet';

export default function WalletConnect() {
  const { address, isConnected, isConnecting, error, connect, disconnect } = useWallet();

  function formatAddress(addr) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  return (
    <div className="wallet-connect">
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {!isConnected ? (
        <button
          className="connect-button"
          onClick={connect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask'}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="wallet-address">👤 {formatAddress(address)}</span>
          <button
            className="disconnect-button"
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
