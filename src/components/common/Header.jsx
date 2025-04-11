import React from 'react';
import NetworkSelector from './NetworkSelector';
import WalletConnect from './WalletConnect';

const Header = ({ isConnected, account, network, onConnect }) => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold flex items-center">
          <span className="mr-2">🛡️🛡️🛡️</span> MultiGuard
        </h1>
        {isConnected ? (
          <div className="flex items-center">
            <NetworkSelector network={network} />
            <WalletConnect account={account} isConnected={true} />
          </div>
        ) : (
          <button 
            onClick={onConnect}
            className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header; 