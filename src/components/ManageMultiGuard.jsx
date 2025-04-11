import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { deployMultiGuard, validateDeploymentParams, getMultiGuardContract } from '../utils/contractUtils';
import { MULTIGUARD_CONFIG } from '../config/contracts';
import HelpTooltip from './common/HelpTooltip';
import StepByStepGuide from './common/StepByStepGuide';
import { formatProposalType } from '../utils/helpers';
import ProposalHistory from './ProposalHistory';

// Common contract ABIs for basic functions
const COMMON_ABIS = {
  transfer: ["function transfer(address to, uint256 amount)"],
  approve: ["function approve(address spender, uint256 amount)"],
  mint: ["function mint(address to, uint256 amount)"],
  burn: ["function burn(uint256 amount)"],
  transferNFT: ["function transferFrom(address from, address to, uint256 tokenId)"],
  setURI: ["function setURI(uint256 tokenId, string memory uri)"],
  setText: ["function setText(string memory key, string memory value)"],
  transferOwnership: ["function transferOwnership(address newOwner)"]
};

const FUNCTION_OPTIONS = [
  { value: 'transfer', label: 'Transfer Tokens', description: 'Send tokens to another address' },
  { value: 'approve', label: 'Approve Spender', description: 'Allow another address to spend your tokens' },
  { value: 'mint', label: 'Mint Tokens', description: 'Create new tokens (if you have permission)' },
  { value: 'burn', label: 'Burn Tokens', description: 'Destroy tokens (reduces total supply)' },
  { value: 'transferNFT', label: 'Transfer NFT', description: 'Send an NFT to another address' },
  { value: 'setURI', label: 'Set Token URI', description: 'Update the metadata URI for a token' },
  { value: 'setText', label: 'Set ENS Text Record', description: 'Set a text record for an ENS name (e.g., email, url, avatar)' },
  { value: 'transferOwnership', label: 'Transfer Ownership', description: 'Transfer contract ownership to a new address' }
];

const ManageMultiGuard = ({ provider, signer, account, existingAddress }) => {
  const [deploymentParams, setDeploymentParams] = useState({
    owners: [''],
    requiredApprovals: 1,
    proposalDeadlineDuration: 86400, // 24 hours in seconds
  });
  const [existingContract, setExistingContract] = useState({
    address: existingAddress || '',
    contract: null,
    owners: [],
    requiredApprovals: 0,
    proposalDeadlineDuration: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  
  // New state variables for proposals
  const [proposals, setProposals] = useState([]);
  const [newProposal, setNewProposal] = useState({
    type: 'Transaction',
    targetContract: '',
    data: '',
    value: '0',
    newOwner: '',
    ownerToRemove: '',
    newRequiredApprovals: 1,
    newDeadlineDuration: 86400,
    pauseDuration: 3600,
    isAdvancedMode: false,
    selectedFunction: 'transfer',
    functionParams: {
      recipient: '',
      amount: '0',
      tokenId: '',
      spender: '',
      message: ''
    }
  });
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showAllProposals, setShowAllProposals] = useState(false);

  const handleOwnerChange = (index, value) => {
    const newOwners = [...deploymentParams.owners];
    newOwners[index] = value;
    setDeploymentParams({ ...deploymentParams, owners: newOwners });
  };

  const addOwnerField = () => {
    setDeploymentParams({
      ...deploymentParams,
      owners: [...deploymentParams.owners, ''],
    });
  };

  const removeOwnerField = (index) => {
    const newOwners = deploymentParams.owners.filter((_, i) => i !== index);
    setDeploymentParams({ ...deploymentParams, owners: newOwners });
  };

  const handleDeployment = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { owners, requiredApprovals, proposalDeadlineDuration } = deploymentParams;
      const validation = validateDeploymentParams(
        owners.filter(owner => owner.trim() !== ''),
        requiredApprovals,
        proposalDeadlineDuration
      );

      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      const result = await deployMultiGuard(
        signer,
        owners.filter(owner => owner.trim() !== ''),
        requiredApprovals,
        proposalDeadlineDuration
      );

      if (result.success) {
        setSuccess(`MultiGuard contract deployed successfully at ${result.address}`);
        setExistingContract({
          ...existingContract,
          address: result.address,
          contract: result.contract,
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingContract = async () => {
    setError('');
    try {
      console.log('Starting contract load process...');
      console.log('Contract address to load:', existingContract.address);
      console.log('Provider state:', {
        isProvider: !!provider,
        network: provider ? await provider.getNetwork() : null,
        currentBlock: provider ? await provider.getBlockNumber() : null
      });

      if (!existingContract.address) {
        console.log('Error: No contract address provided');
        setError('Please enter a contract address');
        return;
      }

      if (!provider) {
        console.log('Error: No provider available');
        setError('Provider not initialized');
        return;
      }

      try {
        // Trim any whitespace from the address
        const trimmedAddress = existingContract.address.trim();
        // Use ethers.getAddress to validate and convert to checksum address
        const checksumAddress = ethers.getAddress(trimmedAddress);
        console.log('Validated address:', checksumAddress);
        
        // Update the state with the trimmed and checksummed address
        setExistingContract(prev => ({
          ...prev,
          address: checksumAddress
        }));
      } catch (e) {
        console.log('Error: Invalid address format', e);
        setError('Invalid contract address format');
        return;
      }

      console.log('Loading contract at address:', existingContract.address);
      
      // Check if contract exists at the address first
      console.log('Checking contract bytecode...');
      const code = await provider.getCode(existingContract.address);
      console.log('Contract bytecode:', {
        bytecode: code,
        length: code.length,
        isDeployed: code !== '0x'
      });
      
      console.log('MULTIGUARD_CONFIG:', {
        hasAbi: !!MULTIGUARD_CONFIG.abi,
        abiLength: MULTIGUARD_CONFIG.abi?.length,
        hasBytecode: !!MULTIGUARD_CONFIG.bytecode,
        bytecodeLength: MULTIGUARD_CONFIG.bytecode?.length
      });
      
      if (code === '0x') {
        console.log('Error: No bytecode found at address');
        setError('No contract found at the specified address');
        return;
      }
      
      console.log('Creating contract instance...');
      const contract = getMultiGuardContract(existingContract.address, signer);
      
      console.log('Contract instance details:', {
        contract,
        target: contract?.target,
        interface: contract?.interface,
        runner: contract?.runner
      });

      if (!contract || !contract.interface) {
        console.log('Error: Invalid contract instance or missing interface');
        setError('Invalid contract instance - missing interface');
        return;
      }

      // Get functions from interface fragments instead of directly accessing functions
      const interfaceFragments = contract.interface.fragments || [];
      const functions = interfaceFragments
        .filter(fragment => fragment.type === 'function')
        .map(fragment => fragment.name);

      console.log('Contract interface:', {
        fragments: interfaceFragments,
        functions: functions
      });
      
      // Verify this is a MultiGuard contract by checking for required functions
      try {
        console.log('Verifying contract interface...');
        console.log('Available functions:', functions);
        
        const requiredFunctions = ['getOwners', 'getRequiredApprovals', 'proposalDeadlineDuration'];
        const missingFunctions = requiredFunctions.filter(f => !functions.includes(f));
        
        if (missingFunctions.length > 0) {
          console.log('Error: Missing required functions:', missingFunctions);
          setError('This does not appear to be a valid MultiGuard contract. Missing functions: ' + missingFunctions.join(', '));
          return;
        }
        
        // Try to call getOwners first as a test
        console.log('Testing getOwners() function...');
        const owners = await contract.getOwners();
        const requiredApprovals = await contract.getRequiredApprovals();
        const proposalDeadlineDuration = await contract.proposalDeadlineDuration();
        const proposalCount = await contract.proposalCount();
        const isPaused = await contract.isPaused();

        const contractState = {
          owners,
          requiredApprovals: requiredApprovals.toString(),
          proposalDeadlineDuration: proposalDeadlineDuration.toString(),
          proposalCount: proposalCount.toString(),
          isPaused
        };
        
        console.log('Contract state loaded:', contractState);

        setExistingContract({
          address: existingContract.address,
          contract,
          owners,
          requiredApprovals: Number(requiredApprovals),
          proposalDeadlineDuration: Number(proposalDeadlineDuration),
          proposalCount: Number(proposalCount),
          isPaused
        });
        
        setSuccess('Contract loaded successfully');
        console.log('Contract loaded successfully');
      } catch (functionError) {
        console.error('Error calling contract functions:', {
          error: functionError,
          message: functionError.message,
          code: functionError.code,
          stack: functionError.stack,
          data: functionError.data,
          errorName: functionError.constructor.name
        });
        setError('Error interacting with contract: ' + functionError.message);
      }
    } catch (error) {
      console.error('Error in contract loading process:', {
        error,
        message: error.message,
        code: error.code,
        stack: error.stack,
        data: error.data,
        errorName: error.constructor.name
      });
      setError('Failed to load contract: ' + error.message);
    }
  };

  const loadProposals = async () => {
    if (!existingContract.contract) return;
    
    try {
      const proposalCount = await existingContract.contract.proposalCount();
      const loadedProposals = [];
      
      for (let i = 1; i <= Number(proposalCount); i++) {
        const details = await existingContract.contract.getProposalDetails(i);
        const approvers = await existingContract.contract.getApprovers(i);
        
        // Get values directly from details instead of decoding
        const proposalType = Number(details.proposalType);

        let newOwner = null;
        let ownerToRemove = null;
        let newRequiredApprovals = null;
        let newDeadlineDuration = null;
        let pauseDuration = null;

        if (proposalType === 2) { // Add Owner
          newOwner = details.newOwner;
        } else if (proposalType === 3) { // Remove Owner
          ownerToRemove = details.ownerToRemove;
        } else if (proposalType === 1) { // Change Required Approvals
          newRequiredApprovals = details.newRequiredApprovals ? Number(details.newRequiredApprovals) : null;
        }
        
        loadedProposals.push({
          id: i,
          type: proposalType,
          proposer: details.proposer,
          targetContract: details.targetContract,
          data: details.data,
          value: details.value.toString(),
          proposalTime: Number(details.proposalTime),
          deadline: Number(details.deadline),
          executed: details.executed,
          cancelled: details.cancelled,
          approvalCount: Number(details.approvalCount),
          approvers,
          newRequiredApprovals,
          newOwner,
          ownerToRemove,
          newDeadlineDuration,
          pauseDuration
        });
      }
      
      setProposals(loadedProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      setError('Failed to load proposals: ' + error.message);
    }
  };

  const encodeTransactionData = () => {
    if (newProposal.isAdvancedMode) {
      return newProposal.data;
    }

    try {
      const iface = new ethers.Interface(COMMON_ABIS[newProposal.selectedFunction]);
      let params = [];

      switch (newProposal.selectedFunction) {
        case 'transfer':
          params = [
            newProposal.functionParams.recipient,
            ethers.parseUnits(newProposal.functionParams.amount, 18)
          ];
          break;
        case 'approve':
          params = [
            newProposal.functionParams.spender,
            ethers.parseUnits(newProposal.functionParams.amount, 18)
          ];
          break;
        case 'mint':
          params = [
            newProposal.functionParams.recipient,
            ethers.parseUnits(newProposal.functionParams.amount, 18)
          ];
          break;
        case 'burn':
          params = [ethers.parseUnits(newProposal.functionParams.amount, 18)];
          break;
        case 'transferNFT':
          params = [
            account,
            newProposal.functionParams.recipient,
            newProposal.functionParams.tokenId
          ];
          break;
        case 'setURI':
          params = [
            newProposal.functionParams.tokenId,
            newProposal.functionParams.uri
          ];
          break;
        case 'setText':
          params = [
            newProposal.functionParams.key,
            newProposal.functionParams.value
          ];
          break;
        case 'transferOwnership':
          params = [newProposal.functionParams.newOwner];
          break;
      }

      return iface.encodeFunctionData(newProposal.selectedFunction, params);
    } catch (error) {
      console.error('Error encoding function data:', error);
      throw new Error('Failed to encode function data. Please check the function name and parameters.');
    }
  };

  const createProposal = async () => {
    setError('');
    
    // Validate target contract for transaction proposals
    if (newProposal.type === 'Transaction') {
      if (!newProposal.targetContract || !newProposal.targetContract.trim()) {
        setError('Please enter the target contract address');
        return;
      }
      if (!ethers.isAddress(newProposal.targetContract)) {
        setError('Please enter a valid target contract address');
        return;
      }
    }

    try {
      let data = '0x';
      
      if (newProposal.type === 'Transaction') {
        if (newProposal.isAdvancedMode) {
          if (!newProposal.data?.startsWith('0x')) {
            setError('Transaction data must start with 0x');
            return;
          }
          data = newProposal.data;
        } else {
          try {
            data = await encodeTransactionData();
          } catch (err) {
            console.error('Error encoding transaction data:', err);
            setError('Failed to encode function data. Please check your parameters.');
            return;
          }
        }
      }

      setLoading(true);
      setError('');
      
      let tx;
      console.log('Creating proposal of type:', newProposal.type);
      
      switch (newProposal.type) {
        case 'Transaction':
          tx = await existingContract.contract.proposeTransaction(
            newProposal.targetContract,
            data,
            ethers.parseEther(newProposal.value)
          );
          break;
        case 'AddOwner':
          tx = await existingContract.contract.proposeAddOwner(newProposal.newOwner);
          break;
        case 'RemoveOwner':
          tx = await existingContract.contract.proposeRemoveOwner(newProposal.ownerToRemove);
          break;
        case 'UpdateRequiredApprovals':
          tx = await existingContract.contract.proposeUpdateRequiredApprovals(
            newProposal.newRequiredApprovals
          );
          break;
        case 'UpdateDeadlineDuration':
          tx = await existingContract.contract.proposeUpdateDeadlineDuration(
            newProposal.newDeadlineDuration
          );
          break;
        case 'Pause':
          console.log('Creating pause proposal with duration:', newProposal.pauseDuration);
          tx = await existingContract.contract.proposePause(newProposal.pauseDuration);
          break;
        case 'Unpause':
          tx = await existingContract.contract.proposeUnpause();
          break;
        case 'TransferOwnership':
          tx = await existingContract.contract.proposeTransferOwnership(
            newProposal.functionParams.newOwner
          );
          break;
      }
      
      const receipt = await tx.wait();
      console.log('Proposal created, receipt:', receipt);
      
      // Add a small delay before loading proposals to ensure state is persisted
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Proposal created successfully');
      await loadProposals();
    } catch (error) {
      console.error('Error creating proposal:', error);
      
      // Extract the meaningful part of the revert message
      let errorMessage = error.message;
      
      // Check if it's a user rejection
      if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled in your wallet';
      } 
      // Check for revert messages
      else if (error.message.includes('execution reverted')) {
        // Try to extract the specific error message
        const match = error.message.match(/execution reverted: ([^"]+)/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          // Try to extract from the longer format
          const revertMatch = error.message.match(/reason="([^"]+)"/);
          if (revertMatch && revertMatch[1]) {
            errorMessage = revertMatch[1];
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const approveProposal = async (proposalId) => {
    if (!existingContract.contract) return;
    
    try {
      setLoading(true);
      setError('');
      
      const tx = await existingContract.contract.approveProposal(proposalId);
      await tx.wait();
      setSuccess('Proposal approved successfully');
      await loadProposals();
    } catch (error) {
      console.error('Error approving proposal:', error);
      setError('Failed to approve proposal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const executeProposal = async (proposalId) => {
    if (!existingContract.contract) return;
    
    try {
      setLoading(true);
      setError('');
      
      const tx = await existingContract.contract.executeProposal(proposalId);
      await tx.wait();
      setSuccess('Proposal executed successfully');
      await loadProposals();
    } catch (error) {
      console.error('Error executing proposal:', error);
      setError('Failed to execute proposal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelProposal = async (proposalId) => {
    if (!existingContract.contract) return;
    
    try {
      setLoading(true);
      setError('');
      
      const tx = await existingContract.contract.cancelProposal(proposalId);
      await tx.wait();
      setSuccess('Proposal cancelled successfully');
      await loadProposals();
    } catch (error) {
      console.error('Error cancelling proposal:', error);
      setError('Failed to cancel proposal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load proposals when contract is loaded
  useEffect(() => {
    if (existingContract.contract) {
      loadProposals();
    }
  }, [existingContract.contract]);

  // Auto-load contract when address is provided
  useEffect(() => {
    if (existingAddress && provider && signer) {
      setExistingContract(prev => ({
        ...prev,
        address: existingAddress
      }));
      loadExistingContract();
    }
  }, [existingAddress, provider, signer]);

  if (showAllProposals && existingContract.contract) {
    return (
      <ProposalHistory
        contract={existingContract.contract}
        account={account}
        requiredApprovals={existingContract.requiredApprovals}
        onBack={() => setShowAllProposals(false)}
        approveProposal={approveProposal}
        executeProposal={executeProposal}
        cancelProposal={cancelProposal}
        loading={loading}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage MultiGuard</h2>
        <HelpTooltip show={showHelp} onToggle={() => setShowHelp(!showHelp)} />
      </div>

      {showHelp && <StepByStepGuide type="manage" />}

      {/* Deploy New Contract Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Deploy New Contract</h3>
        
        {/* Owners */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Owners</label>
          {deploymentParams.owners.map((owner, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={owner}
                onChange={(e) => handleOwnerChange(index, e.target.value)}
                placeholder="Owner address (0x...)"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {index > 0 && (
                <button
                  onClick={() => removeOwnerField(index)}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addOwnerField}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            + Add Owner
          </button>
        </div>

        {/* Required Approvals */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Approvals
          </label>
          <input
            type="number"
            value={deploymentParams.requiredApprovals}
            onChange={(e) => setDeploymentParams({
              ...deploymentParams,
              requiredApprovals: parseInt(e.target.value)
            })}
            min="1"
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Proposal Deadline Duration */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal Deadline Duration (seconds)
          </label>
          <input
            type="number"
            value={deploymentParams.proposalDeadlineDuration}
            onChange={(e) => setDeploymentParams({
              ...deploymentParams,
              proposalDeadlineDuration: parseInt(e.target.value)
            })}
            min="3600"
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleDeployment}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Deploying...' : 'Deploy Contract'}
        </button>
      </div>

      {/* Load Existing Contract Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Load Shield</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shield Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={existingContract.address}
              onChange={(e) => setExistingContract({
                ...existingContract,
                address: e.target.value
              })}
              placeholder="Enter Shield address (0x...)"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              onClick={loadExistingContract}
              disabled={loading}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Load Shield
            </button>
          </div>
        </div>

        {/* Contract Details Section */}
        {existingContract.contract && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Contract Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-mono break-all">{existingContract.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Required Approvals</p>
                <p>{existingContract.requiredApprovals}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Proposal Deadline</p>
                <p>{existingContract.proposalDeadlineDuration / 3600} hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${existingContract.isPaused ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <p className={existingContract.isPaused ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {existingContract.isPaused ? 'Paused' : 'Active'}
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-2">Owners</p>
                <div className="space-y-1">
                  {existingContract.owners.map((owner, index) => (
                    <p key={index} className="font-mono text-sm break-all">{owner}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Proposal Section */}
      {existingContract.contract && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create Proposal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Proposal Type</label>
              <select
                value={newProposal.type}
                onChange={(e) => setNewProposal({ ...newProposal, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Transaction">Transaction</option>
                <option value="AddOwner">Add Owner</option>
                <option value="RemoveOwner">Remove Owner</option>
                <option value="UpdateRequiredApprovals">Update Required Approvals</option>
                <option value="UpdateDeadlineDuration">Update Deadline Duration</option>
                <option value="Pause">Pause</option>
                <option value="Unpause">Unpause</option>
                <option value="TransferOwnership">Transfer Ownership</option>
              </select>
            </div>

            {/* Conditional fields based on proposal type */}
            {newProposal.type === 'Transaction' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="advancedMode"
                    checked={newProposal.isAdvancedMode}
                    onChange={(e) => setNewProposal({
                      ...newProposal,
                      isAdvancedMode: e.target.checked
                    })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="advancedMode" className="text-sm font-medium">
                    Advanced Mode
                  </label>
                  <HelpTooltip text="Switch to advanced mode to enter raw transaction data in hex format" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Target Contract
                      <HelpTooltip text="The address of the contract you want to interact with" />
                    </label>
                    <input
                      type="text"
                      value={newProposal.targetContract}
                      onChange={(e) => setNewProposal({
                        ...newProposal,
                        targetContract: e.target.value
                      })}
                      placeholder="0x..."
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  {newProposal.isAdvancedMode ? (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Transaction Data (Hex)
                        <HelpTooltip text="The raw transaction data in hex format (starting with 0x)" />
                        <a 
                          href="https://www.btcschools.net/ethereum/eth_abi.php" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Need help? Use ABI Encoder Tool ↗
                        </a>
                      </label>
                      <input
                        type="text"
                        value={newProposal.data}
                        onChange={(e) => setNewProposal({
                          ...newProposal,
                          data: e.target.value
                        })}
                        placeholder="0x..."
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  ) : (
                    <div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Function
                          <HelpTooltip text="Select the function you want to call" />
                        </label>
                        <select
                          value={newProposal.selectedFunction}
                          onChange={(e) => {
                            setNewProposal({
                              ...newProposal,
                              selectedFunction: e.target.value,
                              functionParams: {} // Reset params when function changes
                            });
                          }}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select a function...</option>
                          {FUNCTION_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {newProposal.selectedFunction && (
                          <p className="mt-1 text-sm text-gray-500">
                            {FUNCTION_OPTIONS.find(opt => opt.value === newProposal.selectedFunction)?.description}
                          </p>
                        )}
                      </div>

                      {/* Function Parameters */}
                      {newProposal.selectedFunction && (
                        <div className="space-y-4">
                          {['transfer', 'mint'].includes(newProposal.selectedFunction) && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Recipient Address
                                  <HelpTooltip text="The address that will receive the tokens" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.recipient || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      recipient: e.target.value
                                    }
                                  })}
                                  placeholder="0x..."
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Amount
                                  <HelpTooltip text="The amount of tokens to transfer" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.amount || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      amount: e.target.value
                                    }
                                  })}
                                  placeholder="0.0"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                            </>
                          )}

                          {newProposal.selectedFunction === 'approve' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Spender Address
                                  <HelpTooltip text="The address that will be allowed to spend your tokens" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.spender || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      spender: e.target.value
                                    }
                                  })}
                                  placeholder="0x..."
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Amount
                                  <HelpTooltip text="The amount of tokens the spender will be allowed to spend" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.amount || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      amount: e.target.value
                                    }
                                  })}
                                  placeholder="0.0"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                            </>
                          )}

                          {newProposal.selectedFunction === 'burn' && (
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Amount
                                <HelpTooltip text="The amount of tokens to burn" />
                              </label>
                              <input
                                type="text"
                                value={newProposal.functionParams.amount || ''}
                                onChange={(e) => setNewProposal({
                                  ...newProposal,
                                  functionParams: {
                                    ...newProposal.functionParams,
                                    amount: e.target.value
                                  }
                                })}
                                placeholder="0.0"
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          )}

                          {newProposal.selectedFunction === 'transferNFT' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Recipient Address
                                  <HelpTooltip text="The address that will receive the NFT" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.recipient || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      recipient: e.target.value
                                    }
                                  })}
                                  placeholder="0x..."
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Token ID
                                  <HelpTooltip text="The ID of the NFT to transfer" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.tokenId || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      tokenId: e.target.value
                                    }
                                  })}
                                  placeholder="1"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                            </>
                          )}

                          {newProposal.selectedFunction === 'setURI' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Token ID
                                  <HelpTooltip text="The ID of the token to update" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.tokenId || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      tokenId: e.target.value
                                    }
                                  })}
                                  placeholder="1"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  URI
                                  <HelpTooltip text="The new URI for the token's metadata" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.uri || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      uri: e.target.value
                                    }
                                  })}
                                  placeholder="https://..."
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                            </>
                          )}

                          {newProposal.selectedFunction === 'setText' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Key
                                  <HelpTooltip text="The ENS text record key (e.g., email, url, avatar, description)" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.key || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      key: e.target.value
                                    }
                                  })}
                                  placeholder="email"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Value
                                  <HelpTooltip text="The value for the ENS text record (e.g., user@example.com for email)" />
                                </label>
                                <input
                                  type="text"
                                  value={newProposal.functionParams.value || ''}
                                  onChange={(e) => setNewProposal({
                                    ...newProposal,
                                    functionParams: {
                                      ...newProposal.functionParams,
                                      value: e.target.value
                                    }
                                  })}
                                  placeholder="user@example.com"
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                            </>
                          )}

                          {newProposal.selectedFunction === 'transferOwnership' && (
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                New Owner Address
                                <HelpTooltip text="The address that will become the new owner of the contract" />
                              </label>
                              <input
                                type="text"
                                value={newProposal.functionParams.newOwner || ''}
                                onChange={(e) => setNewProposal({
                                  ...newProposal,
                                  functionParams: {
                                    ...newProposal.functionParams,
                                    newOwner: e.target.value
                                  }
                                })}
                                placeholder="0x..."
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Value (ETH)
                              <HelpTooltip text="The amount of ETH to send with the transaction" />
                            </label>
                            <input
                              type="text"
                              value={newProposal.value}
                              onChange={(e) => setNewProposal({
                                ...newProposal,
                                value: e.target.value
                              })}
                              placeholder="0.0"
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {newProposal.type === 'AddOwner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">New Owner Address</label>
                <input
                  type="text"
                  value={newProposal.newOwner}
                  onChange={(e) => setNewProposal({ ...newProposal, newOwner: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0x..."
                />
              </div>
            )}

            {newProposal.type === 'RemoveOwner' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner to Remove</label>
                <input
                  type="text"
                  value={newProposal.ownerToRemove}
                  onChange={(e) => setNewProposal({ ...newProposal, ownerToRemove: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0x..."
                />
              </div>
            )}

            {newProposal.type === 'UpdateRequiredApprovals' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">New Required Approvals</label>
                <div className="relative mt-1 rounded-md shadow-sm w-32">
                  <input
                    type="number"
                    value={newProposal.newRequiredApprovals}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        setNewProposal({ ...newProposal, newRequiredApprovals: value });
                      }
                    }}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-8 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                    max={existingContract.owners.length}
                  />
                  <div className="absolute inset-y-0 right-0 flex flex-col border-l border-gray-300">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = Math.min(newProposal.newRequiredApprovals + 1, existingContract.owners.length);
                        setNewProposal({ ...newProposal, newRequiredApprovals: newValue });
                      }}
                      className="flex-1 px-1.5 bg-gray-50 hover:bg-gray-100 border-b border-gray-300 rounded-tr-md text-xs leading-none flex items-center justify-center"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = Math.max(newProposal.newRequiredApprovals - 1, 1);
                        setNewProposal({ ...newProposal, newRequiredApprovals: newValue });
                      }}
                      className="flex-1 px-1.5 bg-gray-50 hover:bg-gray-100 rounded-br-md text-xs leading-none flex items-center justify-center"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            )}

            {newProposal.type === 'UpdateDeadlineDuration' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">New Deadline Duration (hours)</label>
                <input
                  type="number"
                  value={newProposal.newDeadlineDuration / 3600}
                  onChange={(e) => setNewProposal({ ...newProposal, newDeadlineDuration: parseInt(e.target.value) * 3600 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  min="1"
                  max="720"
                />
              </div>
            )}

            {newProposal.type === 'Pause' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Pause Duration (hours)</label>
                <input
                  type="number"
                  value={newProposal.pauseDuration / 3600}
                  onChange={(e) => setNewProposal({ ...newProposal, pauseDuration: parseInt(e.target.value) * 3600 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  min="1"
                  max="720"
                />
              </div>
            )}

            <button
              onClick={createProposal}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Proposal'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proposals List Section */}
      {existingContract.contract && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Recent Proposals</h3>
            <button
              onClick={() => setShowAllProposals(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All Proposals →
            </button>
          </div>
          <div className="space-y-4">
            {[...proposals].reverse().slice(0, 5).map((proposal) => (
              <div key={proposal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Proposal #{proposal.id}</h4>
                    <p className="text-sm text-gray-600">Type: {formatProposalType(proposal.type, {
                      targetContract: proposal.targetContract,
                      data: proposal.data,
                      newOwner: proposal.newOwner,
                      ownerToRemove: proposal.ownerToRemove,
                      newRequiredApprovals: proposal.newRequiredApprovals,
                      newDeadlineDuration: proposal.newDeadlineDuration,
                      pauseDuration: proposal.pauseDuration
                    })}</p>
                    <p className="text-sm flex items-center gap-2">
                      <span>Status:</span>
                      {proposal.executed ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          ✅ Executed
                        </span>
                      ) : proposal.cancelled ? (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          ❌ Cancelled
                        </span>
                      ) : (
                        <span className="text-blue-600 font-medium flex items-center gap-1">
                          ⏳ Active
                        </span>
                      )}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <span>Approvals:</span>
                      <span className={`font-medium ${proposal.approvalCount >= existingContract.requiredApprovals ? 'text-green-600' : 'text-orange-500'}`}>
                        {proposal.approvalCount}/{existingContract.requiredApprovals}
                      </span>
                    </p>
                  </div>
                  <div className="space-x-2">
                    {!proposal.executed && !proposal.cancelled && (
                      <>
                        {account && 
                         proposal.proposer.toLowerCase() !== account.toLowerCase() && 
                         !proposal.approvers.includes(account.toLowerCase()) && (
                          <button
                            onClick={() => approveProposal(proposal.id)}
                            disabled={loading}
                            className="bg-green-600 text-white py-1 px-3 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {proposal.approvalCount >= existingContract.requiredApprovals && (
                          <button
                            onClick={() => executeProposal(proposal.id)}
                            disabled={loading}
                            className="bg-blue-600 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            Execute
                          </button>
                        )}
                        <button
                          onClick={() => cancelProposal(proposal.id)}
                          disabled={loading}
                          className="bg-red-600 text-white py-1 px-3 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <p>Proposer: {proposal.proposer}</p>
                  {proposal.type === 0 ? (
                    <>
                      {proposal.targetContract && <p>Target: {proposal.targetContract}</p>}
                      <p>Function: {proposal.data && (() => {
                        const signature = proposal.data.slice(0, 10);
                        try {
                          switch (signature) {
                            case '0x40c10f19': { // mint
                              const params = ethers.AbiCoder.defaultAbiCoder().decode(
                                ['address', 'uint256'],
                                '0x' + proposal.data.slice(10)
                              );
                              return `${signature} - mint (${ethers.formatEther(params[1])} tokens to ${params[0]})`;
                            }
                            case '0x42966c68': { // burn
                              const params = ethers.AbiCoder.defaultAbiCoder().decode(
                                ['uint256'],
                                '0x' + proposal.data.slice(10)
                              );
                              return `${signature} - burn (${ethers.formatEther(params[0])} tokens)`;
                            }
                            case '0xa9c73e80': { // setText
                              const params = ethers.AbiCoder.defaultAbiCoder().decode(
                                ['string', 'string'],
                                '0x' + proposal.data.slice(10)
                              );
                              return `${signature} - setText (${params[0]} = "${params[1]}")`;
                            }
                            case '0x095ea7b3': { // approve
                              const params = ethers.AbiCoder.defaultAbiCoder().decode(
                                ['address', 'uint256'],
                                '0x' + proposal.data.slice(10)
                              );
                              return `${signature} - approve (${ethers.formatEther(params[1])} tokens for ${params[0]})`;
                            }
                            case '0xf2fde38b': { // transferOwnership
                              const params = ethers.AbiCoder.defaultAbiCoder().decode(
                                ['address'],
                                '0x' + proposal.data.slice(10)
                              );
                              return `${signature} - transferOwnership (new owner: ${params[0]})`;
                            }
                            case '0xa9059cbb': { // transfer
                              const params = ethers.AbiCoder.defaultAbiCoder().decode(
                                ['address', 'uint256'],
                                '0x' + proposal.data.slice(10)
                              );
                              return `${signature} - transfer (${ethers.formatEther(params[1])} tokens to ${params[0]})`;
                            }
                            case '0x23b872dd': { // transferFrom
                              const params = ethers.AbiCoder.defaultAbiCoder().decode(
                                ['address', 'address', 'uint256'],
                                '0x' + proposal.data.slice(10)
                              );
                              return `${signature} - transferFrom (${ethers.formatEther(params[2])} tokens from ${params[0]} to ${params[1]})`;
                            }
                            default:
                              return signature;
                          }
                        } catch (error) {
                          console.error('Error decoding parameters:', error);
                          return signature;
                        }
                      })()}</p>
                    </>
                  ) : (
                    <p>Target: {existingContract.address} (MultiGuard)</p>
                  )}
                  {proposal.value && proposal.value !== '0' && <p>Value: {ethers.formatEther(proposal.value)} ETH</p>}
                  <p>Deadline: {new Date(Number(proposal.deadline) * 1000).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {proposals.length === 0 && (
              <p className="text-gray-500 text-center">No proposals yet</p>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}
    </div>
  );
};

export default ManageMultiGuard; 