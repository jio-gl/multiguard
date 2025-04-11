const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const address = await deployer.getAddress();
  console.log(`Deployer address: ${address}`);
  return address;
}

main()
  .then((address) => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 