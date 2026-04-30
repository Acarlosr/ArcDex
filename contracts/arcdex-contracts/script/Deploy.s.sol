// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ArcDexLP.sol";
import "../src/ArcDexSwap.sol";
import "../src/ArcDexStaking.sol";
import "../src/ArcDexPayments.sol";

/// @title Deploy Script for ArcDex Contracts
/// @notice Deploys all ArcDex contracts to Arc Testnet
contract DeployArcDex is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying ArcDex contracts...");
        console.log("Deployer:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy LP Token
        ArcDexLP lpToken = new ArcDexLP();
        console.log("ArcDexLP deployed at:", address(lpToken));
        
        // 2. Deploy Swap (AMM)
        ArcDexSwap swap = new ArcDexSwap(address(lpToken));
        console.log("ArcDexSwap deployed at:", address(swap));
        
        // 3. Set pool address in LP token
        lpToken.setPool(address(swap));
        console.log("LP Token pool set to Swap contract");
        
        // 4. Deploy Staking (treasury = deployer for testnet)
        ArcDexStaking staking = new ArcDexStaking(deployer);
        console.log("ArcDexStaking deployed at:", address(staking));
        
        // 5. Deploy Payments (fee collector = deployer for testnet)
        ArcDexPayments payments = new ArcDexPayments(deployer);
        console.log("ArcDexPayments deployed at:", address(payments));
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("ArcDexLP:       ", address(lpToken));
        console.log("ArcDexSwap:     ", address(swap));
        console.log("ArcDexStaking:  ", address(staking));
        console.log("ArcDexPayments: ", address(payments));
    }
}
