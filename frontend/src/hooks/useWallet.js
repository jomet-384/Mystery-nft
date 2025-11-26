// React hook for wallet connection
import { useState, useEffect } from 'react';
import { connectWallet, getWalletInfo, disconnectWallet } from '../utils/wallet';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  async function checkConnection() {
    const walletInfo = await getWalletInfo();
    if (walletInfo) {
      setAddress(walletInfo.address);
      setSigner(walletInfo.signer);
    }
  }

  async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // User disconnected
      setAddress(null);
      setSigner(null);
      disconnectWallet();
    } else {
      // User switched accounts
      checkConnection();
    }
  }

  async function connect() {
    setIsConnecting(true);
    setError(null);

    try {
      const walletInfo = await connectWallet();
      setAddress(walletInfo.address);
      setSigner(walletInfo.signer);
    } catch (err) {
      setError(err.message);
      console.error('Failed to connect:', err);
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnect() {
    disconnectWallet();
    setAddress(null);
    setSigner(null);
  }

  return {
    address,
    signer,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect
  };
}
