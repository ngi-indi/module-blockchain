// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract OntologyToken is ERC20, Ownable, ERC20Permit {
    constructor()
        ERC20("OntologyToken", "OTK")
        Ownable(msg.sender)
        ERC20Permit("OntologyToken")
    {}

    function mint(uint256 amount) public onlyOwner 
    {
        _mint(msg.sender, amount); // amount * 10**18 https://github.com/ethereum/EIPs/issues/724
    }
}
