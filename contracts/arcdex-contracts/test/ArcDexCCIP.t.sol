// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {IAny2EVMMessageReceiver} from "@chainlink/contracts-ccip/contracts/interfaces/IAny2EVMMessageReceiver.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {ArcDexCCIPReceiver} from "../src/ccip/ArcDexCCIPReceiver.sol";
import {ArcDexCCIPSender} from "../src/ccip/ArcDexCCIPSender.sol";
import {ArcDexCCIPTypes} from "../src/ccip/ArcDexCCIPTypes.sol";

contract MockArcDexCCIPRouter is IRouterClient {
    uint64 private constant ETHEREUM_SEPOLIA_SELECTOR = 16_015_286_601_757_825_753;
    uint256 public fee;
    bool public supported = true;
    uint256 private nonce;

    function setFee(uint256 newFee) external {
        fee = newFee;
    }

    function setSupported(bool newSupported) external {
        supported = newSupported;
    }

    function isChainSupported(uint64) external view returns (bool) {
        return supported;
    }

    function getFee(uint64, Client.EVM2AnyMessage memory) external view returns (uint256) {
        return fee;
    }

    function ccipSend(uint64, Client.EVM2AnyMessage calldata message) external payable returns (bytes32 messageId) {
        if (msg.value < fee) revert InsufficientFeeTokenAmount();

        address receiver = abi.decode(message.receiver, (address));
        messageId = keccak256(abi.encode(++nonce, msg.sender, receiver, message.data));

        Client.Any2EVMMessage memory inbound = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: ETHEREUM_SEPOLIA_SELECTOR,
            sender: abi.encode(msg.sender),
            data: message.data,
            destTokenAmounts: message.tokenAmounts
        });

        IAny2EVMMessageReceiver(receiver).ccipReceive(inbound);
    }
}

contract ArcDexCCIPTest is Test {
    uint64 private constant ETHEREUM_SEPOLIA_SELECTOR = 16_015_286_601_757_825_753;
    MockArcDexCCIPRouter private mockRouter;
    ArcDexCCIPReceiver private receiver;
    ArcDexCCIPSender private sender;

    address private user = makeAddr("user");
    bytes32 private constant ASSET_ID = keccak256("USDC");

    function setUp() public {
        mockRouter = new MockArcDexCCIPRouter();

        // O receiver nasce pausado porque o endereco do sender ainda nao existe.
        receiver = new ArcDexCCIPReceiver(address(mockRouter), address(this), address(0));
        sender = new ArcDexCCIPSender(address(mockRouter), address(this), address(receiver));

        receiver.setAuthorizedSender(address(sender));
        receiver.unpause();
        vm.deal(address(this), 10 ether);
    }

    function test_RegisterAndConfirmSettlement() public {
        ArcDexCCIPTypes.SettlementPayload memory payload = _payload(ArcDexCCIPTypes.Action.Register);
        bytes32 registerMessageId = sender.sendSettlement(payload);

        (
            ArcDexCCIPTypes.OperationState registeredState,
            address account,
            uint256 amount,
            bytes32 assetId,,
            bytes32 lastMessageId
        ) = receiver.operations(payload.operationId);

        assertEq(uint8(registeredState), uint8(ArcDexCCIPTypes.OperationState.Registered));
        assertEq(account, user);
        assertEq(amount, 1_000e6);
        assertEq(assetId, ASSET_ID);
        assertEq(lastMessageId, registerMessageId);
        assertTrue(receiver.processedMessages(registerMessageId));

        payload.action = ArcDexCCIPTypes.Action.Confirm;
        sender.sendSettlement(payload);

        (ArcDexCCIPTypes.OperationState confirmedState,,,,,) = receiver.operations(payload.operationId);
        assertEq(uint8(confirmedState), uint8(ArcDexCCIPTypes.OperationState.Confirmed));
    }

    function test_RevertWhenRemoteSenderIsNotAuthorized() public {
        address attacker = makeAddr("attacker");
        Client.Any2EVMMessage memory inbound = _inboundMessage(bytes32("message-1"), attacker, false);

        vm.prank(address(mockRouter));
        vm.expectRevert(abi.encodeWithSelector(ArcDexCCIPReceiver.InvalidSender.selector, attacker));
        receiver.ccipReceive(inbound);
    }

    function test_RevertWhenSourceChainIsNotAuthorized() public {
        Client.Any2EVMMessage memory inbound = _inboundMessage(bytes32("wrong-chain"), address(sender), false);
        inbound.sourceChainSelector = 123;

        vm.prank(address(mockRouter));
        vm.expectRevert(abi.encodeWithSelector(ArcDexCCIPReceiver.InvalidSourceChain.selector, uint64(123)));
        receiver.ccipReceive(inbound);
    }

    function test_RevertWhenCallerIsNotTheRouter() public {
        Client.Any2EVMMessage memory inbound = _inboundMessage(bytes32("direct-call"), address(sender), false);

        vm.expectRevert(abi.encodeWithSelector(CCIPReceiver.InvalidRouter.selector, address(this)));
        receiver.ccipReceive(inbound);
    }

    function test_RevertOnReplay() public {
        Client.Any2EVMMessage memory inbound = _inboundMessage(bytes32("message-2"), address(sender), false);

        vm.prank(address(mockRouter));
        receiver.ccipReceive(inbound);

        vm.prank(address(mockRouter));
        vm.expectRevert(
            abi.encodeWithSelector(ArcDexCCIPReceiver.MessageAlreadyProcessed.selector, bytes32("message-2"))
        );
        receiver.ccipReceive(inbound);
    }

    function test_RevertWhenMessageContainsTokens() public {
        Client.Any2EVMMessage memory inbound = _inboundMessage(bytes32("message-3"), address(sender), true);

        vm.prank(address(mockRouter));
        vm.expectRevert(ArcDexCCIPReceiver.TokenTransferNotSupported.selector);
        receiver.ccipReceive(inbound);
    }

    function test_RevertWhenFeeIsInsufficient() public {
        mockRouter.setFee(0.02 ether);

        vm.expectRevert(abi.encodeWithSelector(ArcDexCCIPSender.InsufficientFee.selector, 0.02 ether, 0.01 ether));
        sender.sendSettlement{value: 0.01 ether}(_payload(ArcDexCCIPTypes.Action.Register));
    }

    function test_RefundsFeeOverpayment() public {
        mockRouter.setFee(0.02 ether);
        uint256 balanceBefore = address(this).balance;

        sender.sendSettlement{value: 0.08 ether}(_payload(ArcDexCCIPTypes.Action.Register));

        assertEq(address(this).balance, balanceBefore - 0.02 ether);
        assertEq(address(sender).balance, 0);
    }

    function test_RevertOnInvalidStateTransition() public {
        ArcDexCCIPTypes.SettlementPayload memory payload = _payload(ArcDexCCIPTypes.Action.Confirm);

        vm.expectRevert(
            abi.encodeWithSelector(
                ArcDexCCIPSender.InvalidStateTransition.selector,
                ArcDexCCIPTypes.OperationState.None,
                ArcDexCCIPTypes.Action.Confirm
            )
        );
        sender.sendSettlement(payload);
    }

    function test_ReceiverStartsPausedWithoutAuthorizedSender() public {
        ArcDexCCIPReceiver unconfigured = new ArcDexCCIPReceiver(address(mockRouter), address(this), address(0));
        assertTrue(unconfigured.paused());
    }

    function _payload(ArcDexCCIPTypes.Action action) private view returns (ArcDexCCIPTypes.SettlementPayload memory) {
        return ArcDexCCIPTypes.SettlementPayload({
            version: 1,
            operationId: keccak256("arcdex-operation-1"),
            action: action,
            account: user,
            amount: 1_000e6,
            assetId: ASSET_ID,
            validUntil: uint64(block.timestamp + 1 days)
        });
    }

    function _inboundMessage(bytes32 messageId, address remoteSender, bool withToken)
        private
        view
        returns (Client.Any2EVMMessage memory)
    {
        Client.EVMTokenAmount[] memory tokens = new Client.EVMTokenAmount[](withToken ? 1 : 0);
        if (withToken) tokens[0] = Client.EVMTokenAmount({token: address(0x1234), amount: 1});

        return Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: ETHEREUM_SEPOLIA_SELECTOR,
            sender: abi.encode(remoteSender),
            data: abi.encode(_payload(ArcDexCCIPTypes.Action.Register)),
            destTokenAmounts: tokens
        });
    }

    receive() external payable {}
}
