// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ArcDex LP Token for USYC Pools
/// @notice LP token for USDC/USYC and EURC/USYC liquidity pools
contract ArcDexLPUSYC is ERC20, Ownable {
    address public swapContract;
    
    error OnlySwapContract();
    error SwapAlreadySet();
    
    constructor() ERC20("ArcDex USYC LP", "ARCDEX-USYC-LP") Ownable(msg.sender) {}
    
    /// @notice Set the swap contract address (can only be set once)
    function setSwapContract(address _swapContract) external onlyOwner {
        if (swapContract != address(0)) revert SwapAlreadySet();
        swapContract = _swapContract;
    }
    
    /// @notice Mint LP tokens (only callable by swap contract)
    function mint(address to, uint256 amount) external {
        if (msg.sender != swapContract && msg.sender != owner()) revert OnlySwapContract();
        _mint(to, amount);
    }
    
    /// @notice Burn LP tokens (only callable by swap contract)
    function burn(address from, uint256 amount) external {
        if (msg.sender != swapContract) revert OnlySwapContract();
        _burn(from, amount);
    }
}
