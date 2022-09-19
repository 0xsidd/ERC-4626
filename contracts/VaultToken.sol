// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VaultToken is ERC20, Ownable {
    constructor(address _address) ERC20("VaultToken", "VTK") {
        _mint(address(this), 10000 * 1 ** 18);
        _mint(msg.sender, 10000 * 1 ** 18);
        _mint(_address, 10000 * 1 ** 18);
    }
}