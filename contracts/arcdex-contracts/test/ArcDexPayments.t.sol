// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "./ArcDexSwap.t.sol"; // Reuse MockERC20
import "../src/ArcDexPayments.sol";
import "../src/libraries/Constants.sol";

/// @title Tests for ArcDexPayments
contract ArcDexPaymentsTest is Test {
    ArcDexPaymentsTestable public payments;
    MockERC20 public usdc;
    MockERC20 public eurc;
    
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");
    address public feeCollector = makeAddr("feeCollector");
    
    function setUp() public {
        // Deploy mock tokens
        usdc = new MockERC20("USDC", "USDC", 6);
        eurc = new MockERC20("EURC", "EURC", 6);
        
        // Deploy payments
        payments = new ArcDexPaymentsTestable(feeCollector, address(usdc), address(eurc));
        
        // Mint tokens
        usdc.mint(alice, 100_000 * 1e6);
        eurc.mint(alice, 100_000 * 1e6);
        
        // Approve
        vm.prank(alice);
        usdc.approve(address(payments), type(uint256).max);
        vm.prank(alice);
        eurc.approve(address(payments), type(uint256).max);
    }
    
    function test_SendPayment() public {
        vm.startPrank(alice);
        
        uint256 amount = 100 * 1e6; // 100 USDC
        uint256 fee = payments.paymentFee();
        uint256 netAmount = amount - fee;
        
        uint256 bobBalanceBefore = usdc.balanceOf(bob);
        uint256 feeCollectorBalanceBefore = usdc.balanceOf(feeCollector);
        
        payments.sendPayment(address(usdc), bob, amount, "Test payment");
        
        assertEq(usdc.balanceOf(bob), bobBalanceBefore + netAmount, "Bob balance mismatch");
        assertEq(usdc.balanceOf(feeCollector), feeCollectorBalanceBefore + fee, "Fee collector balance mismatch");
        
        vm.stopPrank();
    }
    
    function test_SendExactPayment() public {
        vm.startPrank(alice);
        
        uint256 amount = 100 * 1e6; // Exact 100 USDC
        uint256 fee = payments.paymentFee();
        
        uint256 bobBalanceBefore = usdc.balanceOf(bob);
        
        payments.sendExactPayment(address(usdc), bob, amount, "Exact payment");
        
        assertEq(usdc.balanceOf(bob), bobBalanceBefore + amount, "Bob should receive exact amount");
        assertEq(usdc.balanceOf(feeCollector), fee, "Fee collector should receive fee");
        
        vm.stopPrank();
    }
    
    function test_BatchPayment() public {
        vm.startPrank(alice);
        
        address[] memory recipients = new address[](3);
        recipients[0] = bob;
        recipients[1] = charlie;
        recipients[2] = makeAddr("dave");
        
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 100 * 1e6;
        amounts[1] = 200 * 1e6;
        amounts[2] = 50 * 1e6;
        
        uint256 totalFees = payments.paymentFee() * 3;
        
        payments.batchPayment(address(usdc), recipients, amounts);
        
        assertEq(usdc.balanceOf(bob), 100 * 1e6, "Bob balance mismatch");
        assertEq(usdc.balanceOf(charlie), 200 * 1e6, "Charlie balance mismatch");
        assertEq(usdc.balanceOf(feeCollector), totalFees, "Fees mismatch");
        
        vm.stopPrank();
    }
    
    function test_GetPaymentCost() public {
        uint256 amount = 100 * 1e6;
        uint256 cost = payments.getPaymentCost(amount);
        assertEq(cost, amount + payments.paymentFee(), "Cost calculation mismatch");
    }
    
    function test_RevertWhen_AmountTooLow() public {
        vm.startPrank(alice);
        
        uint256 fee = payments.paymentFee();
        
        vm.expectRevert(ArcDexPayments.InsufficientAmount.selector);
        payments.sendPayment(address(usdc), bob, fee, "Too low");
        
        vm.stopPrank();
    }
    
    function test_RevertWhen_ZeroRecipient() public {
        vm.startPrank(alice);
        
        vm.expectRevert(ArcDexPayments.ZeroAddress.selector);
        payments.sendPayment(address(usdc), address(0), 100 * 1e6, "");
        
        vm.stopPrank();
    }
    
    function test_PaymentCounting() public {
        vm.startPrank(alice);
        
        payments.sendPayment(address(usdc), bob, 100 * 1e6, "");
        payments.sendPayment(address(usdc), charlie, 100 * 1e6, "");
        
        assertEq(payments.totalPayments(), 2, "Total payments mismatch");
        assertEq(payments.userPaymentCount(alice), 2, "User payment count mismatch");
        
        vm.stopPrank();
    }
}

/// @dev Testable version with custom token addresses
contract ArcDexPaymentsTestable is ArcDexPayments {
    IERC20 internal _usdc;
    IERC20 internal _eurc;
    
    constructor(address _feeCollector, address usdcAddr, address eurcAddr) ArcDexPayments(_feeCollector) {
        _usdc = IERC20(usdcAddr);
        _eurc = IERC20(eurcAddr);
    }
    
    function sendPayment(
        address token,
        address recipient,
        uint256 amount,
        string calldata memo
    ) external override nonReentrant returns (uint256 paymentId) {
        if (token != address(_usdc) && token != address(_eurc)) revert InvalidToken();
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (amount <= paymentFee) revert InsufficientAmount();
        
        uint256 netAmount = amount - paymentFee;
        
        IERC20(token).transferFrom(msg.sender, recipient, netAmount);
        
        if (paymentFee > 0) {
            IERC20(token).transferFrom(msg.sender, feeCollector, paymentFee);
        }
        
        paymentId = ++totalPayments;
        userPaymentCount[msg.sender]++;
        
        emit PaymentSent(paymentId, msg.sender, recipient, token, netAmount, paymentFee, memo);
    }
    
    function sendExactPayment(
        address token,
        address recipient,
        uint256 amount,
        string calldata memo
    ) external override nonReentrant returns (uint256 paymentId) {
        if (token != address(_usdc) && token != address(_eurc)) revert InvalidToken();
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        
        IERC20(token).transferFrom(msg.sender, recipient, amount);
        
        if (paymentFee > 0) {
            IERC20(token).transferFrom(msg.sender, feeCollector, paymentFee);
        }
        
        paymentId = ++totalPayments;
        userPaymentCount[msg.sender]++;
        
        emit PaymentSent(paymentId, msg.sender, recipient, token, amount, paymentFee, memo);
    }
    
    function batchPayment(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external override nonReentrant returns (uint256 batchId) {
        if (token != address(_usdc) && token != address(_eurc)) revert InvalidToken();
        if (recipients.length != amounts.length) revert ArrayLengthMismatch();
        if (recipients.length == 0) revert EmptyBatch();
        
        uint256 totalAmount = 0;
        uint256 totalFees = paymentFee * recipients.length;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert ZeroAmount();
            
            IERC20(token).transferFrom(msg.sender, recipients[i], amounts[i]);
            totalAmount += amounts[i];
        }
        
        if (totalFees > 0) {
            IERC20(token).transferFrom(msg.sender, feeCollector, totalFees);
        }
        
        batchId = ++totalPayments;
        userPaymentCount[msg.sender] += recipients.length;
        
        emit BatchPaymentSent(batchId, msg.sender, token, totalAmount, recipients.length);
    }
}
