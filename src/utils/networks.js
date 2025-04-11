import { NETWORKS } from './contracts';

export const getNetworkInfo = (chainId) => {
  return NETWORKS[chainId] || {
    name: 'Unknown Network',
    rpc: null,
    explorer: null
  };
};

export const switchNetwork = async (provider, chainId) => {
  try {
    await provider.send('wallet_switchEthereumChain', [
      { chainId: `0x${chainId.toString(16)}` }
    ]);
    return true;
  } catch (error) {
    if (error.code === 4902) {
      try {
        await addNetwork(provider, chainId);
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        return false;
      }
    }
    console.error('Error switching network:', error);
    return false;
  }
};

export const addNetwork = async (provider, chainId) => {
  const network = NETWORKS[chainId];
  if (!network) return false;

  const params = {
    chainId: `0x${chainId.toString(16)}`,
    chainName: network.name,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [network.rpc],
    blockExplorerUrls: network.explorer ? [network.explorer] : null
  };

  try {
    await provider.send('wallet_addEthereumChain', [params]);
    return true;
  } catch (error) {
    console.error('Error adding network:', error);
    return false;
  }
};

export const getExplorerUrl = (chainId, type, hash) => {
  const network = NETWORKS[chainId];
  if (!network || !network.explorer) return '';
  
  return `${network.explorer}/${type}/${hash}`;
}; 