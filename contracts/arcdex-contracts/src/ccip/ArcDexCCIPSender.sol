// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ArcDexCCIPTypes} from "./ArcDexCCIPTypes.sol";

/// @title ArcDex CCIP Sender
/// @notice Envia mensagens de settlement da Ethereum Sepolia para a Arc Testnet.
/// @dev Paga a taxa em ETH nativo e nao envia tokens pela lane CCIP.
contract ArcDexCCIPSender is Ownable2Step, Pausable, ReentrancyGuard {
    uint64 public constant ARC_TESTNET_SELECTOR = 3_034_092_155_422_581_607;
    uint256 public constant MIN_GAS_LIMIT = 150_000;
    uint256 public constant MAX_GAS_LIMIT = 1_000_000;

    IRouterClient public immutable router;
    address public destinationReceiver;
    uint256 public destinationGasLimit = 350_000;
    mapping(bytes32 operationId => ArcDexCCIPTypes.OperationState state) public operationStates;

    error ZeroAddress();
    error OwnershipRenounceDisabled();
    error ReceiverNotConfigured();
    error DestinationNotSupported();
    error InvalidGasLimit(uint256 gasLimit);
    error InvalidPayloadVersion(uint8 received);
    error InvalidPayload();
    error PayloadExpired(uint64 validUntil);
    error InvalidStateTransition(ArcDexCCIPTypes.OperationState current, ArcDexCCIPTypes.Action requested);
    error InsufficientFee(uint256 required, uint256 provided);
    error RefundFailed();
    error NativeTransferFailed();

    event DestinationReceiverUpdated(address indexed previousReceiver, address indexed newReceiver);
    event DestinationGasLimitUpdated(uint256 previousGasLimit, uint256 newGasLimit);
    event SettlementSent(
        bytes32 indexed messageId, bytes32 indexed operationId, ArcDexCCIPTypes.Action action, uint256 feePaid
    );

    constructor(address routerAddress, address initialOwner, address initialDestinationReceiver) Ownable(initialOwner) {
        if (routerAddress == address(0) || initialOwner == address(0)) revert ZeroAddress();
        router = IRouterClient(routerAddress);
        destinationReceiver = initialDestinationReceiver;

        if (initialDestinationReceiver == address(0)) _pause();
    }

    function setDestinationReceiver(address newReceiver) external onlyOwner whenPaused {
        if (newReceiver == address(0)) revert ZeroAddress();
        address previousReceiver = destinationReceiver;
        destinationReceiver = newReceiver;
        emit DestinationReceiverUpdated(previousReceiver, newReceiver);
    }

    function setDestinationGasLimit(uint256 newGasLimit) external onlyOwner whenPaused {
        if (newGasLimit < MIN_GAS_LIMIT || newGasLimit > MAX_GAS_LIMIT) {
            revert InvalidGasLimit(newGasLimit);
        }
        uint256 previousGasLimit = destinationGasLimit;
        destinationGasLimit = newGasLimit;
        emit DestinationGasLimitUpdated(previousGasLimit, newGasLimit);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        if (destinationReceiver == address(0)) revert ReceiverNotConfigured();
        _unpause();
    }

    function renounceOwnership() public pure override {
        revert OwnershipRenounceDisabled();
    }

    function quoteFee(ArcDexCCIPTypes.SettlementPayload calldata payload) external view returns (uint256) {
        return router.getFee(ARC_TESTNET_SELECTOR, _buildMessage(payload));
    }

    /// @notice Envia uma transicao de settlement. Restrito ao owner operacional/multisig.
    function sendSettlement(ArcDexCCIPTypes.SettlementPayload calldata payload)
        external
        payable
        onlyOwner
        whenNotPaused
        nonReentrant
        returns (bytes32 messageId)
    {
        _validatePayload(payload);
        _validateStateTransition(payload);
        if (!router.isChainSupported(ARC_TESTNET_SELECTOR)) revert DestinationNotSupported();

        Client.EVM2AnyMessage memory message = _buildMessage(payload);
        uint256 fee = router.getFee(ARC_TESTNET_SELECTOR, message);
        if (msg.value < fee) revert InsufficientFee(fee, msg.value);

        messageId = router.ccipSend{value: fee}(ARC_TESTNET_SELECTOR, message);
        operationStates[payload.operationId] = _nextState(payload.action);

        uint256 refund = msg.value - fee;
        if (refund != 0) {
            (bool refunded,) = payable(msg.sender).call{value: refund}("");
            if (!refunded) revert RefundFailed();
        }

        emit SettlementSent(messageId, payload.operationId, payload.action, fee);
    }

    /// @notice Recupera apenas ETH enviado diretamente ao contrato; taxas CCIP usam valor exato.
    function withdrawNative(address payable recipient, uint256 amount) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert ZeroAddress();
        (bool success,) = recipient.call{value: amount}("");
        if (!success) revert NativeTransferFailed();
    }

    receive() external payable {}

    function _buildMessage(ArcDexCCIPTypes.SettlementPayload calldata payload)
        private
        view
        returns (Client.EVM2AnyMessage memory)
    {
        if (destinationReceiver == address(0)) revert ReceiverNotConfigured();

        Client.EVMTokenAmount[] memory noTokens = new Client.EVMTokenAmount[](0);
        return Client.EVM2AnyMessage({
            receiver: abi.encode(destinationReceiver),
            data: abi.encode(payload),
            tokenAmounts: noTokens,
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({gasLimit: destinationGasLimit, allowOutOfOrderExecution: true})
            )
        });
    }

    function _validatePayload(ArcDexCCIPTypes.SettlementPayload calldata payload) private view {
        if (payload.version != ArcDexCCIPTypes.PAYLOAD_VERSION) {
            revert InvalidPayloadVersion(payload.version);
        }
        if (
            payload.operationId == bytes32(0) || payload.account == address(0) || payload.amount == 0
                || payload.assetId == bytes32(0) || payload.validUntil == 0
        ) revert InvalidPayload();
        if (payload.validUntil < block.timestamp) revert PayloadExpired(payload.validUntil);
    }

    function _validateStateTransition(ArcDexCCIPTypes.SettlementPayload calldata payload) private view {
        ArcDexCCIPTypes.OperationState current = operationStates[payload.operationId];
        if (payload.action == ArcDexCCIPTypes.Action.Register) {
            if (current != ArcDexCCIPTypes.OperationState.None) {
                revert InvalidStateTransition(current, payload.action);
            }
        } else if (current != ArcDexCCIPTypes.OperationState.Registered) {
            revert InvalidStateTransition(current, payload.action);
        }
    }

    function _nextState(ArcDexCCIPTypes.Action action) private pure returns (ArcDexCCIPTypes.OperationState) {
        if (action == ArcDexCCIPTypes.Action.Register) return ArcDexCCIPTypes.OperationState.Registered;
        if (action == ArcDexCCIPTypes.Action.Confirm) return ArcDexCCIPTypes.OperationState.Confirmed;
        return ArcDexCCIPTypes.OperationState.Cancelled;
    }
}
