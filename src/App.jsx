import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import DeployMultiGuard from './components/DeployMultiGuard';
import MigrateOwnership from './components/MigrateOwnership';
import ManageMultiGuard from './components/ManageMultiGuard';
import { getNetworkInfo } from './utils/networks';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [multiGuardAddress, setMultiGuardAddress] = useState('');
  const [targetContractAddress, setTargetContractAddress] = useState('');

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        setProvider(provider);
        setSigner(signer);
        setAccount(address);
        setNetwork(getNetworkInfo(Number(network.chainId)));
        setIsConnected(true);
        
        window.ethereum.on('accountsChanged', (accounts) => {
          setAccount(accounts[0]);
        });
        
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      } else {
        alert('Please install MetaMask to use MultiGuard');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      connectWallet();
    }
  }, []);

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 font-display">Protect Your Digital Assets</h2>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4 font-display">MultiSig Governance Made Simple</h3>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            MultiGuard lets you share control of your NFTs, tokens, and smart contracts with trusted friends or team members.
          </p>
          <button 
            onClick={connectWallet}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md text-base font-medium hover:bg-indigo-700"
          >
            Connect Wallet to Start
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'deploy':
        return (
          <DeployMultiGuard 
            signer={signer} 
            setMultiGuardAddress={setMultiGuardAddress}
          />
        );
      case 'migrate':
        return (
          <MigrateOwnership 
            signer={signer} 
            multiGuardAddress={multiGuardAddress} 
            setTargetContractAddress={setTargetContractAddress}
          />
        );
      case 'manage':
        return (
          <ManageMultiGuard 
            provider={provider}
            signer={signer} 
            account={account}
            existingAddress={multiGuardAddress}
          />
        );
      default:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to MultiGuard!</h2>
              <div className="grid gap-6">
                <div className="p-4 border border-indigo-100 rounded-lg bg-indigo-50">
                  <h3 className="font-medium text-indigo-800 mb-2">🆕 Create New Shield</h3>
                  <p className="mb-3 text-sm text-gray-600">
                    Set up a new MultiGuard contract for shared control of assets.
                  </p>
                  <button 
                    onClick={() => setActiveTab('deploy')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Get Started
                  </button>
                </div>

                <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                  <h3 className="font-medium text-green-800 mb-2">🔒 Protect Assets</h3>
                  <p className="mb-3 text-sm text-gray-600">
                    Let your existing assets with a single owner be controlled by a MultiGuard Shield with co-owners.
                  </p>
                  <button 
                    onClick={() => setActiveTab('migrate')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Protect Assets
                  </button>
                </div>

                <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                  <h3 className="font-medium text-purple-800 mb-2">⚙️ Manage Shield</h3>
                  <p className="mb-3 text-sm text-gray-600">
                    Manage with co-owners an existing MultiGuard Shield.
                  </p>
                  <button 
                    onClick={() => setActiveTab('manage')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
                  >
                    Open Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        isConnected={isConnected}
        account={account}
        network={network}
        onConnect={connectWallet}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {isConnected && (
          <div className="mb-6">
            <nav className="flex space-x-4">
              <TabButton 
                label="Home" 
                tab="home" 
                activeTab={activeTab} 
                onClick={() => setActiveTab('home')} 
              />
              <TabButton 
                label="Create Shield" 
                tab="deploy" 
                activeTab={activeTab} 
                onClick={() => setActiveTab('deploy')} 
              />
              <TabButton 
                label="Protect Assets" 
                tab="migrate" 
                activeTab={activeTab} 
                onClick={() => setActiveTab('migrate')} 
              />
              <TabButton 
                label="Manage Shield" 
                tab="manage" 
                activeTab={activeTab} 
                onClick={() => setActiveTab('manage')} 
              />
            </nav>
          </div>
        )}
        
        {renderContent()}
      </main>
      
      <Footer />
    </div>
  );
};

const TabButton = ({ label, tab, activeTab, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium ${
      activeTab === tab
        ? 'bg-indigo-600 text-white'
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

export default App; 