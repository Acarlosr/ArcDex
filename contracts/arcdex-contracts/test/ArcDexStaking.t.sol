// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "./ArcDexSwap.t.sol"; // Reuse MockERC20
import "../src/ArcDexStaking.sol";
import "../src/libraries/Constants.sol";

/// @title Tests for ArcDexStaking
contract ArcDexStakingTest is Test {
    ArcDexStakingTestable public staking;
    MockERC20 public usdc;
    MockERC20 public eurc;
    
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public treasury = makeAddr("treasury");
    
    function setUp() public {
        // Deploy mock tokens
        usdc = new MockERC20("USDC", "USDC", 6);
        eurc = new MockERC20("EURC", "EURC", 6);
        
        // Deploy staking with test tokens
        staking = new ArcDexStakingTestable(treasury, address(usdc), address(eurc));
        
        // Mint tokens to users
        usdc.mint(alice, 100_000 * 1e6);
        eurc.mint(alice, 100_000 * 1e6);
        usdc.mint(bob, 100_000 * 1e6);
        
        // Mint tokens to treasury for rewards
        usdc.mint(treasury, 1_000_000 * 1e6);
        eurc.mint(treasury, 1_000_000 * 1e6);
        
        // Treasury approves staking contract
        vm.prank(treasury);
        usdc.approve(address(staking), type(uint256).max);
        vm.prank(treasury);
        eurc.approve(address(staking), type(uint256).max);
        
        // Users approve staking contract
        vm.prank(alice);
        usdc.approve(address(staking), type(uint256).max);
        vm.prank(alice);
        eurc.approve(address(staking), type(uint256).max);
        vm.prank(bob);
        usdc.approve(address(staking), type(uint256).max);
    }
    
    function test_Stake() public {
        vm.startPrank(alice);
        
        uint256 amount = 10_000 * 1e6;
        staking.stake(address(usdc), amount);
        
        assertEq(staking.getStakedBalance(alice, address(usdc)), amount, "Staked balance mismatch");
        assertEq(staking.totalStaked(address(usdc)), amount, "Total staked mismatch");
        
        vm.stopPrank();
    }
    
    function test_Unstake() public {
        vm.startPrank(alice);
        
        uint256 amount = 10_000 * 1e6;
        staking.stake(address(usdc), amount);
        
        uint256 balanceBefore = usdc.balanceOf(alice);
        staking.unstake(address(usdc), amount / 2);
        
        assertEq(staking.getStakedBalance(alice, address(usdc)), amount / 2, "Staked balance mismatch");
        assertEq(usdc.balanceOf(alice), balanceBefore + amount / 2, "Token balance mismatch");
        
        vm.stopPrank();
    }
    
    function test_RewardsAccumulate() public {
        vm.startPrank(alice);
        
        uint256 amount = 10_000 * 1e6;
        staking.stake(address(usdc), amount);
        
        // Fast forward 365 days
        vm.warp(block.timestamp + 365 days);
        
        uint256 pendingRewards = staking.getPendingRewards(alice, address(usdc));
        
        // Expected: 10% APR (8% base + 2% boost) = 1000 USDC
        uint256 expectedRewards = (amount * 1000) / 10000; // 10% of 10000 = 1000
        assertApproxEqAbs(pendingRewards, expectedRewards, 1e6, "Rewards calculation mismatch");
        
        vm.stopPrank();
    }
    
    function test_ClaimRewards() public {
        vm.startPrank(alice);
        
        uint256 amount = 10_000 * 1e6;
        staking.stake(address(usdc), amount);
        
        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);
        
        uint256 balanceBefore = usdc.balanceOf(alice);
        uint256 pendingRewards = staking.getPendingRewards(alice, address(usdc));
        
        staking.claimRewards(address(usdc));
        
        assertEq(usdc.balanceOf(alice), balanceBefore + pendingRewards, "Rewards not received");
        assertEq(staking.getPendingRewards(alice, address(usdc)), 0, "Pending rewards should be 0");
        
        vm.stopPrank();
    }
    
    function test_GetAPR() public {
        (uint256 base, uint256 boost, uint256 total) = staking.getAPR(address(usdc));
        
        assertEq(base, Constants.USDC_BASE_APR_BPS, "Base APR mismatch");
        assertEq(boost, Constants.USDC_BOOST_APR_BPS, "Boost APR mismatch");
        assertEq(total, base + boost, "Total APR mismatch");
    }
    
    function test_RevertWhen_UnstakeMoreThanStaked() public {
        vm.startPrank(alice);
        
        staking.stake(address(usdc), 1000 * 1e6);
        
        vm.expectRevert(ArcDexStaking.InsufficientBalance.selector);
        staking.unstake(address(usdc), 2000 * 1e6);
        
        vm.stopPrank();
    }
}

/// @dev Testable version with custom token addresses
contract ArcDexStakingTestable is ArcDexStaking {
    IERC20 internal _usdc;
    IERC20 internal _eurc;
    
    constructor(address _treasury, address usdcAddr, address eurcAddr) ArcDexStaking(_treasury) {
        _usdc = IERC20(usdcAddr);
        _eurc = IERC20(eurcAddr);
        
        // Reset APRs for test tokens
        baseAPR[usdcAddr] = Constants.USDC_BASE_APR_BPS;
        boostAPR[usdcAddr] = Constants.USDC_BOOST_APR_BPS;
        baseAPR[eurcAddr] = Constants.EURC_BASE_APR_BPS;
        boostAPR[eurcAddr] = Constants.EURC_BOOST_APR_BPS;
    }
    
    function stake(address token, uint256 amount) external override nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (token != address(_usdc) && token != address(_eurc)) revert InvalidToken();
        
        _claimRewardsInternal(msg.sender, token);
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        stakes[msg.sender][token].amount += amount;
        stakes[msg.sender][token].lastClaimTime = block.timestamp;
        totalStaked[token] += amount;
        
        emit Staked(msg.sender, token, amount);
    }
    
    function unstake(address token, uint256 amount) external override nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (token != address(_usdc) && token != address(_eurc)) revert InvalidToken();
        
        StakeInfo storage info = stakes[msg.sender][token];
        if (info.amount < amount) revert InsufficientBalance();
        
        _claimRewardsInternal(msg.sender, token);
        
        info.amount -= amount;
        totalStaked[token] -= amount;
        
        IERC20(token).transfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, token, amount);
    }
    
    function claimRewards(address token) external override nonReentrant {
        if (token != address(_usdc) && token != address(_eurc)) revert InvalidToken();
        _claimRewardsInternal(msg.sender, token);
    }
    
    function _claimRewardsInternal(address user, address token) internal {
        StakeInfo storage info = stakes[user][token];
        
        if (info.amount == 0 && info.pendingRewards == 0) return;
        
        uint256 newRewards = _calculateRewardsInternal(user, token);
        uint256 totalRewards = info.pendingRewards + newRewards;
        
        if (totalRewards > 0) {
            info.pendingRewards = 0;
            info.lastClaimTime = block.timestamp;
            
            IERC20(token).transferFrom(treasury, user, totalRewards);
            
            emit RewardsClaimed(user, token, totalRewards);
        }
    }
    
    function _calculateRewardsInternal(address user, address token) internal view returns (uint256 rewards) {
        StakeInfo storage info = stakes[user][token];
        
        if (info.amount == 0 || info.lastClaimTime == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - info.lastClaimTime;
        uint256 totalAPR = baseAPR[token] + boostAPR[token];
        
        rewards = (info.amount * totalAPR * timeElapsed) / (365 days * Constants.BPS_DENOMINATOR);
    }
    
    function getPendingRewards(address user, address token) external view override returns (uint256) {
        return stakes[user][token].pendingRewards + _calculateRewardsInternal(user, token);
    }
}
