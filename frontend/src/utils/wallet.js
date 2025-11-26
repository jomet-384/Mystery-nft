// Wallet connection utilities
import { ethers } from 'ethers';

let provider = null;
let signer = null;

/**
 * Connect to MetaMask wallet
 * @returns {Promise<Object>} Wallet info with address and signer
 */
export async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  try {
    console.log('🦊 Connecting to MetaMask...');

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Get provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    console.log('✅ Connected to:', address);

    return {
      address,
      signer,
      provider
    };
  } catch (error) {
    console.error('❌ Failed to connect wallet:', error);
    throw error;
  }
}

/**
 * Get current wallet connection status
 * @returns {Promise<Object|null>} Wallet info or null if not connected
 */
export async function getWalletInfo() {
  if (!provider || !signer) {
    return null;
  }

  try {
    const address = await signer.getAddress();
    return {
      address,
      signer,
      provider
    };
  } catch (error) {
    console.error('❌ Failed to get wallet info:', error);
    return null;
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet() {
  provider = null;
  signer = null;
  console.log('👋 Wallet disconnected');
}

/**
 * Switch to local Hardhat network
 */
export async function switchToLocalNetwork() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x7a69' }], // 31337 in hex
    });
  } catch (switchError) {
    // If the network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x7a69',
              chainName: 'Hardhat Local',
              rpcUrls: ['http://localhost:8545'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
}