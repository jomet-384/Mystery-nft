// Wagmi hooks adapter for Mystery NFT
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export function useWalletRainbow() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  // Get ethers provider and signer when connected
  useEffect(() => {
    async function getProviderAndSigner() {
      if (isConnected && connector && window.ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const ethSigner = await ethProvider.getSigner();
          setProvider(ethProvider);
          setSigner(ethSigner);
          console.log('✅ Provider and signer ready:', address);
        } catch (error) {
          console.error('Failed to get provider/signer:', error);
        }
      } else {
        setProvider(null);
        setSigner(null);
      }
    }
    getProviderAndSigner();
  }, [isConnected, connector, address]);

  return {
    address,
    provider,
    signer,
    isConnected,
    connect: () => {
      // Connect to first available connector (MetaMask or OKX)
      const injectedConnector = connectors[0];
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
    },
    disconnect,
  };
}
