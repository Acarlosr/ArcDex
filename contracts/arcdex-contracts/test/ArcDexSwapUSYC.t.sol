// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ArcDexSwapUSYC.sol";
import "../src/ArcDexLPUSYC.sol";
import "../src/libraries/Constants.sol";

/// @title Tests for ArcDex USYC Swap
contract ArcDexSwapUSYCTest is Test {
    ArcDexSwapUSYC public swap;
    ArcDexLPUSYC public lpToken;
    
    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    
    IERC20 usdc = IERC20(Constants.USDC);
    IERC20 eurc = IERC20(Constants.EURC);
    IERC20 usyc = IERC20(Constants.USYC);
    
    function setUp() public {
        // Deploy LP token
        lpToken = new ArcDexLPUSYC();
        
        // Deploy swap contract
        swap = new ArcDexSwapUSYC(address(lpToken));
        
        // Set swap contract in LP token
        lpToken.setSwapContract(address(swap));
        
        // Setup test tokens for users
        // Note: In real tests on Arc Testnet, tokens would be from faucet
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }
    
    function testDeployment() public view {
        assertEq(address(swap.usdc()), Constants.USDC);
        assertEq(address(swap.eurc()), Constants.EURC);
        assertEq(address(swap.usyc()), Constants.USYC);
        assertEq(address(swap.lpToken()), address(lpToken));
    }
    
    function testGetAmountOutZeroReserves() public view {
        // Should return 0 when reserves are empty
        uint256 amountOut = swap.getAmountOutUSDC_USYC(Constants.USDC, 1000e6);
        assertEq(amountOut, 0);
    }
    
    function testGetReserves() public view {
        (uint256 reserveUSDC, uint256 reserveUSYC) = swap.getReservesUSDC_USYC();
        assertEq(reserveUSDC, 0);
        assertEq(reserveUSYC, 0);
        
        (uint256 reserveEURC, uint256 reserveUSYC2) = swap.getReservesEURC_USYC();
        assertEq(reserveEURC, 0);
        assertEq(reserveUSYC2, 0);
    }
    
    function testOwnership() public view {
        assertEq(swap.owner(), owner);
        assertEq(lpToken.owner(), owner);
    }
}
