// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Tipos compartilhados da mensageria CCIP do ArcDex
/// @notice O payload e versionado para permitir evolucao sem decodificacao ambigua.
library ArcDexCCIPTypes {
    uint8 internal constant PAYLOAD_VERSION = 1;

    enum Action {
        Register,
        Confirm,
        Cancel
    }

    enum OperationState {
        None,
        Registered,
        Confirmed,
        Cancelled
    }

    struct SettlementPayload {
        uint8 version;
        bytes32 operationId;
        Action action;
        address account;
        uint256 amount;
        bytes32 assetId;
        uint64 validUntil;
    }
}
