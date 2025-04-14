# 🛡️🛡️🛡️ MultiGuard

MultiGuard is a decentralized multisig governance protocol that enables secure and decentralized control of digital assets through smart contracts on the Ethereum blockchain. The protocol implements a robust governance framework where multiple authorized signers must approve transactions and administrative actions. MultiGuard is fully compatible with all EVM-compatible chains, allowing for seamless deployment across multiple networks from the web interface.

## Features

- Decentralized governance through multisig controls
- Create and manage shared ownership groups
- Secure digital asset management
- Multi-signature transaction approval
- Real-time notifications
- Mobile-responsive design
- Support for multiple networks (Ethereum, Arbitrum, Polygon, BSC, Avalanche)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask or another Web3 wallet
- Git

### Environment Setup

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Required environment variables:

- `ARBISCAN_API_KEY`: Required for deploying and verifying contracts on Arbitrum One
- `PRIVATE_KEY`: Your wallet's private key for contract deployment
- `REACT_APP_DEFAULT_NETWORK`: Default network ID (1 for Ethereum mainnet)
- `REACT_APP_INFURA_ID`: Infura project ID for frontend

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/multiguard-dapp.git
cd multiguard-dapp
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### GitHub Pages Deployment

To deploy the dapp to GitHub Pages, simply run:

```bash
npm run deploy
```

This will:
- Build the production version of your dapp
- Deploy it to the `gh-pages` branch
- Make it available at `https://jio-gl.github.io/multiguard`

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App
- `npm run compile` - Compiles the smart contracts and updates the bytecode artifact
- `npm run node` - Starts a local Hardhat node
- `npm run deploy:local` - Deploys example token to local network
- `npm run deploy:arbitrum` - Deploys the MultiGuard contract to Arbitrum One
- `npm run deploy` - Deploys the dapp to GitHub Pages
- `npm run update-artifact` - Updates the contract artifact in the frontend
- `npm run flatten` - Generates a flattened version of the MultiGuard contract
- `npm run verify` - Verifies a deployed contract on Arbitrum One
- `npm run deploy:verify:arbitrum` - Compiles, deploys and verifies the contract on Arbitrum One

### Contract Deployment

To deploy the MultiGuard contract to Arbitrum One:

1. Make sure you have an Arbiscan API key in your `.env` file:
   ```
   ARBISCAN_API_KEY=your_arbiscan_api_key_here
   ```

2. Make sure you have a private key with funds in your `.env` file:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   ```

3. Run the deployment script:
   ```bash
   npm run deploy:arbitrum
   ```

   This will:
   - Deploy the MultiGuard contract to Arbitrum One
   - Wait for the deployment to be mined
   - Verify the contract on Arbiscan

### Contract Verification

To verify a deployed contract on Arbitrum One:

1. Make sure you have an Arbiscan API key in your `.env` file:
   ```
   ARBISCAN_API_KEY=your_arbiscan_api_key_here
   ```

2. Run the verify command with the contract name, address, and constructor arguments file:
   ```bash
   npm run verify --contract=MultiGuard --address=0x1234567890123456789012345678901234567890 --args=scripts/arguments.js
   ```

   For example, to verify the MultiGuard contract:
   ```bash
   npm run verify --contract=MultiGuard --address=0x1234567890123456789012345678901234567890 --args=scripts/arguments.js
   ```

3. Alternatively, you can use the standard Hardhat verify command:
   ```bash
   npx hardhat verify --network arbitrumOne 0x1234567890123456789012345678901234567890 --constructor-args scripts/arguments.js
   ```

4. For complex constructor arguments, you can use a JSON file as shown in the example `scripts/arguments.js`.

### Project Structure

```
multiguard-dapp/
├── contracts/       # Smart contract source files
├── public/          # Static files
├── src/            # Frontend source files
│   ├── components/ # React components
│   ├── config/     # Configuration files
│   ├── contracts/  # Contract ABIs and addresses
│   ├── styles/     # CSS and style files
│   ├── utils/      # Utility functions
│   ├── App.jsx     # Main App component
│   ├── index.js    # Application entry point
│   └── index.css   # Global styles
├── scripts/        # Deployment and verification scripts
├── test/          # Contract and frontend tests
├── docs/          # Documentation files
├── flattened/     # Flattened contract files for verification
├── hardhat.config.js  # Hardhat configuration
├── postcss.config.js  # PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration
├── package.json    # Dependencies and scripts
└── README.md      # Project documentation
```

### Smart Contracts

The project uses Hardhat as the main development framework. Smart contracts are located in the `contracts/` directory and can be:

1. Compiled:
```bash
npx hardhat compile
```

2. Tested:
```bash
npx hardhat test
```

3. Deployed to local network:
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Testing

Run the test suite:

```bash
# Smart contract tests
npm run test:contracts

# Frontend tests
npm run test:react
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/jio-gl/multiguard](https://github.com/jio-gl/multiguard)
