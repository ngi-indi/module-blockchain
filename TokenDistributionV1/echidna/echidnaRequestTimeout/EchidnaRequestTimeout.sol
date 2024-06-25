// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1; // current version at the time of writing: 0.8.25+commit.b61c2a91

import "../../contracts/IndiToken.sol";
import "./TokenDistributionBugged.sol";

contract EchidnaRequestTimeout is TokenDistributionBugged
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
    uint constant TIMEOUT = 110;
    uint constant MINT_AMOUNT = 20_000;

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Echidna constructor
    // -----------------------------------------------------------

    constructor() TokenDistributionBugged(
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

    function echidnaRequestTimeout(uint _amount) public {
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

    // -----------------------------------------------------------
}