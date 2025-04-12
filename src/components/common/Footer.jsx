import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
        <p>MultiGuard - Shared Ownership For Your Digital Assets</p>
        <p className="mt-2">Works with Ethereum, Polygon, BSC, and *all* other EVM-compatible networks</p>
        <p className="mt-2">
          <a 
            href="https://arbiscan.io/address/0x31Cf75f3254CabAbf800eC4C8Af8ba627E7A0F94#code"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span role="img" aria-label="verified">✅</span>
            Verified Contract on Arbitrum One
          </a>
        </p>
        <p className="mt-2">
          <a 
            href="https://chatgpt.com/share/67f99c89-def4-8001-8fa8-1776af97a5a5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span role="img" aria-label="security audit">🔒</span>
            Security Audit Report
          </a>
        </p>
        <p className="mt-2">
          <a 
            href="https://github.com/jio-gl/multiguard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span role="img" aria-label="github">📦</span>
            GitHub Repository
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer; 