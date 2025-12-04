const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleMintToken...");

  const SimpleMintToken = await hre.ethers.getContractFactory("SimpleMintToken");
  const token = await SimpleMintToken.deploy();

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("SimpleMintToken deployed to:", address);

  // Save contract address for frontend
  const fs = require("fs");
  const contractInfo = {
    address: address,
    abi: SimpleMintToken.interface.format("json"),
  };

  fs.writeFileSync(
    "./contract-info.json",
    JSON.stringify(contractInfo, null, 2)
  );
  console.log("Contract info saved to contract-info.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});