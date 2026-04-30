// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ArcDexLP.sol";
import "../src/ArcDexSwap.sol";
import "../src/libraries/Constants.sol";

/// @title Tests for ArcDexSwap
contract ArcDexSwapTest is Test {
    ArcDexLP public lpToken;
    ArcDexSwap public swap;
    
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    
    // Mock tokens for testing
    MockERC20 public usdc;
    MockERC20 public eurc;
    
    function setUp() public {
        // Deploy mock tokens
        usdc = new MockERC20("USDC", "USDC", 6);
        eurc = new MockERC20("EURC", "EURC", 6);
        
        // Deploy contracts
        lpToken = new ArcDexLP();
        
        // We need to deploy a modified swap for testing with mock tokens
        swap = new ArcDexSwapTestable(address(lpToken), address(usdc), address(eurc));
        
        // Set pool
        lpToken.setPool(address(swap));
        
        // Mint tokens to users
        usdc.mint(alice, 100_000 * 1e6);
        eurc.mint(alice, 100_000 * 1e6);
        usdc.mint(bob, 100_000 * 1e6);
        eurc.mint(bob, 100_000 * 1e6);
        
        // Approve swap contract
        vm.startPrank(alice);
        usdc.approve(address(swap), type(uint256).max);
        eurc.approve(address(swap), type(uint256).max);
        vm.stopPrank();
        
        vm.startPrank(bob);
        usdc.approve(address(swap), type(uint256).max);
        eurc.approve(address(swap), type(uint256).max);
        vm.stopPrank();
    }
    
    function test_AddLiquidity() public {
        vm.startPrank(alice);
        
        uint256 lpTokens = swap.addLiquidity(10_000 * 1e6, 9_200 * 1e6);
        
        assertGt(lpTokens, 0, "Should receive LP tokens");
        assertEq(lpToken.balanceOf(alice), lpTokens, "LP balance mismatch");
        
        (uint256 reserveUSDC, uint256 reserveEURC) = swap.getReserves();
        assertEq(reserveUSDC, 10_000 * 1e6, "USDC reserve mismatch");
        assertEq(reserveEURC, 9_200 * 1e6, "EURC reserve mismatch");
        
        vm.stopPrank();
    }
    
    function test_Swap_USDCtoEURC() public {
        // Add initial liquidity
        vm.prank(alice);
        swap.addLiquidity(10_000 * 1e6, 9_200 * 1e6);
        
        // Bob swaps USDC for EURC
        vm.startPrank(bob);
        
        uint256 bobEURCBefore = eurc.balanceOf(bob);
        uint256 amountIn = 1_000 * 1e6;
        uint256 expectedOut = swap.getAmountOut(address(usdc), amountIn);
        
        uint256 amountOut = swap.swap(address(usdc), amountIn, expectedOut);
        
        assertEq(amountOut, expectedOut, "Output mismatch");
        assertEq(eurc.balanceOf(bob), bobEURCBefore + amountOut, "EURC balance mismatch");
        
        vm.stopPrank();
    }
    
    function test_Swap_EURCtoUSDC() public {
        // Add initial liquidity
        vm.prank(alice);
        swap.addLiquidity(10_000 * 1e6, 9_200 * 1e6);
        
        // Bob swaps EURC for USDC
        vm.startPrank(bob);
        
        uint256 bobUSDCBefore = usdc.balanceOf(bob);
        uint256 amountIn = 920 * 1e6;
        uint256 expectedOut = swap.getAmountOut(address(eurc), amountIn);
        
        uint256 amountOut = swap.swap(address(eurc), amountIn, expectedOut);
        
        assertEq(amountOut, expectedOut, "Output mismatch");
        assertEq(usdc.balanceOf(bob), bobUSDCBefore + amountOut, "USDC balance mismatch");
        
        vm.stopPrank();
    }
    
    function test_RemoveLiquidity() public {
        // Add liquidity
        vm.startPrank(alice);
        uint256 lpTokens = swap.addLiquidity(10_000 * 1e6, 9_200 * 1e6);
        
        uint256 aliceUSDCBefore = usdc.balanceOf(alice);
        uint256 aliceEURCBefore = eurc.balanceOf(alice);
        
        // Remove half liquidity
        (uint256 amountUSDC, uint256 amountEURC) = swap.removeLiquidity(lpTokens / 2);
        
        assertGt(amountUSDC, 0, "Should receive USDC");
        assertGt(amountEURC, 0, "Should receive EURC");
        assertEq(usdc.balanceOf(alice), aliceUSDCBefore + amountUSDC, "USDC balance mismatch");
        assertEq(eurc.balanceOf(alice), aliceEURCBefore + amountEURC, "EURC balance mismatch");
        
        vm.stopPrank();
    }
    
    function test_RevertWhen_SlippageExceeded() public {
        // Add liquidity
        vm.prank(alice);
        swap.addLiquidity(10_000 * 1e6, 9_200 * 1e6);
        
        // Try to swap with unrealistic minAmountOut
        vm.startPrank(bob);
        
        uint256 amountIn = 1_000 * 1e6;
        uint256 expectedOut = swap.getAmountOut(address(usdc), amountIn);
        
        vm.expectRevert(ArcDexSwap.InsufficientOutputAmount.selector);
        swap.swap(address(usdc), amountIn, expectedOut + 1);
        
        vm.stopPrank();
    }
    
    function test_GetPrice() public {
        vm.prank(alice);
        swap.addLiquidity(10_000 * 1e6, 9_200 * 1e6);
        
        uint256 price = swap.getPrice();
        // Price should be approximately 0.92 (920000 with 6 decimals)
        assertApproxEqAbs(price, 920_000, 1000, "Price should be ~0.92");
    }
}

/// @dev Testable version of ArcDexSwap that accepts custom token addresses
contract ArcDexSwapTestable is ArcDexSwap {
    IERC20 internal _usdc;
    IERC20 internal _eurc;
    
    constructor(address _lpToken, address usdcAddr, address eurcAddr) ArcDexSwap(_lpToken) {
        _usdc = IERC20(usdcAddr);
        _eurc = IERC20(eurcAddr);
    }
    
    // Override to use test tokens
    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external override nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        
        bool isUSDCIn = tokenIn == address(_usdc);
        bool isEURCIn = tokenIn == address(_eurc);
        if (!isUSDCIn && !isEURCIn) revert InvalidToken();
        
        amountOut = getAmountOut(tokenIn, amountIn);
        if (amountOut < minAmountOut) revert InsufficientOutputAmount();
        
        if (isUSDCIn) {
            if (amountOut > reserveEURC) revert InsufficientLiquidity();
            _usdc.transferFrom(msg.sender, address(this), amountIn);
            _eurc.transfer(msg.sender, amountOut);
            reserveUSDC += amountIn;
            reserveEURC -= amountOut;
        } else {
            if (amountOut > reserveUSDC) revert InsufficientLiquidity();
            _eurc.transferFrom(msg.sender, address(this), amountIn);
            _usdc.transfer(msg.sender, amountOut);
            reserveEURC += amountIn;
            reserveUSDC -= amountOut;
        }
    }
    
    function getAmountOut(address tokenIn, uint256 amountIn) public view override returns (uint256 amountOut) {
        if (amountIn == 0) return 0;
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (tokenIn == address(_usdc)) {
            reserveIn = reserveUSDC;
            reserveOut = reserveEURC;
        } else if (tokenIn == address(_eurc)) {
            reserveIn = reserveEURC;
            reserveOut = reserveUSDC;
        } else {
            revert InvalidToken();
        }
        
        if (reserveIn == 0 || reserveOut == 0) return 0;
        
        uint256 amountInWithFee = amountIn * (Constants.BPS_DENOMINATOR - Constants.SWAP_FEE_BPS);
        amountOut = (reserveOut * amountInWithFee) / (reserveIn * Constants.BPS_DENOMINATOR + amountInWithFee);
    }
    
    function addLiquidity(
        uint256 amountUSDC,
        uint256 amountEURC
    ) external override nonReentrant returns (uint256 lpTokens) {
        if (amountUSDC == 0 || amountEURC == 0) revert ZeroAmount();
        
        uint256 totalSupply = lpToken.totalSupply();
        
        if (totalSupply == 0) {
            lpTokens = sqrt(amountUSDC * amountEURC) - MINIMUM_LIQUIDITY;
            lpToken.mint(address(0xdead), MINIMUM_LIQUIDITY);
        } else {
            uint256 lpFromUSDC = (amountUSDC * totalSupply) / reserveUSDC;
            uint256 lpFromEURC = (amountEURC * totalSupply) / reserveEURC;
            lpTokens = lpFromUSDC < lpFromEURC ? lpFromUSDC : lpFromEURC;
        }
        
        if (lpTokens == 0) revert InsufficientLiquidity();
        
        _usdc.transferFrom(msg.sender, address(this), amountUSDC);
        _eurc.transferFrom(msg.sender, address(this), amountEURC);
        
        reserveUSDC += amountUSDC;
        reserveEURC += amountEURC;
        
        lpToken.mint(msg.sender, lpTokens);
    }
    
    function removeLiquidity(
        uint256 lpTokenAmount
    ) external override nonReentrant returns (uint256 amountUSDC, uint256 amountEURC) {
        if (lpTokenAmount == 0) revert ZeroAmount();
        if (lpToken.balanceOf(msg.sender) < lpTokenAmount) revert InsufficientLPTokens();
        
        uint256 totalSupply = lpToken.totalSupply();
        
        amountUSDC = (lpTokenAmount * reserveUSDC) / totalSupply;
        amountEURC = (lpTokenAmount * reserveEURC) / totalSupply;
        
        if (amountUSDC == 0 || amountEURC == 0) revert InsufficientLiquidity();
        
        lpToken.burn(msg.sender, lpTokenAmount);
        
        reserveUSDC -= amountUSDC;
        reserveEURC -= amountEURC;
        
        _usdc.transfer(msg.sender, amountUSDC);
        _eurc.transfer(msg.sender, amountEURC);
    }
}

/// @dev Simple mock ERC20 for testing
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
