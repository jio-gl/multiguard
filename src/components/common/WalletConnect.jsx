import React from 'react';

const WalletConnect = ({ account, isConnected }) => {
  if (!isConnected) return null;
  
  return (
    <button className="bg-white text-indigo-600 px-3 py-1 rounded-md text-sm font-medium">
      {account.substring(0, 6)}...{account.substring(account.length - 4)}
    </button>
  );
};

export default WalletConnect; 