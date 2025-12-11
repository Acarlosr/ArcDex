// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/Constants.sol";

/// @title ArcDex Staking - Yield Vault for USDC and EURC
/// @notice Stake stablecoins to earn yield on Arc Testnet
/// @dev APR is simulated for testnet purposes
contract ArcDexStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Tokens
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    
    // Staking info per user per token
    struct StakeInfo {
        uint256 amount;
        uint256 lastClaimTime;
        uint256 pendingRewards;
    }
    
    // user => token => StakeInfo
    mapping(address => mapping(address => StakeInfo)) public stakes;
    
    // Total staked per token
    mapping(address => uint256) public totalStaked;
    
    // APR config (in basis points)
    mapping(address => uint256) public baseAPR;
    mapping(address => uint256) public boostAPR;
    
    // Protocol treasury for rewards
    address public treasury;
    
    // Events
    event Staked(address indexed user, address indexed token, uint256 amount);
    event Unstaked(address indexed user, address indexed token, uint256 amount);
    event RewardsClaimed(address indexed user, address indexed token, uint256 amount);
    event APRUpdated(address indexed token, uint256 baseAPR, uint256 boostAPR);
    event TreasuryUpdated(address indexed newTreasury);
    
    // Errors
    error InvalidToken();
    error ZeroAmount();
    error InsufficientBalance();
    error NoRewards();
    error ZeroAddress();
    
    constructor(address _treasury) Ownable(msg.sender) {
        if (_treasury == address(0)) revert ZeroAddress();
        
        usdc = IERC20(Constants.USDC);
        eurc = IERC20(Constants.EURC);
        treasury = _treasury;
        
        // Set default APRs
        baseAPR[Constants.USDC] = Constants.USDC_BASE_APR_BPS;
        boostAPR[Constants.USDC] = Constants.USDC_BOOST_APR_BPS;
        baseAPR[Constants.EURC] = Constants.EURC_BASE_APR_BPS;
        boostAPR[Constants.EURC] = Constants.EURC_BOOST_APR_BPS;
    }
    
    /// @notice Stake tokens to earn yield
    /// @param token Address of token to stake (USDC or EURC)
    /// @param amount Amount to stake
    function stake(address token, uint256 amount) external virtual nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (token != address(usdc) && token != address(eurc)) revert InvalidToken();
        
        // Claim any pending rewards first
        _claimRewards(msg.sender, token);
        
        // Transfer tokens
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update stake
        stakes[msg.sender][token].amount += amount;
        stakes[msg.sender][token].lastClaimTime = block.timestamp;
        totalStaked[token] += amount;
        
        emit Staked(msg.sender, token, amount);
    }
    
    /// @notice Unstake tokens
    /// @param token Address of token to unstake
    /// @param amount Amount to unstake
    function unstake(address token, uint256 amount) external virtual nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (token != address(usdc) && token != address(eurc)) revert InvalidToken();
        
        StakeInfo storage info = stakes[msg.sender][token];
        if (info.amount < amount) revert InsufficientBalance();
        
        // Claim any pending rewards first
        _claimRewards(msg.sender, token);
        
        // Update stake
        info.amount -= amount;
        totalStaked[token] -= amount;
        
        // Transfer tokens back
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, token, amount);
    }
    
    /// @notice Claim pending rewards for all tokens
    function claimAllRewards() external nonReentrant {
        _claimRewards(msg.sender, address(usdc));
        _claimRewards(msg.sender, address(eurc));
    }
    
    /// @notice Claim pending rewards for a specific token
    /// @param token Address of token to claim rewards for
    function claimRewards(address token) external virtual nonReentrant {
        if (token != address(usdc) && token != address(eurc)) revert InvalidToken();
        _claimRewards(msg.sender, token);
    }
    
    /// @notice Internal function to claim rewards
    function _claimRewards(address user, address token) internal {
        StakeInfo storage info = stakes[user][token];
        
        if (info.amount == 0 && info.pendingRewards == 0) return;
        
        // Calculate new rewards
        uint256 newRewards = _calculateRewards(user, token);
        uint256 totalRewards = info.pendingRewards + newRewards;
        
        if (totalRewards > 0) {
            info.pendingRewards = 0;
            info.lastClaimTime = block.timestamp;
            
            // Transfer rewards from treasury
            IERC20(token).safeTransferFrom(treasury, user, totalRewards);
            
            emit RewardsClaimed(user, token, totalRewards);
        }
    }
    
    /// @notice Calculate pending rewards for a user
    /// @param user Address of the user
    /// @param token Address of the staked token
    /// @return rewards The calculated pending rewards
    function _calculateRewards(address user, address token) internal view returns (uint256 rewards) {
        StakeInfo storage info = stakes[user][token];
        
        if (info.amount == 0 || info.lastClaimTime == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - info.lastClaimTime;
        uint256 totalAPR = baseAPR[token] + boostAPR[token];
        
        // rewards = (staked * APR * timeElapsed) / (365 days * 10000)
        rewards = (info.amount * totalAPR * timeElapsed) / (365 days * Constants.BPS_DENOMINATOR);
    }
    
    /// @notice Get pending rewards for a user
    /// @param user Address of the user
    /// @param token Address of the staked token
    /// @return The total pending rewards
    function getPendingRewards(address user, address token) external view virtual returns (uint256) {
        return stakes[user][token].pendingRewards + _calculateRewards(user, token);
    }
    
    /// @notice Get staked balance for a user
    /// @param user Address of the user
    /// @param token Address of the staked token
    /// @return The staked balance
    function getStakedBalance(address user, address token) external view returns (uint256) {
        return stakes[user][token].amount;
    }
    
    /// @notice Get APR for a token
    /// @param token Address of the token
    /// @return base Base APR in basis points
    /// @return boost Boost APR in basis points
    /// @return total Total APR in basis points
    function getAPR(address token) external view returns (uint256 base, uint256 boost, uint256 total) {
        base = baseAPR[token];
        boost = boostAPR[token];
        total = base + boost;
    }
    
    // Admin functions
    
    /// @notice Update APR for a token
    /// @param token Address of the token
    /// @param _baseAPR New base APR in basis points
    /// @param _boostAPR New boost APR in basis points
    function setAPR(address token, uint256 _baseAPR, uint256 _boostAPR) external onlyOwner {
        if (token != address(usdc) && token != address(eurc)) revert InvalidToken();
        baseAPR[token] = _baseAPR;
        boostAPR[token] = _boostAPR;
        emit APRUpdated(token, _baseAPR, _boostAPR);
    }
    
    /// @notice Update treasury address
    /// @param _treasury New treasury address
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
}
