// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@rari-capital/solmate/src/mixins/ERC4626.sol";
import "@rari-capital/solmate/src/utils/SafeTransferLib.sol";



contract Vault is ERC4626 { 
    constructor(ERC20 _asset,string memory _name, string memory _symbol) ERC4626(_asset,_name,_symbol){}

    function totalAssets() public view virtual override returns(uint256) {
        return asset.balanceOf(address(this));
    }

}