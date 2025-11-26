// Wagmi hooks adapter for Mystery NFT
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export function useWalletRainbow() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [signer, setSigner] = useState(null);

  // Get ethers signer when connected
  useEffect(() => {
    async function getSigner() {
      if (isConnected && connector && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const ethSigner = await provider.getSigner();
          setSigner(ethSigner);
          console.log('✅ Signer ready:', address);
        } catch (error) {
          console.error('Failed to get signer:', error);
        }
      } else {
        setSigner(null);
      }
    }
    getSigner();
  }, [isConnected, connector, address]);

  return {
    address,
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
