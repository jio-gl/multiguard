import { formatEther, parseEther, isAddress } from 'ethers';

const KNOWN_FUNCTION_SIGNATURES = {
  '0x095ea7b3': 'approve',
  '0xa9059cbb': 'transfer',
  '0x23b872dd': 'transferFrom',
  '0x42842e0e': 'safeTransferFrom',
  '0xb88d4fde': 'safeTransferFrom',
  '0x40c10f19': 'mint',
  '0x983b2d56': 'addMinter',
  '0x6ef8d66d': 'renounceMinter',
  '0x70a08231': 'balanceOf',
  '0xdd62ed3e': 'allowance',
  '0x18160ddd': 'totalSupply',
  '0x01ffc9a7': 'supportsInterface',
};

export const getKnownFunctionName = (signature) => {
  return KNOWN_FUNCTION_SIGNATURES[signature] || null;
};

export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatEtherValue = (value) => {
  try {
    return formatEther(value);
  } catch (error) {
    console.error('Error formatting ether:', error);
    return '0';
  }
};

export const parseEtherValue = (value) => {
  try {
    return parseEther(value.toString());
  } catch (error) {
    console.error('Error parsing ether:', error);
    return '0';
  }
};

export const isValidAddress = (address) => {
  try {
    return isAddress(address);
  } catch (error) {
    return false;
  }
};

export const formatProposalType = (type, details = {}) => {
  switch (Number(type)) {
    case 0: {
      if (!details.data) return 'Transaction';
      const signature = details.data.slice(0, 10);
      const functionName = getKnownFunctionName(signature);
      return functionName 
        ? `Transaction (${signature} - ${functionName})`
        : `Transaction (${signature})`;
    }
    case 2:
      return details.newOwner ? `Add Owner (${details.newOwner})` : 'Add Owner';
    case 3:
      return details.ownerToRemove ? `Remove Owner (${details.ownerToRemove})` : 'Remove Owner';
    case 1:
      return details.newRequiredApprovals !== null ? `Change Required Approvals (${details.newRequiredApprovals})` : 'Change Required Approvals';
    case 4:
      return details.newDeadlineDuration ? `Change Deadline Duration (${details.newDeadlineDuration / 3600}h)` : 'Change Deadline Duration';
    case 5:
      return details.pauseDuration ? `Pause (${details.pauseDuration / 3600}h)` : 'Pause';
    case 6:
      return 'Unpause';
    default:
      return 'Unknown';
  }
};

// ... existing code ...