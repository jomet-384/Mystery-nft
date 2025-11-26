const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MysteryNFT contract...");

  // Get the contract factory
  const MysteryNFT = await hre.ethers.getContractFactory("MysteryNFT");

  // Deploy the contract
  console.log("⏳ Deploying...");
  const mysteryNFT = await MysteryNFT.deploy();

  await mysteryNFT.waitForDeployment();

  const contractAddress = await mysteryNFT.getAddress();

  console.log("✅ MysteryNFT deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  // Save to JSON file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(
    deploymentsDir,
    `${hre.network.name}.json`
  );

  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📄 Deployment info saved to:", deploymentPath);

  // Copy ABI to frontend
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/MysteryNFT.sol/MysteryNFT.json"
  );

  const frontendContractsDir = path.join(
    __dirname,
    "../frontend/src/contracts"
  );

  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiPath = path.join(frontendContractsDir, "MysteryNFT.json");

    fs.writeFileSync(
      abiPath,
      JSON.stringify(
        {
          address: contractAddress,
          abi: artifact.abi
        },
        null,
        2
      )
    );

    console.log("📋 ABI copied to frontend:", abiPath);
  }

  // Verify on Etherscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await mysteryNFT.deploymentTransaction().wait(5);

    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: []
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Error verifying contract:", error.message);
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("📝 Contract Address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
