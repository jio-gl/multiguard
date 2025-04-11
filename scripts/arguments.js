/**
 * Constructor arguments for the MultiGuard contract
 * 
 * Format:
 * [
 *   owners,              // Array of owner addresses
 *   requiredApprovals,   // Number of approvals required
 *   proposalDeadlineDuration // Duration for proposal deadlines in seconds
 * ]
 */

module.exports = [
  // Two owners: the deployer and another address, requiring 1 approval, with a 1-day deadline
  [
    "0x8f97C42e2FD58CE19945CC00bD0f6427273C3CFc",  // Deployer address
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"   // Another owner address
  ],
  1,  // Required approvals (set to 1 for testing)
  86400  // 1 day in seconds
]; 