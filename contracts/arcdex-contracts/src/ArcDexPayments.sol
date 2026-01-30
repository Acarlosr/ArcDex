// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/Constants.sol";

/// @title ArcDex Payments - P2P Stablecoin Transfers
/// @notice Send USDC and EURC with minimal fees on Arc Testnet
/// @dev Supports single and batch payments with optional memos
contract ArcDexPayments is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Tokens
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    
    // Fee configuration
    uint256 public paymentFee; // Fixed fee in token decimals
    address public feeCollector;
    
    // Payment tracking
    uint256 public totalPayments;
    mapping(address => uint256) public userPaymentCount;
    
    // Events
    event PaymentSent(
        uint256 indexed paymentId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 fee,
        string memo
    );
    event BatchPaymentSent(
        uint256 indexed batchId,
        address indexed sender,
        address token,
        uint256 totalAmount,
        uint256 recipientCount
    );
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event FeesWithdrawn(address indexed token, uint256 amount);
    
    // Errors
    error InvalidToken();
    error ZeroAmount();
    error ZeroAddress();
    error ArrayLengthMismatch();
    error EmptyBatch();
    error InsufficientAmount();
    
    constructor(address _feeCollector) Ownable(msg.sender) {
        if (_feeCollector == address(0)) revert ZeroAddress();
        
        usdc = IERC20(Constants.USDC);
        eurc = IERC20(Constants.EURC);
        
        paymentFee = Constants.PAYMENT_FEE; // 0.05 tokens (6 decimals)
        feeCollector = _feeCollector;
    }
    
    /// @notice Send a payment to a recipient
    /// @param token Address of token to send (USDC or EURC)
    /// @param recipient Address of the recipient
    /// @param amount Amount to send (before fee)
    /// @param memo Optional memo for the payment
    /// @return paymentId The ID of the payment
    function sendPayment(
        address token,
        address recipient,
        uint256 amount,
        string calldata memo
    ) external virtual nonReentrant returns (uint256 paymentId) {
        if (token != address(usdc) && token != address(eurc)) revert InvalidToken();
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (amount <= paymentFee) revert InsufficientAmount();
        
        uint256 netAmount = amount - paymentFee;
        
        // Transfer tokens
        IERC20(token).safeTransferFrom(msg.sender, recipient, netAmount);
        
        // Collect fee
        if (paymentFee > 0) {
            IERC20(token).safeTransferFrom(msg.sender, feeCollector, paymentFee);
        }
        
        // Track payment
        paymentId = ++totalPayments;
        userPaymentCount[msg.sender]++;
        
        emit PaymentSent(paymentId, msg.sender, recipient, token, netAmount, paymentFee, memo);
    }
    
    /// @notice Send a payment without fee deduction (fee added on top)
    /// @param token Address of token to send
    /// @param recipient Address of the recipient
    /// @param amount Exact amount recipient will receive
    /// @param memo Optional memo for the payment
    /// @return paymentId The ID of the payment
    function sendExactPayment(
        address token,
        address recipient,
        uint256 amount,
        string calldata memo
    ) external virtual nonReentrant returns (uint256 paymentId) {
        if (token != address(usdc) && token != address(eurc)) revert InvalidToken();
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        
        // Transfer exact amount to recipient
        IERC20(token).safeTransferFrom(msg.sender, recipient, amount);
        
        // Collect fee separately
        if (paymentFee > 0) {
            IERC20(token).safeTransferFrom(msg.sender, feeCollector, paymentFee);
        }
        
        // Track payment
        paymentId = ++totalPayments;
        userPaymentCount[msg.sender]++;
        
        emit PaymentSent(paymentId, msg.sender, recipient, token, amount, paymentFee, memo);
    }
    
    /// @notice Send batch payments to multiple recipients
    /// @param token Address of token to send
    /// @param recipients Array of recipient addresses
    /// @param amounts Array of amounts (each amount is what recipient receives)
    /// @return batchId The ID of the batch
    function batchPayment(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external virtual nonReentrant returns (uint256 batchId) {
        if (token != address(usdc) && token != address(eurc)) revert InvalidToken();
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();
        if (recipients.length == 0) revert EmptyBatch();
        
        uint256 totalAmount = 0;
        uint256 totalFees = paymentFee * recipients.length;
        
        // Calculate total and send payments
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert ZeroAmount();
            
            IERC20(token).safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            totalAmount += amounts[i];
        }
        
        // Collect total fees
        if (totalFees > 0) {
            IERC20(token).safeTransferFrom(msg.sender, feeCollector, totalFees);
        }
        
        // Track batch
        batchId = ++totalPayments;
        userPaymentCount[msg.sender] += recipients.length;
        
        emit BatchPaymentSent(batchId, msg.sender, token, totalAmount, recipients.length);
    }
    
    /// @notice Get the total cost for a payment (amount + fee)
    /// @param amount The amount to send
    /// @return totalCost The total amount needed including fee
    function getPaymentCost(uint256 amount) external view returns (uint256 totalCost) {
        return amount + paymentFee;
    }
    
    /// @notice Get the total cost for a batch payment
    /// @param amounts Array of amounts
    /// @return totalCost The total amount needed including all fees
    function getBatchPaymentCost(uint256[] calldata amounts) external view returns (uint256 totalCost) {
        for (uint256 i = 0; i < amounts.length; i++) {
            totalCost += amounts[i];
        }
        totalCost += paymentFee * amounts.length;
    }
    
    // Admin functions
    
    /// @notice Update the payment fee
    /// @param _fee New fee amount in token decimals
    function setPaymentFee(uint256 _fee) external onlyOwner {
        uint256 oldFee = paymentFee;
        paymentFee = _fee;
        emit FeeUpdated(oldFee, _fee);
    }
    
    /// @notice Update the fee collector address
    /// @param _feeCollector New fee collector address
    function setFeeCollector(address _feeCollector) external onlyOwner {
        if (_feeCollector == address(0)) revert ZeroAddress();
        address oldCollector = feeCollector;
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(oldCollector, _feeCollector);
    }
}
