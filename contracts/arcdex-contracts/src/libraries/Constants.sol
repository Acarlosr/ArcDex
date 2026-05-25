// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Constants for ArcDex on Arc Testnet
/// @notice Official token addresses and configuration
library Constants {
    // Arc Testnet Official Token Addresses
    address constant USDC = 0x3600000000000000000000000000000000000000;
    address constant EURC = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;
    
    // Permit2 (standard across EVM networks)
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    
    // StableFX Escrow
    address constant FX_ESCROW = 0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1;
    
    // Token decimals (ERC-20 interface)
    uint8 constant USDC_DECIMALS = 6;
    uint8 constant EURC_DECIMALS = 6;
    
    // Protocol fees (in basis points, 1 bp = 0.01%)
    uint256 constant SWAP_FEE_BPS = 30; // 0.3%
    uint256 constant PAYMENT_FEE = 50000; // 0.05 USDC (6 decimals)
    
    // Staking APR (in basis points)
    uint256 constant USDC_BASE_APR_BPS = 800; // 8%
    uint256 constant USDC_BOOST_APR_BPS = 200; // 2%
    uint256 constant EURC_BASE_APR_BPS = 600; // 6%
    uint256 constant EURC_BOOST_APR_BPS = 200; // 2%
    
    // Basis points denominator
    uint256 constant BPS_DENOMINATOR = 10000;
}
