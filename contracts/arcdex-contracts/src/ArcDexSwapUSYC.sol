// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ArcDexLPUSYC.sol";
import "./libraries/Constants.sol";

/// @title ArcDex Swap USYC - AMM for USDC/USYC and EURC/USYC
/// @notice Constant Product AMM (x * y = k) for swapping stablecoins with USYC
/// @dev Supports two pools: USDC/USYC and EURC/USYC
contract ArcDexSwapUSYC is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Tokens
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    IERC20 public immutable usyc;
    ArcDexLPUSYC public immutable lpToken;
    
    // Pool reserves - USDC/USYC pool
    uint256 public reserveUSDC;
    uint256 public reserveUSYC_USDC; // USYC reserve for USDC pool
    
    // Pool reserves - EURC/USYC pool
    uint256 public reserveEURC;
    uint256 public reserveUSYC_EURC; // USYC reserve for EURC pool
    
    // Pool identifiers
    enum Pool { USDC_USYC, EURC_USYC }
    
    // Minimum liquidity to prevent division by zero
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    
    // Track LP tokens per pool
    mapping(Pool => uint256) public poolLPSupply;
    mapping(address => mapping(Pool => uint256)) public userPoolLP;
    
    // Events
    event Swap(
        address indexed user,
        Pool indexed pool,
        address indexed tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event LiquidityAdded(
        address indexed provider,
        Pool indexed pool,
        uint256 amountToken,
        uint256 amountUSYC,
        uint256 lpTokensMinted
    );
    event LiquidityRemoved(
        address indexed provider,
        Pool indexed pool,
        uint256 amountToken,
        uint256 amountUSYC,
        uint256 lpTokensBurned
    );
    
    // Errors
    error InvalidToken();
    error InvalidPool();
    error InsufficientOutputAmount();
    error InsufficientLiquidity();
    error InsufficientLPTokens();
    error ZeroAmount();
    
    constructor(address _lpToken) Ownable(msg.sender) {
        usdc = IERC20(Constants.USDC);
        eurc = IERC20(Constants.EURC);
        usyc = IERC20(Constants.USYC);
        lpToken = ArcDexLPUSYC(_lpToken);
    }
    
    /// @notice Swap USDC for USYC or vice versa
    function swapUSDC_USYC(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        
        bool isUSDCIn = tokenIn == address(usdc);
        bool isUSYCIn = tokenIn == address(usyc);
        if (!isUSDCIn && !isUSYCIn) revert InvalidToken();
        
        amountOut = getAmountOutUSDC_USYC(tokenIn, amountIn);
        if (amountOut < minAmountOut) revert InsufficientOutputAmount();
        
        if (isUSDCIn) {
            if (amountOut > reserveUSYC_USDC) revert InsufficientLiquidity();
            usdc.safeTransferFrom(msg.sender, address(this), amountIn);
            usyc.safeTransfer(msg.sender, amountOut);
            reserveUSDC += amountIn;
            reserveUSYC_USDC -= amountOut;
            emit Swap(msg.sender, Pool.USDC_USYC, address(usdc), address(usyc), amountIn, amountOut);
        } else {
            if (amountOut > reserveUSDC) revert InsufficientLiquidity();
            usyc.safeTransferFrom(msg.sender, address(this), amountIn);
            usdc.safeTransfer(msg.sender, amountOut);
            reserveUSYC_USDC += amountIn;
            reserveUSDC -= amountOut;
            emit Swap(msg.sender, Pool.USDC_USYC, address(usyc), address(usdc), amountIn, amountOut);
        }
    }
    
    /// @notice Swap EURC for USYC or vice versa
    function swapEURC_USYC(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        
        bool isEURCIn = tokenIn == address(eurc);
        bool isUSYCIn = tokenIn == address(usyc);
        if (!isEURCIn && !isUSYCIn) revert InvalidToken();
        
        amountOut = getAmountOutEURC_USYC(tokenIn, amountIn);
        if (amountOut < minAmountOut) revert InsufficientOutputAmount();
        
        if (isEURCIn) {
            if (amountOut > reserveUSYC_EURC) revert InsufficientLiquidity();
            eurc.safeTransferFrom(msg.sender, address(this), amountIn);
            usyc.safeTransfer(msg.sender, amountOut);
            reserveEURC += amountIn;
            reserveUSYC_EURC -= amountOut;
            emit Swap(msg.sender, Pool.EURC_USYC, address(eurc), address(usyc), amountIn, amountOut);
        } else {
            if (amountOut > reserveEURC) revert InsufficientLiquidity();
            usyc.safeTransferFrom(msg.sender, address(this), amountIn);
            eurc.safeTransfer(msg.sender, amountOut);
            reserveUSYC_EURC += amountIn;
            reserveEURC -= amountOut;
            emit Swap(msg.sender, Pool.EURC_USYC, address(usyc), address(eurc), amountIn, amountOut);
        }
    }
    
    /// @notice Calculate output for USDC/USYC swap
    function getAmountOutUSDC_USYC(address tokenIn, uint256 amountIn) public view returns (uint256 amountOut) {
        if (amountIn == 0) return 0;
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (tokenIn == address(usdc)) {
            reserveIn = reserveUSDC;
            reserveOut = reserveUSYC_USDC;
        } else if (tokenIn == address(usyc)) {
            reserveIn = reserveUSYC_USDC;
            reserveOut = reserveUSDC;
        } else {
            revert InvalidToken();
        }
        
        if (reserveIn == 0 || reserveOut == 0) return 0;
        
        uint256 amountInWithFee = amountIn * (Constants.BPS_DENOMINATOR - Constants.SWAP_FEE_BPS);
        amountOut = (reserveOut * amountInWithFee) / (reserveIn * Constants.BPS_DENOMINATOR + amountInWithFee);
    }
    
    /// @notice Calculate output for EURC/USYC swap
    function getAmountOutEURC_USYC(address tokenIn, uint256 amountIn) public view returns (uint256 amountOut) {
        if (amountIn == 0) return 0;
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (tokenIn == address(eurc)) {
            reserveIn = reserveEURC;
            reserveOut = reserveUSYC_EURC;
        } else if (tokenIn == address(usyc)) {
            reserveIn = reserveUSYC_EURC;
            reserveOut = reserveEURC;
        } else {
            revert InvalidToken();
        }
        
        if (reserveIn == 0 || reserveOut == 0) return 0;
        
        uint256 amountInWithFee = amountIn * (Constants.BPS_DENOMINATOR - Constants.SWAP_FEE_BPS);
        amountOut = (reserveOut * amountInWithFee) / (reserveIn * Constants.BPS_DENOMINATOR + amountInWithFee);
    }
    
    /// @notice Add liquidity to USDC/USYC pool
    function addLiquidityUSDC(
        uint256 amountUSDC,
        uint256 amountUSYC
    ) external nonReentrant returns (uint256 lpTokens) {
        if (amountUSDC == 0 || amountUSYC == 0) revert ZeroAmount();
        
        uint256 poolSupply = poolLPSupply[Pool.USDC_USYC];
        
        if (poolSupply == 0) {
            lpTokens = sqrt(amountUSDC * amountUSYC) - MINIMUM_LIQUIDITY;
            lpToken.mint(address(0xdead), MINIMUM_LIQUIDITY);
            poolLPSupply[Pool.USDC_USYC] = MINIMUM_LIQUIDITY;
        } else {
            uint256 lpFromUSDC = (amountUSDC * poolSupply) / reserveUSDC;
            uint256 lpFromUSYC = (amountUSYC * poolSupply) / reserveUSYC_USDC;
            lpTokens = lpFromUSDC < lpFromUSYC ? lpFromUSDC : lpFromUSYC;
        }
        
        if (lpTokens == 0) revert InsufficientLiquidity();
        
        usdc.safeTransferFrom(msg.sender, address(this), amountUSDC);
        usyc.safeTransferFrom(msg.sender, address(this), amountUSYC);
        
        reserveUSDC += amountUSDC;
        reserveUSYC_USDC += amountUSYC;
        poolLPSupply[Pool.USDC_USYC] += lpTokens;
        userPoolLP[msg.sender][Pool.USDC_USYC] += lpTokens;
        
        lpToken.mint(msg.sender, lpTokens);
        
        emit LiquidityAdded(msg.sender, Pool.USDC_USYC, amountUSDC, amountUSYC, lpTokens);
    }
    
    /// @notice Add liquidity to EURC/USYC pool
    function addLiquidityEURC(
        uint256 amountEURC,
        uint256 amountUSYC
    ) external nonReentrant returns (uint256 lpTokens) {
        if (amountEURC == 0 || amountUSYC == 0) revert ZeroAmount();
        
        uint256 poolSupply = poolLPSupply[Pool.EURC_USYC];
        
        if (poolSupply == 0) {
            lpTokens = sqrt(amountEURC * amountUSYC) - MINIMUM_LIQUIDITY;
            lpToken.mint(address(0xdead), MINIMUM_LIQUIDITY);
            poolLPSupply[Pool.EURC_USYC] = MINIMUM_LIQUIDITY;
        } else {
            uint256 lpFromEURC = (amountEURC * poolSupply) / reserveEURC;
            uint256 lpFromUSYC = (amountUSYC * poolSupply) / reserveUSYC_EURC;
            lpTokens = lpFromEURC < lpFromUSYC ? lpFromEURC : lpFromUSYC;
        }
        
        if (lpTokens == 0) revert InsufficientLiquidity();
        
        eurc.safeTransferFrom(msg.sender, address(this), amountEURC);
        usyc.safeTransferFrom(msg.sender, address(this), amountUSYC);
        
        reserveEURC += amountEURC;
        reserveUSYC_EURC += amountUSYC;
        poolLPSupply[Pool.EURC_USYC] += lpTokens;
        userPoolLP[msg.sender][Pool.EURC_USYC] += lpTokens;
        
        lpToken.mint(msg.sender, lpTokens);
        
        emit LiquidityAdded(msg.sender, Pool.EURC_USYC, amountEURC, amountUSYC, lpTokens);
    }
    
    /// @notice Remove liquidity from USDC/USYC pool
    function removeLiquidityUSDC(
        uint256 lpTokenAmount
    ) external nonReentrant returns (uint256 amountUSDC, uint256 amountUSYC) {
        if (lpTokenAmount == 0) revert ZeroAmount();
        if (userPoolLP[msg.sender][Pool.USDC_USYC] < lpTokenAmount) revert InsufficientLPTokens();
        
        uint256 poolSupply = poolLPSupply[Pool.USDC_USYC];
        
        amountUSDC = (lpTokenAmount * reserveUSDC) / poolSupply;
        amountUSYC = (lpTokenAmount * reserveUSYC_USDC) / poolSupply;
        
        if (amountUSDC == 0 || amountUSYC == 0) revert InsufficientLiquidity();
        
        lpToken.burn(msg.sender, lpTokenAmount);
        
        reserveUSDC -= amountUSDC;
        reserveUSYC_USDC -= amountUSYC;
        poolLPSupply[Pool.USDC_USYC] -= lpTokenAmount;
        userPoolLP[msg.sender][Pool.USDC_USYC] -= lpTokenAmount;
        
        usdc.safeTransfer(msg.sender, amountUSDC);
        usyc.safeTransfer(msg.sender, amountUSYC);
        
        emit LiquidityRemoved(msg.sender, Pool.USDC_USYC, amountUSDC, amountUSYC, lpTokenAmount);
    }
    
    /// @notice Remove liquidity from EURC/USYC pool
    function removeLiquidityEURC(
        uint256 lpTokenAmount
    ) external nonReentrant returns (uint256 amountEURC, uint256 amountUSYC) {
        if (lpTokenAmount == 0) revert ZeroAmount();
        if (userPoolLP[msg.sender][Pool.EURC_USYC] < lpTokenAmount) revert InsufficientLPTokens();
        
        uint256 poolSupply = poolLPSupply[Pool.EURC_USYC];
        
        amountEURC = (lpTokenAmount * reserveEURC) / poolSupply;
        amountUSYC = (lpTokenAmount * reserveUSYC_EURC) / poolSupply;
        
        if (amountEURC == 0 || amountUSYC == 0) revert InsufficientLiquidity();
        
        lpToken.burn(msg.sender, lpTokenAmount);
        
        reserveEURC -= amountEURC;
        reserveUSYC_EURC -= amountUSYC;
        poolLPSupply[Pool.EURC_USYC] -= lpTokenAmount;
        userPoolLP[msg.sender][Pool.EURC_USYC] -= lpTokenAmount;
        
        eurc.safeTransfer(msg.sender, amountEURC);
        usyc.safeTransfer(msg.sender, amountUSYC);
        
        emit LiquidityRemoved(msg.sender, Pool.EURC_USYC, amountEURC, amountUSYC, lpTokenAmount);
    }
    
    /// @notice Get reserves for USDC/USYC pool
    function getReservesUSDC_USYC() external view returns (uint256 _reserveUSDC, uint256 _reserveUSYC) {
        return (reserveUSDC, reserveUSYC_USDC);
    }
    
    /// @notice Get reserves for EURC/USYC pool
    function getReservesEURC_USYC() external view returns (uint256 _reserveEURC, uint256 _reserveUSYC) {
        return (reserveEURC, reserveUSYC_EURC);
    }
    
    /// @notice Get price of USDC in USYC
    function getPriceUSDC_USYC() external view returns (uint256 price) {
        if (reserveUSDC == 0) return 0;
        return (reserveUSYC_USDC * 1e6) / reserveUSDC;
    }
    
    /// @notice Get price of EURC in USYC
    function getPriceEURC_USYC() external view returns (uint256 price) {
        if (reserveEURC == 0) return 0;
        return (reserveUSYC_EURC * 1e6) / reserveEURC;
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
