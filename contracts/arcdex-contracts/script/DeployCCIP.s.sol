// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ArcDexCCIPReceiver} from "../src/ccip/ArcDexCCIPReceiver.sol";
import {ArcDexCCIPSender} from "../src/ccip/ArcDexCCIPSender.sol";

/// @notice Passo 1 (Arc Testnet): deploy do receiver inicialmente pausado.
contract DeployArcDexCCIPReceiver is Script {
    address private constant ARC_CCIP_ROUTER = 0xdE4E7FED43FAC37EB21aA0643d9852f75332eab8;

    function run() external returns (ArcDexCCIPReceiver receiver) {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("CCIP_OWNER");

        vm.startBroadcast(privateKey);
        receiver = new ArcDexCCIPReceiver(ARC_CCIP_ROUTER, owner, address(0));
        vm.stopBroadcast();

        console.log("ArcDexCCIPReceiver (pausado):", address(receiver));
    }
}

/// @notice Passo 2 (Ethereum Sepolia): deploy do sender apontando para o receiver da Arc.
contract DeployArcDexCCIPSender is Script {
    address private constant ETHEREUM_SEPOLIA_CCIP_ROUTER = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;

    function run() external returns (ArcDexCCIPSender sender) {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("CCIP_OWNER");
        address receiver = vm.envAddress("ARC_CCIP_RECEIVER");

        vm.startBroadcast(privateKey);
        sender = new ArcDexCCIPSender(ETHEREUM_SEPOLIA_CCIP_ROUTER, owner, receiver);
        vm.stopBroadcast();

        console.log("ArcDexCCIPSender:", address(sender));
    }
}

/// @notice Passo 3 (Arc Testnet): autoriza o sender remoto e ativa o receiver.
contract ConfigureArcDexCCIPReceiver is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        ArcDexCCIPReceiver receiver = ArcDexCCIPReceiver(vm.envAddress("ARC_CCIP_RECEIVER"));
        address sender = vm.envAddress("ETHEREUM_CCIP_SENDER");

        vm.startBroadcast(privateKey);
        receiver.setAuthorizedSender(sender);
        receiver.unpause();
        vm.stopBroadcast();

        console.log("Receiver autorizado e ativo para sender:", sender);
    }
}
