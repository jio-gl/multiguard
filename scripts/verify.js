/**
 * Script to verify contracts on Arbitrum One
 * 
 * Usage:
 * npx hardhat run scripts/verify.js -- --contract <CONTRACT_NAME> --address <CONTRACT_ADDRESS> --args <CONSTRUCTOR_ARGS_FILE>
 * 
 * Example:
 * npx hardhat run scripts/verify.js -- --contract multiguard --address 0x1234567890123456789012345678901234567890 --args scripts/arguments.js
 */

const hre = require("hardhat");

async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const contractNameArg = args.find(arg => arg.startsWith("--contract="))?.split("=")[1];
  const contractAddressArg = args.find(arg => arg.startsWith("--address="))?.split("=")[1];
  const argsFileArg = args.find(arg => arg.startsWith("--args="))?.split("=")[1];
  
  // Convert contract name to PascalCase for the contract factory
  const contractName = contractNameArg ? 
    contractNameArg.charAt(0).toUpperCase() + contractNameArg.slice(1) : 
    null;
  
  const contractAddress = contractAddressArg;
  const argsFile = argsFileArg;
  
  if (!contractName || !contractAddress) {
    console.error("Usage: npx hardhat run scripts/verify.js -- --contract <CONTRACT_NAME> --address <CONTRACT_ADDRESS> --args <CONSTRUCTOR_ARGS_FILE>");
    process.exit(1);
  }
  
  console.log(`Verifying ${contractName} at ${contractAddress} on Arbitrum One...`);
  
  try {
    let constructorArguments = [];
    
    // Load constructor arguments from file if provided
    if (argsFile) {
      try {
        constructorArguments = require(`../${argsFile}`);
        console.log("Constructor arguments loaded from file:", constructorArguments);
      } catch (error) {
        console.error(`Error loading constructor arguments from ${argsFile}:`, error);
        process.exit(1);
      }
    }
    
    // Check if the contract is already verified
    try {
      const code = await hre.network.provider.send("eth_getCode", [contractAddress, "latest"]);
      if (code === "0x") {
        console.error(`No contract found at address ${contractAddress}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error checking contract existence: ${error.message}`);
      process.exit(1);
    }
    
    // Verify the contract
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: constructorArguments,
        network: "arbitrumOne"
      });
      
      console.log(`Successfully verified ${contractName} at ${contractAddress} on Arbitrum One`);
    } catch (error) {
      // Check if the error is because the contract is already verified
      if (error.message.includes("Already Verified")) {
        console.log(`Contract ${contractName} at ${contractAddress} is already verified on Arbitrum One`);
      } else {
        console.error("Error verifying contract:", error);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("Error verifying contract:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 