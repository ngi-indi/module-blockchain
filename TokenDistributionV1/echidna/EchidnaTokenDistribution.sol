// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1; // current version at the time of writing: 0.8.25+commit.b61c2a91

import "../contracts/IndiToken.sol";
import "../contracts/TokenDistribution.sol";

contract EchidnaTokenDistribution is TokenDistribution
{
    // -----------------------------------------------------------
    // Echidna addresses
    // -----------------------------------------------------------

    address constant ECHIDNA_ADDRESS_0 = address(0);
    address constant ECHIDNA_ADDRESS_1 = address(0x10000);
    address constant ECHIDNA_ADDRESS_2 = address(0x20000);
    address constant ECHIDNA_ADDRESS_3 = address(0x30000);
    address constant ECHIDNA_ADDRESS_4 = address(0x40000);
    address constant ECHIDNA_ADDRESS_5 = address(0x50000);

    address echidna_caller = msg.sender;  // transaction caller (expected to be 0x10000 from the echidna.config.yaml file)
    address echidna = address(this);      // contract

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Token Distribution state
    // -----------------------------------------------------------
    
    IndiToken indiToken = new IndiToken();
    
    address payable constant RECIPIENT = payable(ECHIDNA_ADDRESS_2);
    uint constant VALIDATORS_THRESHOLD = 3;
    uint constant TIMEOUT = 200;
    uint constant MINT_AMOUNT = 500_000;

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Echidna constructor
    // -----------------------------------------------------------

    constructor() TokenDistribution(
        indiToken,
        RECIPIENT,
        VALIDATORS_THRESHOLD,
        MINT_AMOUNT
    ) {
        // ERC20 actions
        indiToken.mint(MINT_AMOUNT);

        indiToken.approve(echidna_caller, MINT_AMOUNT);
        indiToken.approve(echidna, MINT_AMOUNT);
    }
    
    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Debug events
    // -----------------------------------------------------------

    event Debug(string name, address value);
    event Debug(string name, uint value);

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Assertions
    // -----------------------------------------------------------
    
    function echidnaAddresses() public {
        emit Debug("Echidna caller: ", echidna_caller);
        emit Debug("Echidna address: ", echidna);
        emit Debug("TokenDistribution owner: ", this.owner());
        emit Debug("IndiToken owner: ", indiToken.owner());

        assert(echidna_caller == ECHIDNA_ADDRESS_1);
        assert(this.owner() == echidna_caller);
        assert(indiToken.owner() == echidna);
    }


    function echidnaValidatorsThreshold() public {
        assert(this.getNumberOfValidatorsInCurrentRequest() <= VALIDATORS_THRESHOLD);
    }


    function echidnaRequestAmount(uint _amount) public {
        // Perform a request
        request(_amount);

        // A request should always be less than or equal to the contract's tokens balance.
        assert(currentRequest.amount <= indiToken.balanceOf(address(this)));
    }


    function echidnaRequestTimeout(uint _amount) public {
        // Request block number before a newer request
        uint lastRequestTime = this.getBlockNumberInCurrentRequest();

        // If we've not passed the timeout yet
        if(block.number <= lastRequestTime + TIMEOUT) {
            // Perform a new request
            request(_amount);

            // The request block number should not change (i.e. the request() has failed)
            assert(this.getBlockNumberInCurrentRequest() == lastRequestTime);
        }
    }

    // -----------------------------------------------------------
}