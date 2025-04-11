import { ethers } from 'ethers';
import { MULTIGUARD_CONFIG } from '../config/contracts';

export const deployMultiGuard = async (signer, owners, requiredApprovals, proposalDeadlineDuration) => {
  try {
    const factory = new ethers.ContractFactory(
      MULTIGUARD_CONFIG.abi,
      MULTIGUARD_CONFIG.bytecode,
      signer
    );

    const contract = await factory.deploy(owners, requiredApprovals, proposalDeadlineDuration);
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    return {
      success: true,
      contract,
      address,
      error: null
    };
  } catch (error) {
    console.error('Error deploying MultiGuard:', {
      error,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return {
      success: false,
      contract: null,
      address: null,
      error: error.message
    };
  }
};

export const getMultiGuardContract = (address, signerOrProvider) => {
  try {
    return new ethers.Contract(address, MULTIGUARD_CONFIG.abi, signerOrProvider);
  } catch (error) {
    console.error('Error getting MultiGuard contract:', error);
    throw new Error('Failed to create MultiGuard contract instance: ' + error.message);
  }
};

export const isValidNetwork = (chainId) => {
  return chainId in MULTIGUARD_CONFIG.networks;
};

export const getNetworkName = (chainId) => {
  return MULTIGUARD_CONFIG.networks[chainId]?.name || 'Unknown Network';
};

export const validateDeploymentParams = (owners, requiredApprovals, proposalDeadlineDuration) => {
  const errors = [];

  // Validate owners
  if (!Array.isArray(owners) || owners.length === 0) {
    errors.push('At least one owner address is required');
  } else if (owners.length > 50) {
    errors.push('Maximum number of owners is 50');
  }

  // Validate required approvals
  if (!requiredApprovals || requiredApprovals <= 0) {
    errors.push('Required approvals must be greater than 0');
  } else if (requiredApprovals > owners.length) {
    errors.push('Required approvals cannot be greater than the number of owners');
  }

  // Validate proposal deadline duration (in seconds)
  const MIN_DURATION = 3600; // 1 hour
  const MAX_DURATION = 2592000; // 30 days
  if (!proposalDeadlineDuration || proposalDeadlineDuration < MIN_DURATION) {
    errors.push('Proposal deadline duration must be at least 1 hour');
  } else if (proposalDeadlineDuration > MAX_DURATION) {
    errors.push('Proposal deadline duration cannot exceed 30 days');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 