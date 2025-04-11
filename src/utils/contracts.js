import { ethers } from 'ethers';
import { MultiGuardArtifact } from '../contracts/MultiGuardArtifact';

export const NETWORKS = {
  // Ethereum and L2s/L3s
  1: {
    name: 'Ethereum Mainnet',
    rpc: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    explorer: 'https://etherscan.io'
  },
  5: {
    name: 'Goerli Testnet',
    rpc: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    explorer: 'https://goerli.etherscan.io'
  },
  10: {
    name: 'Optimism Mainnet',
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io'
  },
  42161: {
    name: 'Arbitrum One',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io'
  },
  8453: {
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org'
  },
  324: {
    name: 'zkSync Era',
    rpc: 'https://mainnet.era.zksync.io',
    explorer: 'https://explorer.zksync.io'
  },
  59144: {
    name: 'Linea Mainnet',
    rpc: 'https://rpc.linea.build',
    explorer: 'https://lineascan.build'
  },
  534352: {
    name: 'Scroll',
    rpc: 'https://rpc.scroll.io',
    explorer: 'https://scrollscan.com'
  },
  7777777: {
    name: 'Zora',
    rpc: 'https://rpc.zora.energy',
    explorer: 'https://explorer.zora.energy'
  },
  81457: {
    name: 'Blast',
    rpc: 'https://blast.blockpi.network/v1/rpc/public',
    explorer: 'https://blastscan.io'
  },
  424: {
    name: 'Public Goods Network',
    rpc: 'https://mainnet.publicgoods.network',
    explorer: 'https://explorer.publicgoods.network'
  },
  1101: {
    name: 'Polygon zkEVM',
    rpc: 'https://zkevm-rpc.com',
    explorer: 'https://explorer.polygon.technology'
  },
  204: {
    name: 'opBNB',
    rpc: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorer: 'https://opbnbscan.com'
  },
  957: {
    name: 'Lyra Chain',
    rpc: 'https://rpc.lyra.finance',
    explorer: 'https://explorer.lyra.finance'
  },
  1116: {
    name: 'Core DAO',
    rpc: 'https://rpc.coredao.org',
    explorer: 'https://scan.coredao.org'
  },
  88888888: {
    name: 'Mode',
    rpc: 'https://mainnet.mode.network',
    explorer: 'https://explorer.mode.network'
  },
  2863311531: {
    name: 'Ancient8',
    rpc: 'https://rpc.ancient8.xyz',
    explorer: 'https://scan.ancient8.xyz'
  },
  1261120: {
    name: 'Fraxtal',
    rpc: 'https://rpc.fraxtal.com',
    explorer: 'https://explorer.fraxtal.com'
  },
  1380996178: {
    name: 'RedStone Holesky',
    rpc: 'https://holesky.redstone.xyz',
    explorer: 'https://explorer.redstone.xyz'
  },

  // Polygon
  137: {
    name: 'Polygon Mainnet',
    rpc: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    explorer: 'https://polygonscan.com'
  },
  80001: {
    name: 'Mumbai Testnet',
    rpc: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
    explorer: 'https://mumbai.polygonscan.com'
  },

  // BNB Chain
  56: {
    name: 'BNB Smart Chain',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com'
  },
  97: {
    name: 'BNB Smart Chain Testnet',
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://testnet.bscscan.com'
  },

  // Avalanche
  43114: {
    name: 'Avalanche C-Chain',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io'
  },
  43113: {
    name: 'Avalanche Fuji Testnet',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://testnet.snowtrace.io'
  },

  // Other EVM Chains
  250: {
    name: 'Fantom Opera',
    rpc: 'https://rpc.ftm.tools',
    explorer: 'https://ftmscan.com'
  },
  42220: {
    name: 'Celo Mainnet',
    rpc: 'https://forno.celo.org',
    explorer: 'https://explorer.celo.org'
  },
  1284: {
    name: 'Moonbeam',
    rpc: 'https://rpc.api.moonbeam.network',
    explorer: 'https://moonscan.io'
  },
  100: {
    name: 'Gnosis Chain',
    rpc: 'https://rpc.gnosischain.com',
    explorer: 'https://gnosisscan.io'
  },
  25: {
    name: 'Cronos Mainnet',
    rpc: 'https://evm.cronos.org',
    explorer: 'https://cronoscan.com'
  },
  1666600000: {
    name: 'Harmony One',
    rpc: 'https://api.harmony.one',
    explorer: 'https://explorer.harmony.one'
  },
  2222: {
    name: 'Kava EVM',
    rpc: 'https://evm.kava.io',
    explorer: 'https://explorer.kava.io'
  },
  1088: {
    name: 'Metis Andromeda',
    rpc: 'https://andromeda.metis.io/?owner=1088',
    explorer: 'https://andromeda-explorer.metis.io'
  },
  288: {
    name: 'Boba Network',
    rpc: 'https://mainnet.boba.network',
    explorer: 'https://blockexplorer.boba.network'
  },
  23294: {
    name: 'Oasis Sapphire',
    rpc: 'https://sapphire.oasis.io',
    explorer: 'https://explorer.emerald.oasis.dev'
  },
  8217: {
    name: 'Klaytn',
    rpc: 'https://public-node-api.klaytnapi.com/v1/cypress',
    explorer: 'https://scope.klaytn.com'
  },
  42766: {
    name: 'ZKFair',
    rpc: 'https://mainnet.zkfair.io',
    explorer: 'https://explorer.zkfair.io'
  },
  1718: {
    name: 'Palette Chain',
    rpc: 'https://palette-rpc.com',
    explorer: 'https://palette.explorer.com'
  },
  12020: {
    name: 'Astar zkEVM',
    rpc: 'https://rpc.astar-zkevm.com',
    explorer: 'https://explorer.astar-zkevm.com'
  },
  1001: {
    name: 'Mantle',
    rpc: 'https://rpc.mantle.xyz',
    explorer: 'https://explorer.mantle.xyz'
  },
  1777: {
    name: 'Gauss',
    rpc: 'https://rpc.gauss.xyz',
    explorer: 'https://explorer.gauss.xyz'
  }
};

export const MULTIGUARD_CONFIG = {
  abi: MultiGuardArtifact.abi,
  bytecode: MultiGuardArtifact.bytecode,
  networks: NETWORKS
};

export const getContract = (address, abi, signer) => {
  return new ethers.Contract(address, abi, signer);
};

export const getMultiGuardContract = (address, signer) => {
  return getContract(address, MULTIGUARD_CONFIG.abi, signer);
}; 