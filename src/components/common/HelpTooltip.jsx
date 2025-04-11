import React from 'react';

const HelpTooltip = ({ show, onToggle }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Toggle help"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      
      {show && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-2">Need Help?</p>
            <p className="mb-2">Click the help icon to see step-by-step instructions for:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Creating a new Shield</li>
              <li>Migrating contract ownership</li>
              <li>Managing your Shield</li>
              <li>Creating and voting on proposals</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip; 