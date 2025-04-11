import React from 'react';

const NetworkSelector = ({ network }) => {
  const getNetworkDisplay = () => {
    if (!network?.name) return 'Unknown Network';
    return network.name;
  };

  return (
    <span className="text-white mr-2 hidden md:inline bg-gray-700 px-3 py-1 rounded-full text-sm">
      {getNetworkDisplay()}
    </span>
  );
};

export default NetworkSelector; 