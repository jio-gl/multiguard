/**
 * Script to deploy and verify the MultiGuard contract on Arbitrum One
 * 
 * Usage:
 * npx hardhat run scripts/deployArbitrum.js --network arbitrumOne
 */

const hre = require("hardhat");

async function main() {
  console.log("Starting deployment to Arbitrum One...");
  
  // Get the constructor arguments from the arguments.js file
  const constructorArguments = require("./arguments");
  console.log("\nConstructor Arguments:");
  console.log("- Owners:", constructorArguments[0]);
  console.log("- Required Approvals:", constructorArguments[1]);
  console.log("- Proposal Deadline Duration:", constructorArguments[2], "seconds");
  
  // Deploy the contract
  console.log("\nDeploying MultiGuard contract...");
  const MultiGuard = await hre.ethers.getContractFactory("MultiGuard");
  const multiGuard = await MultiGuard.deploy(...constructorArguments);
  
  await multiGuard.waitForDeployment();
  
  const address = await multiGuard.getAddress();
  console.log("\n✅ MultiGuard deployed to:", address);
  
  // Wait for a few blocks to ensure the deployment is confirmed
  console.log("\nWaiting for 5 blocks to be mined for better confirmation...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  
  // Verify the contract
  console.log("\nVerifying contract on Arbiscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
      network: "arbitrumOne"
    });
    console.log("\n✅ Contract successfully verified on Arbiscan!");
    console.log(`\nView your contract at: https://arbiscan.io/address/${address}#code`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract was already verified!");
    } else {
      console.error("\n❌ Error verifying contract:", error);
      console.log("\nYou can try verifying manually with:");
      console.log(`npx hardhat verify --network arbitrumOne ${address} --constructor-args scripts/arguments.js`);
    }
  }
  
  return address;
}

main()
  .then((address) => {
    console.log("\n✨ Deployment and verification complete!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error in deployment:", error);
    process.exit(1);
  }); 