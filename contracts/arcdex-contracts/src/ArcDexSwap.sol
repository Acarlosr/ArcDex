// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ArcDexLP.sol";
import "./libraries/Constants.sol";

/// @title ArcDex Swap - AMM for USDC/EURC
/// @notice Constant Product AMM (x * y = k) for swapping USDC and EURC
/// @dev Implements standard AMM mechanics with 0.3% swap fee
contract ArcDexSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Tokens
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    ArcDexLP public immutable lpToken;
    
    // Pool reserves
    uint256 public reserveUSDC;
    uint256 public reserveEURC;
    
    // Minimum liquidity to prevent division by zero
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    
    // Events
    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event LiquidityAdded(
        address indexed provider,
        uint256 amountUSDC,
        uint256 amountEURC,
        uint256 lpTokensMinted
    );
    event LiquidityRemoved(
        address indexed provider,
        uint256 amountUSDC,
        uint256 amountEURC,
        uint256 lpTokensBurned
    );
    event FeesCollected(address indexed collector, uint256 amountUSDC, uint256 amountEURC);
    
    // Errors
    error InvalidToken();
    error InsufficientOutputAmount();
    error InsufficientLiquidity();
    error InsufficientLPTokens();
    error ZeroAmount();
    error InvalidRatio();
    
    constructor(address _lpToken) Ownable(msg.sender) {
        usdc = IERC20(Constants.USDC);
        eurc = IERC20(Constants.EURC);
        lpToken = ArcDexLP(_lpToken);
    }
    
    /// @notice Swap tokens
    /// @param tokenIn Address of input token (USDC or EURC)
    /// @param amountIn Amount of input tokens
    /// @param minAmountOut Minimum acceptable output amount (slippage protection)
    /// @return amountOut The amount of output tokens received
    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external virtual nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        
        bool isUSDCIn = tokenIn == address(usdc);
        bool isEURCIn = tokenIn == address(eurc);
        if (!isUSDCIn && !isEURCIn) revert InvalidToken();
        
        // Get output amount
        amountOut = getAmountOut(tokenIn, amountIn);
        if (amountOut < minAmountOut) revert InsufficientOutputAmount();
        
        // Transfer tokens
        if (isUSDCIn) {
            if (amountOut > reserveEURC) revert InsufficientLiquidity();
            usdc.safeTransferFrom(msg.sender, address(this), amountIn);
            eurc.safeTransfer(msg.sender, amountOut);
            reserveUSDC += amountIn;
            reserveEURC -= amountOut;
            emit Swap(msg.sender, address(usdc), address(eurc), amountIn, amountOut);
        } else {
            if (amountOut > reserveUSDC) revert InsufficientLiquidity();
            eurc.safeTransferFrom(msg.sender, address(this), amountIn);
            usdc.safeTransfer(msg.sender, amountOut);
            reserveEURC += amountIn;
            reserveUSDC -= amountOut;
            emit Swap(msg.sender, address(eurc), address(usdc), amountIn, amountOut);
        }
    }
    
    /// @notice Calculate output amount for a given input
    /// @param tokenIn Address of input token
    /// @param amountIn Amount of input tokens
    /// @return amountOut The calculated output amount after fees
    function getAmountOut(address tokenIn, uint256 amountIn) public view virtual returns (uint256 amountOut) {
        if (amountIn == 0) return 0;
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (tokenIn == address(usdc)) {
            reserveIn = reserveUSDC;
            reserveOut = reserveEURC;
        } else if (tokenIn == address(eurc)) {
            reserveIn = reserveEURC;
            reserveOut = reserveUSDC;
        } else {
            revert InvalidToken();
        }
        
        if (reserveIn == 0 || reserveOut == 0) return 0;
        
        // Apply 0.3% fee: amountInWithFee = amountIn * 997 / 1000
        uint256 amountInWithFee = amountIn * (Constants.BPS_DENOMINATOR - Constants.SWAP_FEE_BPS);
        
        // Constant product formula: x * y = k
        // amountOut = (reserveOut * amountInWithFee) / (reserveIn * 10000 + amountInWithFee)
        amountOut = (reserveOut * amountInWithFee) / (reserveIn * Constants.BPS_DENOMINATOR + amountInWithFee);
    }
    
    /// @notice Add liquidity to the pool
    /// @param amountUSDC Amount of USDC to add
    /// @param amountEURC Amount of EURC to add
    /// @return lpTokens Amount of LP tokens minted
    function addLiquidity(
        uint256 amountUSDC,
        uint256 amountEURC
    ) external virtual nonReentrant returns (uint256 lpTokens) {
        if (amountUSDC == 0 || amountEURC == 0) revert ZeroAmount();
        
        uint256 totalSupply = lpToken.totalSupply();
        
        if (totalSupply == 0) {
            // Initial liquidity
            lpTokens = sqrt(amountUSDC * amountEURC) - MINIMUM_LIQUIDITY;
            // Mint minimum liquidity to dead address to prevent manipulation
            lpToken.mint(address(0xdead), MINIMUM_LIQUIDITY);
        } else {
            // Subsequent liquidity must be proportional
            uint256 lpFromUSDC = (amountUSDC * totalSupply) / reserveUSDC;
            uint256 lpFromEURC = (amountEURC * totalSupply) / reserveEURC;
            lpTokens = lpFromUSDC < lpFromEURC ? lpFromUSDC : lpFromEURC;
        }
        
        if (lpTokens == 0) revert InsufficientLiquidity();
        
        // Transfer tokens
        usdc.safeTransferFrom(msg.sender, address(this), amountUSDC);
        eurc.safeTransferFrom(msg.sender, address(this), amountEURC);
        
        // Update reserves
        reserveUSDC += amountUSDC;
        reserveEURC += amountEURC;
        
        // Mint LP tokens
        lpToken.mint(msg.sender, lpTokens);
        
        emit LiquidityAdded(msg.sender, amountUSDC, amountEURC, lpTokens);
    }
    
    /// @notice Remove liquidity from the pool
    /// @param lpTokenAmount Amount of LP tokens to burn
    /// @return amountUSDC Amount of USDC returned
    /// @return amountEURC Amount of EURC returned
    function removeLiquidity(
        uint256 lpTokenAmount
    ) external virtual nonReentrant returns (uint256 amountUSDC, uint256 amountEURC) {
        if (lpTokenAmount == 0) revert ZeroAmount();
        if (lpToken.balanceOf(msg.sender) < lpTokenAmount) revert InsufficientLPTokens();
        
        uint256 totalSupply = lpToken.totalSupply();
        
        // Calculate proportional amounts
        amountUSDC = (lpTokenAmount * reserveUSDC) / totalSupply;
        amountEURC = (lpTokenAmount * reserveEURC) / totalSupply;
        
        if (amountUSDC == 0 || amountEURC == 0) revert InsufficientLiquidity();
        
        // Burn LP tokens
        lpToken.burn(msg.sender, lpTokenAmount);
        
        // Update reserves
        reserveUSDC -= amountUSDC;
        reserveEURC -= amountEURC;
        
        // Transfer tokens back
        usdc.safeTransfer(msg.sender, amountUSDC);
        eurc.safeTransfer(msg.sender, amountEURC);
        
        emit LiquidityRemoved(msg.sender, amountUSDC, amountEURC, lpTokenAmount);
    }
    
    /// @notice Get current pool reserves
    /// @return _reserveUSDC Current USDC reserve
    /// @return _reserveEURC Current EURC reserve
    function getReserves() external view returns (uint256 _reserveUSDC, uint256 _reserveEURC) {
        return (reserveUSDC, reserveEURC);
    }
    
    /// @notice Get the current price of USDC in terms of EURC
    /// @return price Price with 6 decimals precision
    function getPrice() external view returns (uint256 price) {
        if (reserveUSDC == 0) return 0;
        return (reserveEURC * 1e6) / reserveUSDC;
    }
    
    /// @dev Babylonian square root
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
