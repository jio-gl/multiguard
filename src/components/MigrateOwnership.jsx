import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HelpTooltip from './common/HelpTooltip';
import StepByStepGuide from './common/StepByStepGuide';

const MigrateOwnership = ({ signer, multiGuardAddress: defaultMultiGuardAddress, setTargetContractAddress }) => {
  const [contractAddress, setContractAddress] = useState('');
  const [contractABI, setContractABI] = useState('');
  const [contract, setContract] = useState(null);
  const [contractOwner, setContractOwner] = useState('');
  const [contractInfo, setContractInfo] = useState(null);
  const [migrationTxHash, setMigrationTxHash] = useState('');
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [localMultiGuardAddress, setLocalMultiGuardAddress] = useState(defaultMultiGuardAddress);

  // Update local state when prop changes
  useEffect(() => {
    if (defaultMultiGuardAddress) {
      setLocalMultiGuardAddress(defaultMultiGuardAddress);
    }
  }, [defaultMultiGuardAddress]);

  const checkContract = async () => {
    if (!ethers.isAddress(contractAddress)) {
      setError("Please enter a valid contract address");
      return;
    }
    
    if (!contractABI.trim()) {
      setError("Please enter the contract ABI");
      return;
    }
    
    try {
      const parsedABI = JSON.parse(contractABI);
      const contract = new ethers.Contract(contractAddress, parsedABI, signer);
      
      // First check if this is a MultiGuard contract
      try {
        if (contract.getFunction('getOwners')) {
          const owners = await contract.getOwners();
          setError("This appears to be a MultiGuard contract. Please enter the contract you want to protect instead.");
          return;
        }
      } catch (e) {
        // Not a MultiGuard contract, continue with normal flow
      }
      
      // Check if contract has owner() function
      try {
        if (!contract.getFunction('owner')) {
          setError("This contract doesn't have an 'owner' function");
          return;
        }
        
        const owner = await contract.owner();
        const signerAddress = await signer.getAddress();
        
        let name, symbol, totalSupply;
        try {
          if (contract.getFunction('name')) {
            name = await contract.name();
          }
          if (contract.getFunction('symbol')) {
            symbol = await contract.symbol();
          }
          if (contract.getFunction('totalSupply')) {
            totalSupply = await contract.totalSupply();
          }
          
          setContractInfo({
            name: name || "Unknown",
            symbol: symbol || "",
            totalSupply: totalSupply ? ethers.formatEther(totalSupply) : "Unknown"
          });
        } catch (e) {
          console.log("Could not get full token info", e);
        }
        
        setContract(contract);
        setContractOwner(owner);
        setTargetContractAddress(contractAddress);
        
        if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
          setError("You are not the owner of this contract");
        } else {
          setError('');
        }
      } catch (error) {
        console.error("Error checking contract:", error);
        setError("Failed to connect to the contract. Make sure the ABI is correct.");
      }
    } catch (error) {
      console.error("Error checking contract:", error);
      setError("Failed to connect to the contract. Make sure the ABI is correct.");
    }
  };

  const transferOwnership = async () => {
    if (!contract) {
      setError("Please check the contract first");
      return;
    }
    
    if (!ethers.isAddress(localMultiGuardAddress)) {
      setError("Please enter a valid MultiGuard Shield address");
      return;
    }
    
    try {
      const signerAddress = await signer.getAddress();
      
      if (contractOwner.toLowerCase() !== signerAddress.toLowerCase()) {
        setError("You are not the owner of this contract");
        return;
      }
      
      const tx = await contract.transferOwnership(localMultiGuardAddress);
      setMigrationTxHash(tx.hash);
      await tx.wait();
      
      alert(`Success! Your ${contractInfo?.name || "contract"} is now protected by MultiGuard`);
    } catch (error) {
      console.error("Transfer error:", error);
      let errorMessage = "Failed to transfer ownership";
      
      // Check if it's a user rejection
      if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected')) {
        errorMessage = "Transaction was cancelled in your wallet";
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Protect Your NFT or Token (or any Ownable contract)</h2>
          <HelpTooltip show={showHelp} onToggle={() => setShowHelp(!showHelp)} />
        </div>
        
        {showHelp && <StepByStepGuide type="migrate" />}
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Contract Address
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter contract address (0x...)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Contract ABI
            </label>
            <textarea
              value={contractABI}
              onChange={(e) => setContractABI(e.target.value)}
              placeholder="Paste contract ABI here (JSON format)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-32 font-mono"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              MultiGuard Shield Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localMultiGuardAddress}
                onChange={(e) => setLocalMultiGuardAddress(e.target.value)}
                placeholder="Enter or paste Shield address (0x...)"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(localMultiGuardAddress);
                }}
                className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {contractInfo && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Contract Details:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Name:</div>
                <div className="font-medium">{contractInfo.name}</div>
                
                {contractInfo.symbol && (
                  <>
                    <div className="text-gray-600">Symbol:</div>
                    <div className="font-medium">{contractInfo.symbol}</div>
                  </>
                )}
                
                {contractInfo.totalSupply && (
                  <>
                    <div className="text-gray-600">Total Supply:</div>
                    <div className="font-medium">{contractInfo.totalSupply}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {migrationTxHash && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
              Transfer in progress... Transaction: {migrationTxHash.substring(0, 10)}...
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={checkContract}
              className="flex-1 py-3 px-4 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700"
            >
              Check Contract
            </button>
            
            <button
              onClick={transferOwnership}
              disabled={!contractOwner || error}
              className={`flex-1 py-3 px-4 rounded-md text-white font-medium ${
                !contractOwner || error ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Transfer to Shield
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrateOwnership; 