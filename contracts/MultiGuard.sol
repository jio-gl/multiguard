// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title MultiGuard
 * @dev A multi-signature governance contract that enables secure, decentralized decision-making
 * through a proposal and approval system. It supports various types of proposals including
 * transaction execution, owner management, and system configuration changes.
 *
 * Key features:
 * - Multi-signature transaction execution
 * - Configurable approval requirements
 * - Time-bound proposals
 * - Owner management (add/remove)
 * - Emergency pause functionality
 * - Reentrancy protection
 */
contract MultiGuard is ReentrancyGuard {
    using Address for address;

    // ============ Constants ============

    /// @notice Maximum number of owners allowed in the system
    uint256 public constant MAX_OWNERS = 50;
    
    /// @notice Minimum duration for proposal deadlines (1 hour)
    uint256 public constant MIN_DEADLINE_DURATION = 1 hours;
    
    /// @notice Maximum duration for proposal deadlines (30 days)
    uint256 public constant MAX_DEADLINE_DURATION = 30 days;

    // ============ Enums ============

    /// @notice Types of proposals that can be created in the system
    enum ProposalType {
        Transaction,           // Execute a transaction on another contract
        ChangeRequiredApprovals, // Modify the number of required approvals
        AddOwner,             // Add a new owner to the system
        RemoveOwner,          // Remove an existing owner
        UpdateDeadlineDuration, // Change the proposal deadline duration
        Pause,                // Pause the contract
        Unpause               // Unpause the contract
    }

    // ============ State Variables ============

    /// @notice Array of all owner addresses
    address[] public owners;
    
    /// @notice Mapping of addresses to their owner status
    mapping(address => bool) private ownerMap;
    
    /// @notice Mapping of addresses to their index in the owners array
    mapping(address => uint256) private ownerIndex;

    /// @notice Number of approvals required for a proposal to be executable
    uint256 public requiredApprovals;
    
    /// @notice Duration for which proposals remain valid
    uint256 public proposalDeadlineDuration;
    
    /// @notice Indicates if the contract is currently paused
    bool public isPaused;
    
    /// @notice Timestamp when the current pause period ends
    uint256 public pauseEndTime;
    
    /// @notice Structure defining a proposal in the system
    struct Proposal {
        ProposalType proposalType;     // Type of the proposal
        address proposer;              // Address that created the proposal
        address targetContract;        // Target contract for transaction proposals
        bytes data;                    // Encoded function call data
        uint256 value;                 // ETH value to send with the transaction
        uint256 proposalTime;          // Timestamp when proposal was created
        uint256 deadline;              // Timestamp when proposal expires
        bool executed;                 // Whether the proposal has been executed
        bool cancelled;                // Whether the proposal has been cancelled
        address[] approvers;           // List of addresses that have approved
        mapping(address => bool) hasApproved; // Mapping of approvers
        // Configuration data for specific proposal types
        uint256 newRequiredApprovals;  // New approval requirement (if changing)
        address newOwner;              // Address to add as owner
        address ownerToRemove;         // Address to remove as owner
        uint256 newDeadlineDuration;   // New deadline duration
    }
    
    /// @notice Mapping of proposal IDs to their corresponding Proposal structs
    mapping(uint256 => Proposal) public proposals;
    
    /// @notice Counter for total number of proposals created
    uint256 public proposalCount;
    
    // ============ Events ============

    /// @notice Emitted when a new proposal is created
    event ProposalCreated(
        uint256 indexed proposalId,
        address proposer,
        ProposalType proposalType,
        uint256 deadline
    );

    /// @notice Emitted when a proposal receives an approval
    event ProposalApproved(
        uint256 indexed proposalId,
        address approver
    );

    /// @notice Emitted when a proposal is successfully executed
    event ProposalExecuted(
        uint256 indexed proposalId,
        address executor
    );

    /// @notice Emitted when a proposal is cancelled
    event ProposalCancelled(
        uint256 indexed proposalId,
        address canceller
    );

    /// @notice Emitted when a new owner is added to the system
    event OwnerAdded(address indexed newOwner);

    /// @notice Emitted when an owner is removed from the system
    event OwnerRemoved(address indexed removedOwner);

    /// @notice Emitted when the required approvals count is updated
    event RequiredApprovalsUpdated(uint256 newRequiredApprovals);

    /// @notice Emitted when the proposal deadline duration is updated
    event DeadlineDurationUpdated(uint256 newDuration);

    /// @notice Emitted when the contract is emergency paused
    event EmergencyPaused(address pauser);

    /// @notice Emitted when the contract is emergency unpaused
    event EmergencyUnpaused(address unpauser);

    /// @notice Emitted when the contract is paused through a proposal
    event ContractPaused(
        address indexed executor,
        uint256 duration,
        uint256 endTime
    );

    /// @notice Emitted when the contract is unpaused through a proposal
    event ContractUnpaused(address indexed executor);
    
    // ============ Modifiers ============

    /// @notice Ensures the caller is an owner of the contract
    modifier onlyOwner() {
        require(isOwner(msg.sender), "MultiGuard: Caller is not an owner");
        _;
    }

    /// @notice Ensures the contract is not paused or the pause period has expired
    modifier whenNotPaused() {
        // The contract is considered "not paused" if:
        //   1) isPaused == false, OR
        //   2) current time is beyond pauseEndTime
        require(
            !isPaused || block.timestamp > pauseEndTime,
            "MultiGuard: Contract is paused"
        );
        _;
    }

    /// @notice Ensures the contract is currently paused
    modifier whenPaused() {
        require(isPaused, "Contract is not paused");
        _;
    }

    /// @notice Ensures the proposal ID is valid
    modifier validProposal(uint256 _proposalId) {
        require(
            _proposalId > 0 && _proposalId <= proposalCount,
            "MultiGuard: Invalid proposal ID"
        );
        _;
    }
    
    /// @notice Validates proposal for execution
    modifier canExecuteProposal(uint256 _proposalId) {
        require(
            _proposalId > 0 && _proposalId <= proposalCount,
            "MultiGuard: Invalid proposal ID"
        );
        require(!proposals[_proposalId].cancelled, "MultiGuard: Proposal is cancelled");
        require(
            block.timestamp < proposals[_proposalId].deadline,
            "MultiGuard: Proposal deadline passed"
        );
        require(!proposals[_proposalId].executed, "MultiGuard: Proposal already executed");
        require(
            proposals[_proposalId].approvers.length >= requiredApprovals,
            "MultiGuard: Not enough approvals"
        );
        _;
    }
    
    // ============ Constructor ============

    /// @notice Initializes the MultiGuard contract with initial owners and configuration
    /// @param _owners Array of addresses to be set as initial owners
    /// @param _requiredApprovals Number of approvals required for proposal execution
    /// @param _proposalDeadlineDuration Duration for which proposals remain valid
    constructor(
        address[] memory _owners,
        uint256 _requiredApprovals,
        uint256 _proposalDeadlineDuration
    ) {
        require(
            _owners.length > 0 && _owners.length <= MAX_OWNERS,
            "MultiGuard: Invalid number of owners"
        );
        require(
            _requiredApprovals > 0 && _requiredApprovals <= _owners.length,
            "MultiGuard: Invalid required approvals"
        );
        require(
            _proposalDeadlineDuration >= MIN_DEADLINE_DURATION &&
            _proposalDeadlineDuration <= MAX_DEADLINE_DURATION,
            "MultiGuard: Invalid deadline duration"
        );

        // Initialize owners, using a mapping to check duplicates
        for (uint256 i = 0; i < _owners.length; i++) {
            address ownerAddr = _owners[i];
            require(ownerAddr != address(0), "MultiGuard: Zero address owner");
            require(!ownerMap[ownerAddr], "MultiGuard: Duplicate owner");

            ownerMap[ownerAddr] = true;
            ownerIndex[ownerAddr] = owners.length;
            owners.push(ownerAddr);

            emit OwnerAdded(ownerAddr);
        }
        
        requiredApprovals = _requiredApprovals;
        proposalDeadlineDuration = _proposalDeadlineDuration;
    }
    
    // ============ View Functions ============

    /// @notice Checks if an address is an owner of the contract
    /// @param _address Address to check
    /// @return bool True if the address is an owner
    function isOwner(address _address) public view returns (bool) {
        return ownerMap[_address];
    }

    /// @notice Returns the list of all owner addresses
    /// @return Array of owner addresses
    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    /// @notice Returns the current number of required approvals
    /// @return Number of required approvals
    function getRequiredApprovals() external view returns (uint256) {
        return requiredApprovals;
    }

    // ============ Proposal Management ============
    
    /// @notice Creates a new transaction proposal
    /// @param _targetContract Address of the contract to execute the transaction on
    /// @param _data Encoded function call data
    /// @param _value Amount of ETH to send with the transaction
    /// @return proposalId ID of the created proposal
    function proposeTransaction(
        address _targetContract,
        bytes calldata _data,
        uint256 _value
    ) external whenNotPaused onlyOwner returns (uint256) {
        require(
            _targetContract != address(0),
            "MultiGuard: Zero address target"
        );
        require(
            _targetContract != address(this),
            "MultiGuard: Cannot target MultiGuard"
        );
        require(
            _targetContract.isContract(),
            "MultiGuard: Target must be a contract"
        );
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalType = ProposalType.Transaction;
        proposal.proposer = msg.sender;
        proposal.targetContract = _targetContract;
        proposal.data = _data;
        proposal.value = _value;
        proposal.proposalTime = block.timestamp;
        proposal.deadline = block.timestamp + proposalDeadlineDuration;
        proposal.executed = false;
        proposal.cancelled = false;
        
        // Auto-approve by the proposer
        proposal.approvers.push(msg.sender);
        proposal.hasApproved[msg.sender] = true;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            ProposalType.Transaction,
            proposal.deadline
        );
        
        return proposalId;
    }

    /// @notice Creates a proposal to update the required number of approvals
    /// @param _newRequiredApprovals New number of required approvals
    /// @return proposalId ID of the created proposal
    function proposeUpdateRequiredApprovals(
        uint256 _newRequiredApprovals
    ) external whenNotPaused onlyOwner returns (uint256) {
        require(
            _newRequiredApprovals > 0 &&
            _newRequiredApprovals <= owners.length,
            "MultiGuard: Invalid required approvals"
        );
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalType = ProposalType.ChangeRequiredApprovals;
        proposal.proposer = msg.sender;
        proposal.newRequiredApprovals = _newRequiredApprovals;
        proposal.proposalTime = block.timestamp;
        proposal.deadline = block.timestamp + proposalDeadlineDuration;
        proposal.executed = false;
        proposal.cancelled = false;
        
        // Auto-approve by the proposer
        proposal.approvers.push(msg.sender);
        proposal.hasApproved[msg.sender] = true;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            ProposalType.ChangeRequiredApprovals,
            proposal.deadline
        );
        
        return proposalId;
    }

    /// @notice Creates a proposal to add a new owner to the system
    /// @param _newOwner Address of the new owner to add
    /// @return proposalId ID of the created proposal
    function proposeAddOwner(address _newOwner)
        external
        whenNotPaused
        onlyOwner
        returns (uint256)
    {
        require(_newOwner != address(0), "MultiGuard: Zero address owner");
        require(!ownerMap[_newOwner], "MultiGuard: Already an owner");
        require(owners.length < MAX_OWNERS, "MultiGuard: Too many owners");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalType = ProposalType.AddOwner;
        proposal.proposer = msg.sender;
        proposal.newOwner = _newOwner;
        proposal.proposalTime = block.timestamp;
        proposal.deadline = block.timestamp + proposalDeadlineDuration;
        proposal.executed = false;
        proposal.cancelled = false;
        
        // Auto-approve by the proposer
        proposal.approvers.push(msg.sender);
        proposal.hasApproved[msg.sender] = true;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            ProposalType.AddOwner,
            proposal.deadline
        );
        
        return proposalId;
    }

    /// @notice Creates a proposal to remove an existing owner from the system
    /// @param _ownerToRemove Address of the owner to remove
    /// @return proposalId ID of the created proposal
    function proposeRemoveOwner(address _ownerToRemove)
        external
        whenNotPaused
        onlyOwner
        returns (uint256)
    {
        // Ensures we don't reduce the owner set below requiredApprovals
        require(
            owners.length > requiredApprovals,
            "MultiGuard: Cannot remove owner"
        );
        require(
            ownerMap[_ownerToRemove],
            "MultiGuard: Owner not found"
        );
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalType = ProposalType.RemoveOwner;
        proposal.proposer = msg.sender;
        proposal.ownerToRemove = _ownerToRemove;
        proposal.proposalTime = block.timestamp;
        proposal.deadline = block.timestamp + proposalDeadlineDuration;
        proposal.executed = false;
        proposal.cancelled = false;
        
        // Auto-approve by the proposer
        proposal.approvers.push(msg.sender);
        proposal.hasApproved[msg.sender] = true;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            ProposalType.RemoveOwner,
            proposal.deadline
        );
        
        return proposalId;
    }

    /// @notice Creates a proposal to update the proposal deadline duration
    /// @param _newDuration New duration for proposal deadlines
    /// @return proposalId ID of the created proposal
    function proposeUpdateDeadlineDuration(uint256 _newDuration)
        external
        whenNotPaused
        onlyOwner
        returns (uint256)
    {
        require(
            _newDuration >= MIN_DEADLINE_DURATION &&
            _newDuration <= MAX_DEADLINE_DURATION,
            "MultiGuard: Invalid deadline duration"
        );
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalType = ProposalType.UpdateDeadlineDuration;
        proposal.proposer = msg.sender;
        proposal.newDeadlineDuration = _newDuration;
        proposal.proposalTime = block.timestamp;
        proposal.deadline = block.timestamp + proposalDeadlineDuration;
        proposal.executed = false;
        proposal.cancelled = false;
        
        // Auto-approve by the proposer
        proposal.approvers.push(msg.sender);
        proposal.hasApproved[msg.sender] = true;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            ProposalType.UpdateDeadlineDuration,
            proposal.deadline
        );
        
        return proposalId;
    }

    /// @notice Approves a proposal. If enough approvals are received, the proposal is executed.
    /// @param _proposalId ID of the proposal to approve
    function approveProposal(uint256 _proposalId)
        external
        whenNotPaused
        onlyOwner
        validProposal(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];
        
        require(!proposal.cancelled, "MultiGuard: Proposal is cancelled");
        require(
            block.timestamp < proposal.deadline,
            "MultiGuard: Proposal deadline passed"
        );
        require(!proposal.executed, "MultiGuard: Proposal already executed");
        require(
            !proposal.hasApproved[msg.sender],
            "MultiGuard: Already approved"
        );
        
        proposal.approvers.push(msg.sender);
        proposal.hasApproved[msg.sender] = true;
        
        emit ProposalApproved(_proposalId, msg.sender);
        
        // Check if we have enough approvals to execute
        if (proposal.approvers.length >= requiredApprovals) {
            executeProposal(_proposalId);
        }
    }
    
    /// @notice Executes a proposal after it has received enough approvals
    /// @param _proposalId ID of the proposal to execute
    function executeProposal(uint256 _proposalId)
        public
        whenNotPaused
        onlyOwner
        canExecuteProposal(_proposalId)
        nonReentrant
    {
        proposals[_proposalId].executed = true;

        ProposalType proposalType = proposals[_proposalId].proposalType;
        
        if (proposalType == ProposalType.Transaction) {
            _executeTransaction(_proposalId);
        } else if (proposalType == ProposalType.ChangeRequiredApprovals) {
            _executeChangeRequiredApprovals(_proposalId);
        } else if (proposalType == ProposalType.AddOwner) {
            _executeAddOwner(_proposalId);
        } else if (proposalType == ProposalType.RemoveOwner) {
            _executeRemoveOwner(_proposalId);
        } else if (proposalType == ProposalType.UpdateDeadlineDuration) {
            _executeUpdateDeadlineDuration(_proposalId);
        } else if (proposalType == ProposalType.Pause) {
            _executePause(_proposalId);
        } else if (proposalType == ProposalType.Unpause) {
            _executeUnpause(_proposalId);
        }
    }

    /// @notice Executes a transaction proposal
    function _executeTransaction(uint256 _proposalId) internal {
        address target = proposals[_proposalId].targetContract;
        bytes memory data = proposals[_proposalId].data;
        uint256 value = proposals[_proposalId].value;

        Address.functionCallWithValue(
            target,
            data,
            value,
            "MultiGuard: Transaction execution failed"
        );
        emit ProposalExecuted(_proposalId, msg.sender);
    }

    /// @notice Executes a change required approvals proposal
    function _executeChangeRequiredApprovals(uint256 _proposalId) internal {
        uint256 newApprovals = proposals[_proposalId].newRequiredApprovals;
        requiredApprovals = newApprovals;
        emit RequiredApprovalsUpdated(newApprovals);
        emit ProposalExecuted(_proposalId, msg.sender);
    }

    /// @notice Executes an add owner proposal
    function _executeAddOwner(uint256 _proposalId) internal {
        address newOwner = proposals[_proposalId].newOwner;
        _addOwner(newOwner);
        emit OwnerAdded(newOwner);
        emit ProposalExecuted(_proposalId, msg.sender);
    }

    /// @notice Executes a remove owner proposal
    function _executeRemoveOwner(uint256 _proposalId) internal {
        address ownerToRemove = proposals[_proposalId].ownerToRemove;
        _removeOwner(ownerToRemove);
        emit OwnerRemoved(ownerToRemove);
        emit ProposalExecuted(_proposalId, msg.sender);
    }

    /// @notice Executes an update deadline duration proposal
    function _executeUpdateDeadlineDuration(uint256 _proposalId) internal {
        uint256 newDuration = proposals[_proposalId].newDeadlineDuration;
        proposalDeadlineDuration = newDuration;
        emit DeadlineDurationUpdated(newDuration);
        emit ProposalExecuted(_proposalId, msg.sender);
    }

    /// @notice Executes a pause proposal
    function _executePause(uint256 _proposalId) internal {
        uint256 duration = proposals[_proposalId].value;
        isPaused = true;
        pauseEndTime = block.timestamp + duration;
        emit ContractPaused(msg.sender, duration, pauseEndTime);
        emit ProposalExecuted(_proposalId, msg.sender);
    }

    /// @notice Executes an unpause proposal
    function _executeUnpause(uint256 _proposalId) internal {
        isPaused = false;
        pauseEndTime = 0;
        emit ContractUnpaused(msg.sender);
        emit ProposalExecuted(_proposalId, msg.sender);
    }

    /// @notice Cancels a proposal if it hasn't been executed and the deadline hasn't passed
    /// @param _proposalId ID of the proposal to cancel
    function cancelProposal(uint256 _proposalId)
        external
        onlyOwner
        validProposal(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];
        
        require(!proposal.executed, "MultiGuard: Proposal already executed");
        require(!proposal.cancelled, "MultiGuard: Proposal already cancelled");
        require(
            msg.sender == proposal.proposer ||
            block.timestamp >= proposal.deadline,
            "MultiGuard: Only proposer can cancel before deadline"
        );
        
        proposal.cancelled = true;
        emit ProposalCancelled(_proposalId, msg.sender);
    }

    // ============ Owner Utilities ============

    /// @notice Internal function to add a new owner to the system
    /// @param _newOwner Address of the new owner to add
    function _addOwner(address _newOwner) internal {
        // Enforce checks have been done by the caller
        ownerMap[_newOwner] = true;
        ownerIndex[_newOwner] = owners.length;
        owners.push(_newOwner);
    }

    /// @notice Internal function to remove an owner from the system
    /// @param _ownerToRemove Address of the owner to remove
    function _removeOwner(address _ownerToRemove) internal {
        // We assume isOwner(_ownerToRemove) is true from earlier checks
        uint256 index = ownerIndex[_ownerToRemove];
        uint256 lastIndex = owners.length - 1;

        // If _ownerToRemove is not the last in the array, swap
        if (index != lastIndex) {
            address lastOwner = owners[lastIndex];
            owners[index] = lastOwner;
            ownerIndex[lastOwner] = index;
        }
        // Remove the last element
        owners.pop();

        // Clear mappings
        ownerMap[_ownerToRemove] = false;
        delete ownerIndex[_ownerToRemove];
    }

    // ============ Pause/Unpause Implementation ============

    /// @notice Creates a proposal to pause the contract for a specified duration
    /// @param _duration Duration for which the contract should be paused
    /// @return proposalId ID of the created proposal
    function proposePause(uint256 _duration)
        public
        onlyOwner
        returns (uint256)
    {
        require(!isPaused, "Contract is already paused");
        require(_duration > 0, "Duration must be greater than 0");
        require(_duration <= 30 days, "Duration cannot exceed 30 days");

        return createProposal(
            address(this),
            abi.encodeWithSelector(this.executePause.selector, _duration),
            _duration,
            ProposalType.Pause
        );
    }

    /// @notice Creates a proposal to unpause the contract
    /// @return proposalId ID of the created proposal
    function proposeUnpause()
        public
        onlyOwner
        whenPaused
        returns (uint256)
    {
        // Enforce that the pause window hasn't ended yet
        require(
            block.timestamp > pauseEndTime,
            "MultiGuard: Pause duration has not expired"
        );

        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalType = ProposalType.Unpause;
        proposal.proposer = msg.sender;
        proposal.targetContract = address(this);
        proposal.data = abi.encodeWithSelector(this.executeUnpause.selector);
        proposal.value = 0;
        proposal.proposalTime = block.timestamp;
        proposal.deadline = block.timestamp + proposalDeadlineDuration;
        proposal.executed = false;
        proposal.cancelled = false;
        
        // Auto-approve by the proposer
        proposal.approvers.push(msg.sender);
        proposal.hasApproved[msg.sender] = true;
        
        emit ProposalCreated(proposalId, msg.sender, ProposalType.Unpause, proposal.deadline);
        
        return proposalId;
    }

    /// @notice Executes a pause operation (can only be called through a proposal)
    /// @param _duration Duration for which the contract should be paused
    function executePause(uint256 _duration) public {
        require(msg.sender == address(this), "Only through proposal execution");
        require(!isPaused, "Contract is already paused");
        
        isPaused = true;
        pauseEndTime = block.timestamp + _duration;
        
        emit ContractPaused(msg.sender, _duration, pauseEndTime);
    }

    /// @notice Executes an unpause operation (can only be called through a proposal)
    function executeUnpause() public {
        require(msg.sender == address(this), "Only through proposal execution");
        require(isPaused, "Contract is not paused");
        require(block.timestamp > pauseEndTime, "Pause duration has not expired");
        
        isPaused = false;
        pauseEndTime = 0;
        
        emit ContractUnpaused(msg.sender);
    }

    // ============ View Functions ============

    /// @notice Returns the list of approvers for a specific proposal
    /// @param _proposalId ID of the proposal to get approvers for
    /// @return Array of addresses that have approved the proposal
    function getApprovers(uint256 _proposalId)
        external
        view
        validProposal(_proposalId)
        returns (address[] memory)
    {
        return proposals[_proposalId].approvers;
    }
    
    /// @notice Returns the details of a specific proposal
    /// @param _proposalId ID of the proposal to get details for
    /// @return proposalType The type of the proposal
    /// @return proposer The address that created the proposal
    /// @return targetContract The target contract for transaction proposals
    /// @return data The encoded function call data
    /// @return value The ETH value to send with the transaction
    /// @return proposalTime The timestamp when the proposal was created
    /// @return deadline The timestamp when the proposal expires
    /// @return executed Whether the proposal has been executed
    /// @return cancelled Whether the proposal has been cancelled
    /// @return approvalCount The number of approvals received
    /// @return newRequiredApprovals The new required approvals (if changing)
    /// @return newOwner The address to add as owner (if adding)
    /// @return ownerToRemove The address to remove as owner (if removing)
    /// @return newDeadlineDuration The new deadline duration (if changing)
    function getProposalDetails(uint256 _proposalId)
        external
        view
        validProposal(_proposalId)
        returns (
            ProposalType proposalType,
            address proposer,
            address targetContract,
            bytes memory data,
            uint256 value,
            uint256 proposalTime,
            uint256 deadline,
            bool executed,
            bool cancelled,
            uint256 approvalCount,
            uint256 newRequiredApprovals,
            address newOwner,
            address ownerToRemove,
            uint256 newDeadlineDuration
        )
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.proposalType,
            proposal.proposer,
            proposal.targetContract,
            proposal.data,
            proposal.value,
            proposal.proposalTime,
            proposal.deadline,
            proposal.executed,
            proposal.cancelled,
            proposal.approvers.length,
            proposal.newRequiredApprovals,
            proposal.newOwner,
            proposal.ownerToRemove,
            proposal.newDeadlineDuration
        );
    }

    /// @notice Fallback function to receive Ether
    receive() external payable {}

    /// @notice Internal function to create a proposal
    /// @param _target Target contract address
    /// @param _data Encoded function call data
    /// @param _value Amount of ETH to send with the transaction
    /// @param _type Type of the proposal
    /// @return proposalId ID of the created proposal
    function createProposal(
        address _target,
        bytes memory _data,
        uint256 _value,
        ProposalType _type
    ) internal returns (uint256) {
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalType = _type;
        proposal.proposer = msg.sender;
        proposal.targetContract = _target;
        proposal.data = _data;
        proposal.value = _value;
        proposal.proposalTime = block.timestamp;
        proposal.deadline = block.timestamp + proposalDeadlineDuration;
        proposal.executed = false;
        proposal.cancelled = false;
        
        // First approval is from the proposer
        proposal.approvers.push(msg.sender);
        proposal.hasApproved[msg.sender] = true;
        
        emit ProposalCreated(proposalId, msg.sender, _type, proposal.deadline);
        return proposalId;
    }

    /// @notice Returns the current pause status of the contract
    /// @return isCurrentlyPaused Whether the contract is currently paused
    /// @return remainingTime Remaining time in the pause period (in seconds)
    function getPauseStatus()
        public
        view
        returns (bool isCurrentlyPaused, uint256 remainingTime)
    {
        if (!isPaused || block.timestamp > pauseEndTime) {
            return (false, 0);
        }
        
        uint256 remaining = pauseEndTime > block.timestamp
            ? pauseEndTime - block.timestamp
            : 0;
            
        return (true, remaining);
    }
}
