// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1; // current version at the time of writing: 0.8.25+commit.b61c2a91

import "../contracts/OntologyToken.sol";
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
    
    OntologyToken ontologyToken = new OntologyToken();
    
    address payable constant RECIPIENT = payable(ECHIDNA_ADDRESS_2);
    uint constant VALIDATORS_THRESHOLD = 3;
    uint constant TIMEOUT = 200;
    uint constant MINT_AMOUNT = 500_000;

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Echidna constructor
    // -----------------------------------------------------------

    constructor() TokenDistribution(
        ontologyToken,
        RECIPIENT,
        VALIDATORS_THRESHOLD,
        MINT_AMOUNT
    ) {
        // ERC20 actions
        ontologyToken.mint(MINT_AMOUNT);

        ontologyToken.approve(echidna_caller, MINT_AMOUNT);
        ontologyToken.approve(echidna, MINT_AMOUNT);
    }
    
    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Debug events
    // -----------------------------------------------------------

    event Debug(string name, address value);
    event Debug(string name, uint value);

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Properties
    // -----------------------------------------------------------

    // Echidna's hello world:
    function echidna_always_true() public returns (bool) {
        return true;
    } 

    // -----------------------------------------------------------


    // -----------------------------------------------------------
    // Assertions
    // -----------------------------------------------------------
    
    function testEchidnaAddress() public {
        emit Debug("Echidna caller: ", echidna_caller);
        emit Debug("Echidna address: ", echidna);
        emit Debug("TokenDistribution owner: ", this.owner());
        emit Debug("OntologyToken owner: ", ontologyToken.owner());

        assert(echidna_caller == ECHIDNA_ADDRESS_1);
        assert(this.owner() == echidna_caller);
        assert(ontologyToken.owner() == echidna);
    }

    // TODO: Add new properties (time checks, etc.)

    // This should fail by calling a ERC20 transfer
    function testOwnerBalance() public {
        emit Debug("Echidna balance: ", ontologyToken.balanceOf(echidna));
        assert(ontologyToken.balanceOf(echidna) == MINT_AMOUNT);
    }

    // -----------------------------------------------------------
}