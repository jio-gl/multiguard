const hre = require("hardhat");

async function main() {
  console.log("Deploying ExampleToken...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ExampleToken = await hre.ethers.getContractFactory("ExampleToken");
  const token = await ExampleToken.deploy();

  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log(`ExampleToken deployed to: ${address}`);
  console.log("Owner address:", await token.owner());

  // Mint some tokens to the deployer for testing
  const mintAmount = hre.ethers.parseEther("1000000"); // 1 million tokens
  await token.mint(deployer.address, mintAmount);
  console.log(`Minted ${hre.ethers.formatEther(mintAmount)} tokens to ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 