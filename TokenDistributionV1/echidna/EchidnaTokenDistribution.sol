// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1; // current version at the time of writing: 0.8.25+commit.b61c2a91

import "../contracts/OntologyToken.sol";
import "../contracts/TokenDistribution.sol";

contract EchidnaTokenDistribution
{
    // -----------------------------------------------------------
    // Echidna addresses
    // -----------------------------------------------------------

    address constant ECHIDNA_ADDRESS_0 = address(0);
    address constant ECHIDNA_ADDRESS_1 = address(0x10000);
    address constant ECHIDNA_ADDRESS_2 = address(0x20000);
    address constant ECHIDNA_ADDRESS_3 = address(0x30000);

    address echidna_caller = msg.sender;     // transaction caller (expected to be 0x10000 from the echidna.config.yaml file)
    address echidna_address = address(this); // contract

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Token Distribution state
    // -----------------------------------------------------------

    address payable constant RECIPIENT = payable(ECHIDNA_ADDRESS_2);
    uint constant VALIDATORS_THRESHOLD = 3;
    uint constant TIMEOUT = 200;
    uint constant MINT_AMOUNT = 500000;

    OntologyToken ontologyToken = new OntologyToken();

    TokenDistribution tokenDistribution = new TokenDistribution(
        IERC20(ontologyToken),
        RECIPIENT,
        VALIDATORS_THRESHOLD,
        MINT_AMOUNT
    );

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Echidna constructor
    // -----------------------------------------------------------

    constructor() 
    {
        ontologyToken.mint(MINT_AMOUNT);
    }
    
    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Debug events
    // -----------------------------------------------------------

    event DebugAddress(string name, address addr);

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Properties
    // -----------------------------------------------------------

    // Echidna's hello world:
    function echidna_always_true() pure public returns (bool) {
        return true;
    } 

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Assertions
    // -----------------------------------------------------------

    function testEchidnaAddress() view public {
        assert(echidna_caller == ECHIDNA_ADDRESS_1);

        // This Echidna contract should own the OntologyToken and TokenDistribution contracts
        assert(ontologyToken.owner() == echidna_address);
        assert(tokenDistribution.owner() == echidna_address);
    }

    // -----------------------------------------------------------
}