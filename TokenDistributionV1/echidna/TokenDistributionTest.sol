// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1; // current version at the time of writing: 0.8.25+commit.b61c2a91

import "../contracts/OntologyToken.sol";
import "../contracts/TokenDistribution.sol";

contract TokenDistributionTest is TokenDistribution
{
    address payable constant RECIPIENT = payable(address(1));
    uint constant VALIDATORS_THRESHOLD = 3;
    uint constant TIMEOUT = 200;

    constructor() TokenDistribution(
        new OntologyToken(),
        RECIPIENT,
        VALIDATORS_THRESHOLD,
        TIMEOUT
    ) {}

    // Echidna's hello world:
    function echidna_pass() public returns (bool) {
        return true;
    } 
}