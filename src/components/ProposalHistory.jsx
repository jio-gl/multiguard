import React, { useState, useEffect } from 'react';
import { formatProposalType } from '../utils/helpers';
import { ethers } from 'ethers';

const ProposalHistory = ({ 
  contract, 
  account, 
  requiredApprovals, 
  onBack,
  approveProposal,
  executeProposal,
  cancelProposal,
  loading
}) => {
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [error, setError] = useState('');

  const loadProposals = async () => {
    if (!contract) return;
    
    try {
      setLoadingProposals(true);
      const proposalCount = await contract.proposalCount();
      const loadedProposals = [];
      
      for (let i = 1; i <= Number(proposalCount); i++) {
        const details = await contract.getProposalDetails(i);
        const approvers = await contract.getApprovers(i);
        
        // Parse the data field for specific proposal types
        let newRequiredApprovals = null;
        let newOwner = null;
        let ownerToRemove = null;
        let newDeadlineDuration = null;
        let pauseDuration = null;

        const proposalType = Number(details.proposalType);
        console.log('Proposal type:', proposalType);

        // Get values directly from details instead of decoding
        newOwner = details.newOwner;
        ownerToRemove = details.ownerToRemove;
        newRequiredApprovals = details.newRequiredApprovals ? Number(details.newRequiredApprovals) : null;
        newDeadlineDuration = details.newDeadlineDuration ? Number(details.newDeadlineDuration) : null;
        
        loadedProposals.push({
          id: i,
          type: proposalType,
          proposer: details.proposer,
          targetContract: details.targetContract,
          data: details.data,
          value: details.value.toString(),
          proposalTime: Number(details.proposalTime),
          deadline: Number(details.deadline),
          executed: details.executed,
          cancelled: details.cancelled,
          approvalCount: Number(details.approvalCount),
          approvers,
          newRequiredApprovals,
          newOwner,
          ownerToRemove,
          newDeadlineDuration,
          pauseDuration
        });
      }
      
      setProposals(loadedProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      setError('Failed to load proposals: ' + error.message);
    } finally {
      setLoadingProposals(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [contract]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-indigo-600 hover:text-indigo-700"
        >
          ← Back to Shield
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Proposal History</h2>
      </div>

      {loadingProposals ? (
        <div className="text-center py-4">Loading proposals...</div>
      ) : error ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : (
        <div className="space-y-4">
          {[...proposals].reverse().map((proposal) => (
            <div key={proposal.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Proposal #{proposal.id}</h4>
                  <p className="text-sm text-gray-600">Type: {formatProposalType(proposal.type, {
                    targetContract: proposal.targetContract,
                    data: proposal.data,
                    newOwner: proposal.newOwner,
                    ownerToRemove: proposal.ownerToRemove,
                    newRequiredApprovals: proposal.newRequiredApprovals,
                    newDeadlineDuration: proposal.newDeadlineDuration,
                    pauseDuration: proposal.pauseDuration
                  })}</p>
                  <p className="text-sm flex items-center gap-2">
                    <span>Status:</span>
                    {proposal.executed ? (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        ✅ Executed
                      </span>
                    ) : proposal.cancelled ? (
                      <span className="text-red-600 font-medium flex items-center gap-1">
                        ❌ Cancelled
                      </span>
                    ) : (
                      <span className="text-blue-600 font-medium flex items-center gap-1">
                        ⏳ Active
                      </span>
                    )}
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <span>Approvals:</span>
                    <span className={`font-medium ${proposal.approvalCount >= requiredApprovals ? 'text-green-600' : 'text-orange-500'}`}>
                      {proposal.approvalCount}/{requiredApprovals}
                    </span>
                  </p>
                </div>
                <div className="space-x-2">
                  {!proposal.executed && !proposal.cancelled && (
                    <>
                      {account && 
                       proposal.proposer.toLowerCase() !== account.toLowerCase() && 
                       !proposal.approvers.includes(account.toLowerCase()) && (
                        <button
                          onClick={() => approveProposal(proposal.id)}
                          disabled={loading}
                          className="bg-green-600 text-white py-1 px-3 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {proposal.approvalCount >= requiredApprovals && (
                        <button
                          onClick={() => executeProposal(proposal.id)}
                          disabled={loading}
                          className="bg-blue-600 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          Execute
                        </button>
                      )}
                      <button
                        onClick={() => cancelProposal(proposal.id)}
                        disabled={loading}
                        className="bg-red-600 text-white py-1 px-3 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-2 text-sm">
                <p>Proposer: {proposal.proposer}</p>
                {proposal.type === 0 ? (
                  <>
                    {proposal.targetContract && <p>Target: {proposal.targetContract}</p>}
                    <p>Function: {proposal.data && (() => {
                      const signature = proposal.data.slice(0, 10);
                      try {
                        switch (signature) {
                          case '0x40c10f19': { // mint
                            const params = ethers.AbiCoder.defaultAbiCoder().decode(
                              ['address', 'uint256'],
                              '0x' + proposal.data.slice(10)
                            );
                            return `${signature} - mint (${ethers.formatEther(params[1])} tokens to ${params[0]})`;
                          }
                          case '0x42966c68': { // burn
                            const params = ethers.AbiCoder.defaultAbiCoder().decode(
                              ['uint256'],
                              '0x' + proposal.data.slice(10)
                            );
                            return `${signature} - burn (${ethers.formatEther(params[0])} tokens)`;
                          }
                          case '0xa9c73e80': { // setText
                            const params = ethers.AbiCoder.defaultAbiCoder().decode(
                              ['string', 'string'],
                              '0x' + proposal.data.slice(10)
                            );
                            return `${signature} - ENS setText (${params[0]} = "${params[1]}")`;
                          }
                          case '0x095ea7b3': { // approve
                            const params = ethers.AbiCoder.defaultAbiCoder().decode(
                              ['address', 'uint256'],
                              '0x' + proposal.data.slice(10)
                            );
                            return `${signature} - approve (${ethers.formatEther(params[1])} tokens for ${params[0]})`;
                          }
                          case '0xa9059cbb': { // transfer
                            const params = ethers.AbiCoder.defaultAbiCoder().decode(
                              ['address', 'uint256'],
                              '0x' + proposal.data.slice(10)
                            );
                            return `${signature} - transfer (${ethers.formatEther(params[1])} tokens to ${params[0]})`;
                          }
                          case '0x23b872dd': { // transferFrom
                            const params = ethers.AbiCoder.defaultAbiCoder().decode(
                              ['address', 'address', 'uint256'],
                              '0x' + proposal.data.slice(10)
                            );
                            return `${signature} - transferFrom (${ethers.formatEther(params[2])} tokens from ${params[0]} to ${params[1]})`;
                          }
                          case '0x42842e0e': // safeTransferFrom (no data)
                          case '0xb88d4fde': { // safeTransferFrom (with data)
                            const isWithData = signature === '0xb88d4fde';
                            const params = ethers.AbiCoder.defaultAbiCoder().decode(
                              isWithData ? ['address', 'address', 'uint256', 'bytes'] : ['address', 'address', 'uint256'],
                              '0x' + proposal.data.slice(10)
                            );
                            return `${signature} - safeTransferFrom (NFT #${params[2]} from ${params[0]} to ${params[1]})`;
                          }
                          default:
                            return signature;
                        }
                      } catch (error) {
                        console.error('Error decoding parameters:', error);
                        return signature;
                      }
                    })()}</p>
                  </>
                ) : (
                  <p>Target: {contract.target} (MultiGuard)</p>
                )}
                {proposal.value && proposal.value !== '0' && <p>Value: {ethers.formatEther(proposal.value)} ETH</p>}
                <p>Deadline: {new Date(Number(proposal.deadline) * 1000).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {proposals.length === 0 && (
            <p className="text-gray-500 text-center">No proposals found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProposalHistory; 