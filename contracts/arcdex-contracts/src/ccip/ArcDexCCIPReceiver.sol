// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ArcDexCCIPTypes} from "./ArcDexCCIPTypes.sol";

/// @title ArcDex CCIP Receiver
/// @notice Recebe somente mensagens de settlement da Ethereum Sepolia para a Arc Testnet.
/// @dev Este contrato nao recebe tokens e nunca executa calldata arbitrario.
contract ArcDexCCIPReceiver is CCIPReceiver, Ownable2Step, Pausable {
    uint64 public constant ETHEREUM_SEPOLIA_SELECTOR = 16_015_286_601_757_825_753;

    struct Operation {
        ArcDexCCIPTypes.OperationState state;
        address account;
        uint256 amount;
        bytes32 assetId;
        uint64 validUntil;
        bytes32 lastMessageId;
    }

    address public authorizedSender;
    mapping(bytes32 messageId => bool processed) public processedMessages;
    mapping(bytes32 operationId => Operation operation) public operations;

    error ZeroAddress();
    error OwnershipRenounceDisabled();
    error InvalidSourceChain(uint64 received);
    error InvalidSender(address received);
    error InvalidSenderEncoding();
    error MessageAlreadyProcessed(bytes32 messageId);
    error TokenTransferNotSupported();
    error InvalidPayloadVersion(uint8 received);
    error InvalidPayload();
    error PayloadExpired(uint64 validUntil);
    error InvalidStateTransition(ArcDexCCIPTypes.OperationState current, ArcDexCCIPTypes.Action requested);
    error OperationDataMismatch(bytes32 operationId);
    error SenderNotConfigured();

    event AuthorizedSenderUpdated(address indexed previousSender, address indexed newSender);
    event SettlementReceived(
        bytes32 indexed messageId,
        bytes32 indexed operationId,
        ArcDexCCIPTypes.Action action,
        address indexed account,
        uint256 amount,
        bytes32 assetId
    );

    constructor(address router, address initialOwner, address initialAuthorizedSender)
        CCIPReceiver(router)
        Ownable(initialOwner)
    {
        if (initialOwner == address(0)) revert ZeroAddress();

        authorizedSender = initialAuthorizedSender;
        if (initialAuthorizedSender == address(0)) {
            // Deploy seguro: permanece pausado ate o sender remoto ser configurado.
            _pause();
        }
    }

    /// @notice Troca o sender remoto apenas durante uma janela de manutencao pausada.
    function setAuthorizedSender(address newSender) external onlyOwner whenPaused {
        if (newSender == address(0)) revert ZeroAddress();
        address previousSender = authorizedSender;
        authorizedSender = newSender;
        emit AuthorizedSenderUpdated(previousSender, newSender);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        if (authorizedSender == address(0)) revert SenderNotConfigured();
        _unpause();
    }

    /// @dev Evita que o contrato fique sem governanca e sem capacidade de resposta a incidentes.
    function renounceOwnership() public pure override {
        revert OwnershipRenounceDisabled();
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) internal override whenNotPaused {
        if (message.sourceChainSelector != ETHEREUM_SEPOLIA_SELECTOR) {
            revert InvalidSourceChain(message.sourceChainSelector);
        }
        if (message.sender.length != 32) revert InvalidSenderEncoding();

        address remoteSender = abi.decode(message.sender, (address));
        if (remoteSender != authorizedSender) revert InvalidSender(remoteSender);
        if (processedMessages[message.messageId]) revert MessageAlreadyProcessed(message.messageId);
        if (message.destTokenAmounts.length != 0) revert TokenTransferNotSupported();

        ArcDexCCIPTypes.SettlementPayload memory payload = abi.decode(message.data, (ArcDexCCIPTypes.SettlementPayload));

        _validatePayload(payload);
        _applyStateTransition(payload, message.messageId);

        // Marcado somente depois de todas as validacoes; qualquer revert desfaz a operacao inteira.
        processedMessages[message.messageId] = true;

        emit SettlementReceived(
            message.messageId, payload.operationId, payload.action, payload.account, payload.amount, payload.assetId
        );
    }

    function _validatePayload(ArcDexCCIPTypes.SettlementPayload memory payload) private view {
        if (payload.version != ArcDexCCIPTypes.PAYLOAD_VERSION) {
            revert InvalidPayloadVersion(payload.version);
        }
        if (
            payload.operationId == bytes32(0) || payload.account == address(0) || payload.amount == 0
                || payload.assetId == bytes32(0) || payload.validUntil == 0
        ) revert InvalidPayload();
        if (payload.validUntil < block.timestamp) revert PayloadExpired(payload.validUntil);
    }

    function _applyStateTransition(ArcDexCCIPTypes.SettlementPayload memory payload, bytes32 messageId) private {
        Operation storage operation = operations[payload.operationId];

        if (payload.action == ArcDexCCIPTypes.Action.Register) {
            if (operation.state != ArcDexCCIPTypes.OperationState.None) {
                revert InvalidStateTransition(operation.state, payload.action);
            }
            operation.state = ArcDexCCIPTypes.OperationState.Registered;
            operation.account = payload.account;
            operation.amount = payload.amount;
            operation.assetId = payload.assetId;
            operation.validUntil = payload.validUntil;
        } else {
            if (operation.state != ArcDexCCIPTypes.OperationState.Registered) {
                revert InvalidStateTransition(operation.state, payload.action);
            }
            if (
                operation.account != payload.account || operation.amount != payload.amount
                    || operation.assetId != payload.assetId || operation.validUntil != payload.validUntil
            ) revert OperationDataMismatch(payload.operationId);

            operation.state = payload.action == ArcDexCCIPTypes.Action.Confirm
                ? ArcDexCCIPTypes.OperationState.Confirmed
                : ArcDexCCIPTypes.OperationState.Cancelled;
        }

        operation.lastMessageId = messageId;
    }
}
