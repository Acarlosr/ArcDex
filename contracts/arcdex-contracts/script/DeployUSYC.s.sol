// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ArcDexSwapUSYC.sol";
import "../src/ArcDexLPUSYC.sol";

/// @title Deploy ArcDex USYC Pools
/// @notice Deploys LP token and Swap contract for USYC pools
contract DeployUSYC is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy LP Token
        ArcDexLPUSYC lpToken = new ArcDexLPUSYC();
        console.log("ArcDexLPUSYC deployed at:", address(lpToken));
        
        // 2. Deploy Swap Contract
        ArcDexSwapUSYC swap = new ArcDexSwapUSYC(address(lpToken));
        console.log("ArcDexSwapUSYC deployed at:", address(swap));
        
        // 3. Set swap contract in LP token
        lpToken.setSwapContract(address(swap));
        console.log("Swap contract set in LP token");
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Add these to your .env:");
        console.log("NEXT_PUBLIC_ARCDEX_LP_USYC=", address(lpToken));
        console.log("NEXT_PUBLIC_ARCDEX_SWAP_USYC=", address(swap));
    }
}
