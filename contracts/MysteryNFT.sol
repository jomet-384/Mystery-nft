// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {FHE, euint8, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title MysteryNFT
 * @notice A mystery box NFT with encrypted random rarity that can only be revealed by the owner
 * @dev Rarity levels: 1=Common(50%), 2=Rare(30%), 3=Epic(15%), 4=Legendary(5%)
 *      Uses FHE.randEuint8() for true encrypted random number generation
 */
contract MysteryNFT is ERC721, ZamaEthereumConfig {

    // Struct to store NFT data
    struct NFTData {
        euint8 encryptedRarity;   // Encrypted rarity level (1-4)
        bool isRevealed;          // Whether the rarity has been revealed
        uint256 mintedAt;         // Timestamp when minted
    }

    // State variables
    mapping(uint256 => NFTData) private nftData;
    uint256 private tokenIdCounter;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 timestamp
    );

    event RarityRevealed(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 timestamp
    );

    constructor() ERC721("MysteryNFT", "MNFT") {}

    /**
     * @notice Mint a new mystery NFT with encrypted random rarity
     * @dev Uses FHE.randEuint8() for secure random generation
     *      Probability distribution using FHE.lt() for comparisons:
     *      0-127 (50%) = Common
     *      128-204 (30%) = Rare
     *      205-242 (15%) = Epic
     *      243-255 (5%) = Legendary
     * @return tokenId The ID of the newly minted NFT
     */
    function mint() external returns (uint256) {
        uint256 tokenId = tokenIdCounter++;

        // Generate encrypted random number (0-255)
        euint8 randomValue = FHE.randEuint8();

        // Map to rarity based on probability distribution:
        // 0-127 (50%) -> 1 (Common)
        // 128-204 (30%) -> 2 (Rare)
        // 205-242 (15%) -> 3 (Epic)
        // 243-255 (5%) -> 4 (Legendary)

        // Start with rarity = 1 (Common) as default
        euint8 rarity = FHE.asEuint8(1);

        // If randomValue >= 128, it's at least Rare (2)
        ebool isRareOrBetter = FHE.lt(FHE.asEuint8(127), randomValue);  // randomValue > 127
        rarity = FHE.select(isRareOrBetter, FHE.asEuint8(2), rarity);

        // If randomValue >= 205, it's at least Epic (3)
        ebool isEpicOrBetter = FHE.lt(FHE.asEuint8(204), randomValue);  // randomValue > 204
        rarity = FHE.select(isEpicOrBetter, FHE.asEuint8(3), rarity);

        // If randomValue >= 243, it's Legendary (4)
        ebool isLegendary = FHE.lt(FHE.asEuint8(242), randomValue);  // randomValue > 242
        rarity = FHE.select(isLegendary, FHE.asEuint8(4), rarity);

        // Allow this contract to use the encrypted value
        FHE.allowThis(rarity);

        // Allow the owner to decrypt the value (for user decryption via EIP-712 signature)
        FHE.allow(rarity, msg.sender);

        // Store NFT data
        nftData[tokenId] = NFTData({
            encryptedRarity: rarity,
            isRevealed: false,
            mintedAt: block.timestamp
        });

        // Mint the NFT to the sender
        _mint(msg.sender, tokenId);

        emit NFTMinted(tokenId, msg.sender, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Get the encrypted rarity for a token
     * @dev Only the owner can call this and decrypt the value on frontend using EIP-712 signature
     * @param tokenId The ID of the NFT
     * @return The encrypted rarity as bytes32 for frontend decryption
     */
    function getEncryptedRarity(uint256 tokenId)
        external
        view
        returns (bytes32)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(
            ownerOf(tokenId) == msg.sender,
            "Only owner can get encrypted rarity"
        );

        return FHE.toBytes32(nftData[tokenId].encryptedRarity);
    }

    /**
     * @notice Mark the NFT as revealed (optional, for tracking purposes)
     * @param tokenId The ID of the NFT
     */
    function markAsRevealed(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Only owner can reveal");
        require(!nftData[tokenId].isRevealed, "Already revealed");

        nftData[tokenId].isRevealed = true;

        emit RarityRevealed(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Check if an NFT has been revealed
     * @param tokenId The ID of the NFT
     * @return Whether the NFT has been revealed
     */
    function isRevealed(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftData[tokenId].isRevealed;
    }

    /**
     * @notice Get NFT metadata (public info)
     * @param tokenId The ID of the NFT
     * @return mintedAt Timestamp when the NFT was minted
     * @return isRev Whether the rarity has been revealed
     * @return owner Address of the current owner
     */
    function getNFTInfo(uint256 tokenId)
        external
        view
        returns (
            uint256 mintedAt,
            bool isRev,
            address owner
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        NFTData storage data = nftData[tokenId];
        return (
            data.mintedAt,
            data.isRevealed,
            ownerOf(tokenId)
        );
    }

    /**
     * @notice Get total number of minted NFTs
     * @return Total supply
     */
    function totalSupply() external view returns (uint256) {
        return tokenIdCounter;
    }

    /**
     * @notice Get all token IDs owned by an address
     * @param owner The address to query
     * @return Array of token IDs
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;

        for (uint256 i = 0; i < tokenIdCounter && index < tokenCount; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }

        return tokenIds;
    }
}
