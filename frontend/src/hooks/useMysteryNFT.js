// React hook for MysteryNFT contract interactions
import { useState } from 'react';
import { ethers } from 'ethers';
import { decryptValue } from '../utils/fhevm';
import contractData from '../contracts/MysteryNFT.json';

// Import contract ABI and address (generated after deployment)
// Avoid top-level await so that build targets older environments safely
const contractAddress = contractData?.address ?? null;
const contractABI = contractData?.abi ?? null;

export function useMysteryNFT(signer) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get contract instance
   */
  function getContract() {
    if (!contractAddress || !contractABI) {
      throw new Error('Contract not deployed');
    }
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    return new ethers.Contract(contractAddress, contractABI, signer);
  }

  /**
   * Mint a new mystery NFT
   */
  async function mint() {
    setLoading(true);
    setError(null);

    try {
      console.log('🎁 Minting mystery NFT...');
      const contract = getContract();
      const tx = await contract.mint();
      console.log('⏳ Waiting for transaction...');
      const receipt = await tx.wait();

      // Get token ID from event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'NFTMinted'
      );

      const tokenId = event ? event.args[0] : null;

      console.log('✅ NFT minted! Token ID:', tokenId?.toString());

      return {
        success: true,
        tokenId: tokenId?.toString(),
        txHash: receipt.hash
      };
    } catch (err) {
      console.error('❌ Mint failed:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get user's NFT token IDs
   */
  async function getMyNFTs(address) {
    setLoading(true);
    setError(null);

    try {
      console.log('📋 Fetching NFTs for:', address);
      const contract = getContract();
      const tokenIds = await contract.tokensOfOwner(address);
      console.log('✅ Found NFTs:', tokenIds.map(id => id.toString()));

      return tokenIds.map(id => id.toString());
    } catch (err) {
      console.error('❌ Failed to fetch NFTs:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get NFT info (public data)
   */
  async function getNFTInfo(tokenId) {
    try {
      const contract = getContract();
      const [mintedAt, isRevealed, owner] = await contract.getNFTInfo(tokenId);

      return {
        mintedAt: Number(mintedAt),
        isRevealed,
        owner
      };
    } catch (err) {
      console.error('❌ Failed to get NFT info:', err);
      throw err;
    }
  }

  /**
   * Reveal (decrypt) NFT rarity
   */
  async function revealRarity(tokenId) {
    setLoading(true);
    setError(null);

    try {
      console.log('🔓 Revealing rarity for token:', tokenId);
      const contract = getContract();

      // Get encrypted rarity handle
      const encryptedHandle = await contract.getEncryptedRarity(tokenId);
      console.log('Got encrypted handle:', encryptedHandle);

      // Decrypt using EIP-712 signature (completely free, off-chain)
      const rarity = await decryptValue(
        encryptedHandle,
        contractAddress,
        signer
      );

      console.log('✅ Revealed rarity:', rarity);

      // No need to call markAsRevealed() - decryption is fully off-chain and free
      // User can decrypt unlimited times without paying gas

      return {
        success: true,
        rarity
      };
    } catch (err) {
      console.error('❌ Reveal failed:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get total supply
   */
  async function getTotalSupply() {
    try {
      const contract = getContract();
      const total = await contract.totalSupply();
      return Number(total);
    } catch (err) {
      console.error('❌ Failed to get total supply:', err);
      return 0;
    }
  }

  return {
    contractAddress,
    loading,
    error,
    mint,
    getMyNFTs,
    getNFTInfo,
    revealRarity,
    getTotalSupply
  };
}
