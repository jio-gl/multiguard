import React, { useState } from 'react';
import { ethers } from 'ethers';
import HelpTooltip from './common/HelpTooltip';
import StepByStepGuide from './common/StepByStepGuide';
import { MULTIGUARD_CONFIG } from '../config/contracts';

const DeployMultiGuard = ({ signer, setMultiGuardAddress }) => {
  const [ownerAddresses, setOwnerAddresses] = useState(['']);
  const [requiredApprovals, setRequiredApprovals] = useState(1);
  const [deadlineDuration, setDeadlineDuration] = useState(24);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployTxHash, setDeployTxHash] = useState('');
  const [deployError, setDeployError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const addOwnerField = () => setOwnerAddresses([...ownerAddresses, '']);
  
  const removeOwnerField = (index) => {
    const newOwners = [...ownerAddresses];
    newOwners.splice(index, 1);
    setOwnerAddresses(newOwners);
    if (requiredApprovals > newOwners.length) {
      setRequiredApprovals(newOwners.length > 0 ? newOwners.length : 1);
    }
  };

  const updateOwnerAddress = (index, value) => {
    const newOwners = [...ownerAddresses];
    newOwners[index] = value;
    setOwnerAddresses(newOwners);
  };

  const deployMultiGuard = async () => {
    const validOwners = ownerAddresses.filter(addr => ethers.isAddress(addr));
    
    if (validOwners.length === 0) {
      const error = "Please add at least one valid wallet address";
      console.error('Validation error:', error);
      setDeployError(error);
      return;
    }
    
    if (requiredApprovals <= 0 || requiredApprovals > validOwners.length) {
      const error = `Required approvals must be between 1 and ${validOwners.length}`;
      console.error('Validation error:', error);
      setDeployError(error);
      return;
    }
    
    setIsDeploying(true);
    setDeployError('');
    
    try {
      const factory = new ethers.ContractFactory(
        MULTIGUARD_CONFIG.abi,
        MULTIGUARD_CONFIG.bytecode,
        signer
      );
      
      const deadlineDurationInSeconds = ethers.getBigInt(deadlineDuration * 60 * 60);

      const contract = await factory.deploy(
        validOwners,
        ethers.getBigInt(requiredApprovals),
        deadlineDurationInSeconds,
        {
          gasLimit: 5000000
        }
      );
      
      const txHash = contract.deploymentTransaction().hash;
      setDeployTxHash(txHash);

      await contract.waitForDeployment();
      const address = await contract.getAddress();
      setMultiGuardAddress(address);
      setDeployTxHash('');
      
    } catch (error) {
      console.error("Deployment error:", {
        error,
        message: error.message,
        code: error.code,
        stack: error.stack,
        data: error.data
      });
      setDeployError(error.message || "Failed to create your Shield");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Create Your MultiGuard Shield</h2>
          <HelpTooltip show={showHelp} onToggle={() => setShowHelp(!showHelp)} />
        </div>
        
        {showHelp && <StepByStepGuide type="deploy" />}
        
        <div className="space-y-6">
          {/* Shield Members */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Shield Members
            </label>
            {ownerAddresses.map((address, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => updateOwnerAddress(index, e.target.value)}
                  placeholder="Enter wallet address (0x...)"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {ownerAddresses.length > 1 && (
                  <button
                    onClick={() => removeOwnerField(index)}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOwnerField}
              className="mt-2 text-indigo-600 text-sm font-medium hover:text-indigo-700"
            >
              + Add Another Person
            </button>
          </div>

          {/* Required Approvals */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Required Approvals
            </label>
            <input
              type="number"
              min="1"
              max={ownerAddresses.length}
              value={requiredApprovals}
              onChange={(e) => setRequiredApprovals(parseInt(e.target.value))}
              className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Voting Time */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Voting Time (hours)
            </label>
            <input
              type="number"
              min="1"
              max="720"
              value={deadlineDuration}
              onChange={(e) => setDeadlineDuration(parseInt(e.target.value))}
              className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {deployError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {deployError}
            </div>
          )}

          {deployTxHash && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
              Creating your Shield... Transaction: {deployTxHash.substring(0, 10)}...
            </div>
          )}

          <button
            onClick={deployMultiGuard}
            disabled={isDeploying}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
              isDeploying ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isDeploying ? 'Creating Shield...' : 'Create Shield'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeployMultiGuard; 