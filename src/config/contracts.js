import { MultiGuardArtifact } from '../contracts/MultiGuardArtifact';

// MultiGuard Contract Configuration
export const MULTIGUARD_CONFIG = {
  abi: MultiGuardArtifact.abi,
  bytecode: MultiGuardArtifact.bytecode,
  networks: {
    // Ethereum and L2s/L3s
    1: { // Mainnet
      name: "Ethereum Mainnet"
    },
    5: { // Goerli
      name: "Goerli Testnet"
    },
    11155111: { // Sepolia
      name: "Sepolia Testnet"
    },
    10: { // Optimism
      name: "Optimism Mainnet"
    },
    420: { // Optimism Goerli
      name: "Optimism Goerli Testnet"
    },
    42161: { // Arbitrum
      name: "Arbitrum One"
    },
    421613: { // Arbitrum Goerli
      name: "Arbitrum Goerli Testnet"
    },
    42170: { // Arbitrum Nova
      name: "Arbitrum Nova"
    },
    8453: { // Base
      name: "Base"
    },
    84531: { // Base Goerli
      name: "Base Goerli Testnet"
    },
    84532: { // Base Sepolia
      name: "Base Sepolia Testnet"
    },
    324: { // zkSync
      name: "zkSync Era"
    },
    280: { // zkSync Testnet
      name: "zkSync Era Testnet"
    },
    59144: { // Linea
      name: "Linea Mainnet"
    },
    59140: { // Linea Testnet
      name: "Linea Goerli Testnet"
    },
    534352: { // Scroll
      name: "Scroll"
    },
    534351: { // Scroll Sepolia
      name: "Scroll Sepolia Testnet"
    },
    7777777: { // Zora
      name: "Zora"
    },
    999: { // Zora Testnet
      name: "Zora Goerli Testnet"
    },
    81457: { // Blast
      name: "Blast"
    },
    168587773: { // Blast Sepolia
      name: "Blast Sepolia Testnet"
    },
    424: { // PGN
      name: "Public Goods Network"
    },
    58008: { // PGN Testnet
      name: "Public Goods Network Testnet"
    },
    1101: { // Polygon zkEVM
      name: "Polygon zkEVM"
    },
    1442: { // Polygon zkEVM Testnet
      name: "Polygon zkEVM Testnet"
    },
    204: { // opBNB
      name: "opBNB"
    },
    5611: { // opBNB Testnet
      name: "opBNB Testnet"
    },
    957: { // Lyra
      name: "Lyra Chain"
    },
    957001: { // Lyra Testnet
      name: "Lyra Testnet"
    },
    1116: { // Core DAO
      name: "Core DAO"
    },
    1115: { // Core DAO Testnet
      name: "Core DAO Testnet"
    },
    88888888: { // Mode
      name: "Mode"
    },
    919: { // Mode Testnet
      name: "Mode Testnet"
    },
    2863311531: { // Ancient8
      name: "Ancient8"
    },
    28122024: { // Ancient8 Testnet
      name: "Ancient8 Testnet"
    },
    1261120: { // Fraxtal
      name: "Fraxtal"
    },
    2522: { // Fraxtal Testnet
      name: "Fraxtal Testnet"
    },
    1380996178: { // RedStone
      name: "RedStone Holesky"
    },

    // Polygon
    137: { // Polygon Mainnet
      name: "Polygon Mainnet"
    },
    80001: { // Mumbai Testnet
      name: "Mumbai Testnet"
    },

    // BNB Chain
    56: { // BSC Mainnet
      name: "BNB Smart Chain"
    },
    97: { // BSC Testnet
      name: "BNB Smart Chain Testnet"
    },

    // Avalanche
    43114: { // Avalanche Mainnet
      name: "Avalanche C-Chain"
    },
    43113: { // Fuji Testnet
      name: "Avalanche Fuji Testnet"
    },

    // Other EVM Chains
    250: { // Fantom
      name: "Fantom Opera"
    },
    4002: { // Fantom Testnet
      name: "Fantom Testnet"
    },
    42220: { // Celo
      name: "Celo Mainnet"
    },
    44787: { // Celo Alfajores
      name: "Celo Alfajores Testnet"
    },
    1284: { // Moonbeam
      name: "Moonbeam"
    },
    1287: { // Moonbase Alpha
      name: "Moonbase Alpha Testnet"
    },
    1285: { // Moonriver
      name: "Moonriver"
    },
    100: { // Gnosis Chain
      name: "Gnosis Chain"
    },
    77: { // Gnosis Testnet
      name: "Gnosis Chiado Testnet"
    },
    25: { // Cronos
      name: "Cronos Mainnet"
    },
    338: { // Cronos Testnet
      name: "Cronos Testnet"
    },
    1666600000: { // Harmony
      name: "Harmony One"
    },
    1666700000: { // Harmony Testnet
      name: "Harmony Testnet"
    },
    2222: { // Kava
      name: "Kava EVM"
    },
    2221: { // Kava Testnet
      name: "Kava EVM Testnet"
    },
    1088: { // Metis
      name: "Metis Andromeda"
    },
    599: { // Metis Testnet
      name: "Metis Goerli Testnet"
    },
    288: { // Boba
      name: "Boba Network"
    },
    28: { // Boba Testnet
      name: "Boba Testnet"
    },
    23294: { // Oasis Sapphire
      name: "Oasis Sapphire"
    },
    23295: { // Oasis Sapphire Testnet
      name: "Oasis Sapphire Testnet"
    },
    8217: { // Klaytn
      name: "Klaytn"
    },
    1001: { // Klaytn Testnet
      name: "Klaytn Baobab Testnet"
    },
    42766: { // ZKFair
      name: "ZKFair"
    },
    42767: { // ZKFair Testnet
      name: "ZKFair Testnet"
    },
    1718: { // Palette Chain
      name: "Palette Chain"
    },
    12020: { // Astar zkEVM
      name: "Astar zkEVM"
    },
    6038361: { // Astar zkEVM Testnet
      name: "Astar zkEVM Testnet"
    },
    1001: { // Mantle
      name: "Mantle"
    },
    5001: { // Mantle Testnet
      name: "Mantle Testnet"
    },
    1777: { // Gauss
      name: "Gauss"
    },
    1777777: { // Gauss Testnet
      name: "Gauss Testnet"
    }
  }
}; 