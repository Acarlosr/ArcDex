// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ArcDex LP Token
/// @notice ERC-20 token representing liquidity provider shares in ArcDex pools
/// @dev Only the pool contract can mint/burn LP tokens
contract ArcDexLP is ERC20, Ownable {
    /// @notice The pool contract that can mint/burn tokens
    address public pool;
    
    /// @notice Emitted when pool address is updated
    event PoolUpdated(address indexed oldPool, address indexed newPool);
    
    error OnlyPool();
    error ZeroAddress();
    
    modifier onlyPool() {
        if (msg.sender != pool) revert OnlyPool();
        _;
    }
    
    constructor() ERC20("ArcDex LP Token", "ARC-LP") Ownable(msg.sender) {}
    
    /// @notice Set the pool contract address
    /// @param _pool The address of the pool contract
    function setPool(address _pool) external onlyOwner {
        if (_pool == address(0)) revert ZeroAddress();
        address oldPool = pool;
        pool = _pool;
        emit PoolUpdated(oldPool, _pool);
    }
    
    /// @notice Mint LP tokens to a recipient
    /// @param to The recipient address
    /// @param amount The amount of LP tokens to mint
    function mint(address to, uint256 amount) external onlyPool {
        _mint(to, amount);
    }
    
    /// @notice Burn LP tokens from an account
    /// @param from The account to burn from
    /// @param amount The amount of LP tokens to burn
    function burn(address from, uint256 amount) external onlyPool {
        _burn(from, amount);
    }
}
