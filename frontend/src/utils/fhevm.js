// FHEVM initialization and utility functions
let fhevmInstance = null;

/**
 * Initialize FHEVM instance after wallet connection
 * @param {Object} provider - Ethers provider from connected wallet (not used directly, we use window.ethereum)
 * @returns {Promise<Object>} FHEVM instance
 */
export async function initializeFhevm(provider) {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  if (!provider) {
    throw new Error('Provider is required. Connect wallet first.');
  }

  // Verify window.ethereum is available
  if (!window.ethereum) {
    throw new Error('window.ethereum not available. Please install MetaMask.');
  }

  try {
    console.log('🔐 Initializing FHEVM...');

    // Check if RelayerSDK is loaded from CDN
    const sdk = window.RelayerSDK || window.relayerSDK;
    if (!sdk) {
      throw new Error('RelayerSDK not loaded. Please include the CDN script in index.html');
    }

    const { initSDK, createInstance, SepoliaConfig } = sdk;

    // Initialize SDK first
    await initSDK();
    console.log('✅ FHEVM SDK initialized');

    // Create instance with window.ethereum (EIP-1193 provider)
    // The SDK expects the raw window.ethereum object, not an ethers provider
    const config = {
      ...SepoliaConfig,
      network: window.ethereum  // Must be EIP-1193 provider (window.ethereum)
    };

    fhevmInstance = await createInstance(config);
    console.log('✅ FHEVM instance created with connected wallet');

    return fhevmInstance;
  } catch (error) {
    console.error('❌ Failed to initialize FHEVM:', error);
    throw error;
  }
}

/**
 * Get the current FHEVM instance
 * @returns {Object|null} FHEVM instance or null if not initialized
 */
export function getFhevmInstance() {
  return fhevmInstance;
}

/**
 * Reset FHEVM instance (call when wallet disconnects)
 */
export function resetFhevmInstance() {
  fhevmInstance = null;
  console.log('🔄 FHEVM instance reset');
}

/**
 * Decrypt an encrypted value using user's EIP-712 signature
 * @param {string} handle - The encrypted handle (bytes32)
 * @param {string} contractAddress - The contract address
 * @param {Object} signer - Ethers signer
 * @returns {Promise<number>} Decrypted value
 */
export async function decryptValue(handle, contractAddress, signer) {
  const fhe = getFhevmInstance();
  if (!fhe) {
    throw new Error('FHE instance not initialized. Call initializeFhevm() first.');
  }

  console.log('🔓 Decrypting value...');
  console.log('Handle:', handle);
  console.log('Contract:', contractAddress);

  try {
    // Generate keypair for decryption
    const keypair = fhe.generateKeypair();
    const userAddress = await signer.getAddress();

    const handleContractPairs = [
      {
        handle: handle,
        contractAddress: contractAddress,
      },
    ];

    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10';
    const contractAddresses = [contractAddress];

    // Create EIP-712 message
    const eip712 = fhe.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );

    // Request user signature
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );

    // Decrypt using relayer
    const result = await fhe.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );

    const decryptedValue = Number(result[handle]);
    console.log('✅ Decrypted value:', decryptedValue);

    return decryptedValue;
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw error;
  }
}

/**
 * Get rarity name and color from rarity level
 * @param {number} rarity - Rarity level (1-4)
 * @returns {Object} Rarity info with name, color, emoji, and image
 */
export function getRarityInfo(rarity) {
  const rarities = {
    1: {
      name: 'Common',
      color: '#808080',
      emoji: '⚪',
      image: '/img/Common.png'
    },
    2: {
      name: 'Rare',
      color: '#0080ff',
      emoji: '🔵',
      image: '/img/Rare.png'
    },
    3: {
      name: 'Epic',
      color: '#9370db',
      emoji: '🟣',
      image: '/img/Epic.png'
    },
    4: {
      name: 'Legendary',
      color: '#ffd700',
      emoji: '🟡',
      image: '/img/Legendary.png'
    }
  };

  return rarities[rarity] || {
    name: 'Unknown',
    color: '#000000',
    emoji: '❓',
    image: null
  };
}
