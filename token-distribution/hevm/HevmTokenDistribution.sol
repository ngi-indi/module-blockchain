// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1; // current version at the time of writing: 0.8.25+commit.b61c2a91

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IndiToken.sol";

contract HevmTokenDistribution
{
    // ---------------------------------------------------------
    // Attributes
    // ---------------------------------------------------------

    // Custom types:
    struct Request
    {
        uint amount;
        uint blockNumber; // the block in which the request has been performed
        address[] approvalValidators;
    }

    // Participants:
    address public owner;
    address payable public recipient;
    mapping(address => bool) public validators;

    // Status:
    IERC20 public token; // ERC20 interface
    Request public currentRequest;
    uint public validatorsThreshold;
    uint public timeout;

    // Events:
    event NewDeposit(uint amount);
    event NewWithdrawalRequest(Request request);
    event RequestApprovedByValidator(address indexed validator, Request request);
    event RecipientWithdrew(uint amount);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    // hevm:
    IndiToken indiToken = new IndiToken();
    uint constant VALIDATORS_THRESHOLD = 3;
    uint constant TIMEOUT = 110;

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------

    constructor(IERC20 _token, address payable _recipient, uint _validatorsThreshold, uint _timeout)
    {
        owner = msg.sender;

        token = _token;
        recipient = _recipient;
        validatorsThreshold = _validatorsThreshold;
        timeout = _timeout;

        currentRequest.approvalValidators = new address[](validatorsThreshold);
    }

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Functions
    // ---------------------------------------------------------

    // Requires calling token.approve() before deposit!
    function deposit(uint _amount) public onlyOwner
    {
        require(_amount > 0, "Amount must be greater than zero!");

        bool success = token.transferFrom(msg.sender, address(this), _amount);
        require(success, "Deposit failed.");

        emit NewDeposit(_amount);
    }

    function addValidator(address _validator) public onlyOwner
    {
        validators[_validator] = true;
    }

    function removeValidator(address _validator) public onlyOwner
    {
        validators[_validator] = false;
    }

    function request(uint _amount) public onlyRecipient
    {
        require(_amount > 0, "The amount must be greater than zero!");
        require(token.balanceOf(address(this)) >= _amount, "Contract has not enough tokens to cover this request!");

        // Timeout excess or default value (currentRequest not initialized) i.e. 0.
        // In the very unfortunate case, a withdrawal request cannot be performed in the genesis block of a EVM chain because contract has to be created before that!
        if(block.number > currentRequest.blockNumber + timeout || currentRequest.blockNumber == 0)
        {
            // Creates an empty request at the current block with the specified amount.
            currentRequest = Request(_amount, block.number, new address[](validatorsThreshold));

            emit NewWithdrawalRequest(currentRequest);
        }
        else
        {
            revert("There's an active request pending!");
        }
    }

    function approve() public onlyValidators
    {
        require(currentRequest.blockNumber + timeout > block.number, "The request has expired!");

        // Checks if the validator has already voted this request
        for(uint i=0; i<currentRequest.approvalValidators.length; i++)
        {
            if(currentRequest.approvalValidators[i] == msg.sender) { revert("You have already approved this request!"); }
        }

        require(getNumberOfValidatorsInCurrentRequest() < validatorsThreshold, "Number of approvals exceed!");

        currentRequest.approvalValidators[getNumberOfValidatorsInCurrentRequest()] = msg.sender;

        emit RequestApprovedByValidator(msg.sender, currentRequest);
    }

    function withdraw() public onlyRecipient
    {
        require(getNumberOfValidatorsInCurrentRequest() == validatorsThreshold);
        require(token.transfer(recipient, currentRequest.amount));

        // The current request is no longer valid, so we set the default uint value for the amount and block number
        currentRequest.amount = 0;
        currentRequest.blockNumber = 0;

        // Flushes the array of validators
        currentRequest.approvalValidators = new address[](validatorsThreshold);

        emit RecipientWithdrew(currentRequest.amount);
    }

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Getters
    // ---------------------------------------------------------

    function getNumberOfValidatorsInCurrentRequest() public view returns (uint) {
        // if the value is not overridden by the for loop this means there are not free indeces i.e. the array is full and the number of approval is equal to the threshold
        uint firstFreeIndex = validatorsThreshold;

        // Searches for the first free value in the addresses array (i.e. the default value)
        for(uint i=0; i<currentRequest.approvalValidators.length; i++)
        {
            if(currentRequest.approvalValidators[i] == address(0)){
                firstFreeIndex = i;
                break;
            }
        }

        return firstFreeIndex;
    }

    function getApprovalValidatorsInCurrentRequest() public view returns (address[] memory) {
        return currentRequest.approvalValidators;
    }

    function getBlockNumberInCurrentRequest() public view returns (uint) {
        return currentRequest.blockNumber;
    }

    // ---------------------------------------------------------


    // ---------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------

    modifier onlyOwner()
    {
        require(msg.sender == owner, "Only owner can call this function!");
        _;
    }

    modifier onlyRecipient()
    {
        require(msg.sender == recipient, "Only recipient can call this function!");
        _;
    }

    modifier onlyValidators()
    {
        require(validators[msg.sender], "Only a validator can call this function!");
        _;
    }

    // ---------------------------------------------------------

    // -----------------------------------------------------------
    // Assertions
    // -----------------------------------------------------------

    function requestAmountLTEcontractBalance(uint _amount) public {
        // Perform a request
        request(_amount);

        // A request should always be less than or equal to the contract's tokens balance.
        assert(currentRequest.amount <= indiToken.balanceOf(address(this)));
    }


    function preventNewRequestsBeforeTimeout(uint _amount) public {
        //  block number of the current request before a newer one
        uint lastRequestTime = this.getBlockNumberInCurrentRequest();

        // If the request has not yet expireed
        if(block.number <= lastRequestTime + TIMEOUT) {
            // Perform a new request
            request(_amount);

            // The request block number should not change (i.e. the request() has failed)
            assert(this.getBlockNumberInCurrentRequest() == lastRequestTime);
        }
    }

    function numberOfValidatorsLTEthreshold() public {
        assert(this.getNumberOfValidatorsInCurrentRequest() <= VALIDATORS_THRESHOLD);
    }

    // -----------------------------------------------------------
}