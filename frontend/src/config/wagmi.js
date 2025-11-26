// Wagmi and RainbowKit configuration - Injected wallets only (no WalletConnect)
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, okxWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Configure only MetaMask and OKX (injected wallets, no WalletConnect ID needed)
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, okxWallet],
    },
  ],
  {
    appName: 'Mystery NFT',
    projectId: 'no-walletconnect', // Dummy ID, won't be used for injected wallets
  }
);

export const config = createConfig({
  connectors,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(), // Use public RPC
  },
});
