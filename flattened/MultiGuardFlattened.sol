// File: @openzeppelin/contracts/security/ReentrancyGuard.sol

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

// File: @openzeppelin/contracts/utils/Address.sol

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Address.sol)

pragma solidity ^0.8.1;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     *
     * Furthermore, `isContract` will also return true if the target contract within
     * the same transaction is already scheduled for destruction by `SELFDESTRUCT`,
     * which only has an effect at the end of a transaction.
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.8.0/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and revert (either by bubbling
     * the revert reason or using the provided one) in case of unsuccessful call or if target was not a contract.
     *
     * _Available since v4.8._
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        if (success) {
            if (returndata.length == 0) {
                // only check isContract if the call was successful and the return data is empty
                // otherwise we already know that it was a contract
                require(isContract(target), "Address: call to non-contract");
            }
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason or using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    function _revert(bytes memory returndata, string memory errorMessage) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert(errorMessage);
        }
    }
}

// File: contracts/MultiGuard.sol

pragma solidity ^0.8.17;


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
        validProposal(_proposalId)
        nonReentrant
    {
        Proposal storage proposal = proposals[_proposalId];
        
        require(!proposal.cancelled, "MultiGuard: Proposal is cancelled");
        require(
            block.timestamp < proposal.deadline,
            "MultiGuard: Proposal deadline passed"
        );
        require(!proposal.executed, "MultiGuard: Proposal already executed");
        require(
            proposal.approvers.length >= requiredApprovals,
            "MultiGuard: Not enough approvals"
        );
        
        proposal.executed = true;
        
        if (proposal.proposalType == ProposalType.Transaction) {
            // Execute transaction
            Address.functionCallWithValue(
                proposal.targetContract,
                proposal.data,
                proposal.value,
                "MultiGuard: Transaction execution failed"
            );
            emit ProposalExecuted(_proposalId, msg.sender);

        } else if (proposal.proposalType == ProposalType.ChangeRequiredApprovals) {
            requiredApprovals = proposal.newRequiredApprovals;
            emit RequiredApprovalsUpdated(proposal.newRequiredApprovals);
            emit ProposalExecuted(_proposalId, msg.sender);

        } else if (proposal.proposalType == ProposalType.AddOwner) {
            _addOwner(proposal.newOwner);
            emit OwnerAdded(proposal.newOwner);
            emit ProposalExecuted(_proposalId, msg.sender);

        } else if (proposal.proposalType == ProposalType.RemoveOwner) {
            _removeOwner(proposal.ownerToRemove);
            emit OwnerRemoved(proposal.ownerToRemove);
            emit ProposalExecuted(_proposalId, msg.sender);

        } else if (proposal.proposalType == ProposalType.UpdateDeadlineDuration) {
            proposalDeadlineDuration = proposal.newDeadlineDuration;
            emit DeadlineDurationUpdated(proposal.newDeadlineDuration);
            emit ProposalExecuted(_proposalId, msg.sender);

        } else if (proposal.proposalType == ProposalType.Pause) {
            isPaused = true;
            pauseEndTime = block.timestamp + proposal.value;
            emit ContractPaused(msg.sender, proposal.value, pauseEndTime);
            emit ProposalExecuted(_proposalId, msg.sender);

        } else if (proposal.proposalType == ProposalType.Unpause) {
            isPaused = false;
            pauseEndTime = 0;
            emit ContractUnpaused(msg.sender);
            emit ProposalExecuted(_proposalId, msg.sender);
        }
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
