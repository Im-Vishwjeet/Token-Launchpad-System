# Token Launchpad System

A decentralized token launchpad system built on Ethereum and compatible chains, enabling users to create and launch new tokens with automated liquidity provision using concentrated liquidity market makers (CLMM).

## Overview

The Token Launchpad System is a comprehensive smart contract framework that allows users to:

- **Create tokens** using CREATE2 for deterministic addresses
- **Launch tokens** with automatic liquidity provision on CLMM pools
- **Trade tokens** immediately after launch
- **Manage fees** with configurable distribution
- **Integrate with DEX aggregators** (e.g., ODOS) for seamless swaps

The system uses an adapter pattern to support multiple CLMM protocols (currently Ramses on Linea) and can be extended to support additional DEXs.

## Features

### Core Functionality

- **Token Creation**: Deploy ERC20 tokens with deterministic addresses using CREATE2
- **Automatic Liquidity**: Automatically adds concentrated liquidity across multiple tick ranges
- **NFT Ownership**: Each launched token is represented as an NFT, granting ownership and fee claims
- **Fee Distribution**: Configurable fee distribution to referral system, treasury, and token owners
- **Safe Approvals**: Implements safe approval patterns to prevent unbounded approval vulnerabilities
- **Upgradeable Contracts**: Uses OpenZeppelin's upgradeable pattern for main contracts

### Advanced Features

- **CLMM Integration**: Supports concentrated liquidity market makers with multiple tick ranges
- **Graduation System**: Tokens launch with predefined liquidity amounts and can "graduate" when certain price levels are reached
- **DEX Aggregator Support**: UIHelper contract enables integration with aggregators like ODOS for multi-hop swaps
- **Multi-Chain Ready**: Designed to support multiple chains with chain-specific implementations

## Architecture

### Contract Structure

```
contracts/
├── launchpad/
│   ├── TokenLaunchpad.sol          # Base launchpad contract (abstract)
│   ├── TokenLaunchpadLinea.sol     # Linea-specific implementation
│   └── clmm/
│       ├── adapters/
│       │   ├── BaseV3Adapter.sol   # Base adapter for CLMM protocols
│       │   └── RamsesAdapter.sol   # Ramses-specific adapter implementation
│       └── UIHelper.sol            # Helper contract for UI/DEX aggregator integration
├── SomeToken.sol                   # ERC20 token implementation for launched tokens
├── SomeMasterToken.sol             # Funding token (SOME)
├── SomeProxy.sol                   # Custom proxy implementation
├── SomeTimelock.sol                # Timelock controller for governance
├── interfaces/                     # Contract interfaces
└── utils/
    └── SafeApproval.sol            # Safe approval utility library
```

### Key Components

#### TokenLaunchpad
The main launchpad contract that:
- Manages token creation and launches
- Mints NFTs for each launched token
- Handles fee claims and distribution
- Manages launch tick parameters

#### CLMM Adapters
Adapter pattern implementation for CLMM protocols:
- **BaseV3Adapter**: Abstract base class with common functionality
- **RamsesAdapter**: Concrete implementation for Ramses DEX on Linea

Adapters handle:
- Pool creation
- Single-sided liquidity provision
- Fee collection
- Token swaps

#### UIHelper
Helper contract that enables:
- Integration with DEX aggregators (ODOS)
- Multi-hop swaps
- Wrapped ETH handling
- Simplified user interactions

## Installation

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for testing and deployment)
- [Node.js](https://nodejs.org/) v18+ (for Hardhat scripts)
- [Yarn](https://yarnpkg.com/) package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Token_Launchpad_System
   ```

2. **Install dependencies**
   ```bash
   # Install Foundry dependencies (submodules)
   git submodule update --init --recursive
   
   # Install Node.js dependencies
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Development

### Compile Contracts

Using Foundry:
```bash
forge build
```

Using Hardhat:
```bash
yarn compile
# or
npx hardhat compile
```

### Run Tests

Using Foundry:
```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run specific test file
forge test --match-path test/TokenLaunchpadTest.sol
```

Using Hardhat:
```bash
npx hardhat test
```

### Code Formatting

Foundry's formatter:
```bash
forge fmt
```

### Gas Optimization

The contracts are optimized with:
- Solidity compiler optimizations (10,000 runs)
- Efficient storage patterns
- Safe approval patterns to minimize gas

## Testing

The test suite includes:

- **TokenLaunchpadTest.sol**: Main launchpad functionality tests
- **TokenLaunchpadLineaTest.sol**: Linea-specific implementation tests
- **RamsesAdapterTest.sol**: Ramses adapter tests
- **SafeApprovalTest.sol**: Safe approval utility tests
- **SomeTokenTest.sol**: Token contract tests
- **SomeProxyTest.sol**: Proxy contract tests
- **SomeTimelockTest.sol**: Timelock tests
- **UIHelperTest.sol**: UI helper contract tests

Run all tests:
```bash
forge test -vvv
```

## Deployment

### Using Hardhat

1. **Configure networks** in `hardhat.config.ts`

2. **Set up deployment scripts** in `deploy/` directory

3. **Deploy contracts**:
   ```bash
   npx hardhat deploy --network linea
   ```

### Deployment Scripts

- `deploy/test.ts`: Test deployment script
- `deploy/mainnet-template.ts`: Mainnet deployment template
- `deploy/utils.ts`: Deployment utilities

### Deployment Checklist

1. Deploy funding token (SomeMasterToken) or use existing
2. Deploy CLMM adapter (e.g., RamsesAdapter)
3. Deploy TokenLaunchpad implementation
4. Deploy proxy (SomeProxy) pointing to implementation
5. Initialize launchpad contract
6. Set launch ticks (launchTick, graduationTick, upperMaxTick)
7. Configure fee distribution addresses (for chain-specific implementations)

## Contracts Overview

### TokenLaunchpad

**Main Functions:**
- `initialize()`: Initialize the launchpad with owner, funding token, and adapter
- `createAndBuy()`: Create a new token and optionally buy tokens at launch
- `claimFees()`: Claim accumulated trading fees for a token
- `setLaunchTicks()`: Update launch tick parameters (owner/cron only)
- `computeTokenAddress()`: Compute deterministic token address before deployment

**Constants:**
- `GRADUATION_AMOUNT`: 600,000,000 tokens (60% of supply)
- `POST_GRADUATION_AMOUNT`: 400,000,000 tokens (40% of supply)

### BaseV3Adapter

**Main Functions:**
- `addSingleSidedLiquidity()`: Add liquidity across three tick ranges
- `swapWithExactInput()`: Execute swap with exact input amount
- `swapWithExactOutput()`: Execute swap with exact output amount
- `claimFees()`: Collect fees from liquidity positions

**Tick Management:**
- `TICK_SPACING`: 200 (fixed for CLMM pools)
- Validates tick ordering: `tick0 < tick1 < tick2`
- Ensures ticks are aligned to tick spacing
- Validates ticks are within valid range (MIN_TICK < tick0, tick2 < MAX_TICK)

### SomeToken

Simple ERC20 token with:
- 1 billion token supply (1,000,000,000 * 1e18)
- Ownable (but ownership is renounced in constructor)
- Standard ERC20 functionality

### TokenLaunchpadLinea

Chain-specific implementation that:
- Distributes fees: 15% to referral contract, 50% to treasury, 35% to token owner
- Configurable referral and treasury addresses

## Configuration

### Launch Ticks

The system uses three tick parameters:

- **launchTick**: Initial price tick for token launch
- **graduationTick**: Price tick that represents graduation milestone
- **upperMaxTick**: Maximum price tick for liquidity range

All ticks must:
- Be aligned to `TICK_SPACING` (200)
- Follow ordering: `launchTick < graduationTick < upperMaxTick`
- Be within valid range: `MIN_TICK < launchTick` and `upperMaxTick < MAX_TICK`

### Fee Distribution

Fees are collected from trading activity and distributed according to chain-specific rules. For Linea:
- 15% to referral contract
- 50% to somETHing treasury
- 35% to token owner (NFT holder)

## Security

### Security Features

- **Reentrancy Protection**: All external calls are protected with reentrancy guards
- **Safe Approvals**: Uses SafeApproval library to prevent unbounded approvals
- **Access Control**: OpenZeppelin's Ownable and AccessControl patterns
- **Upgradeable Pattern**: Uses proxy pattern with initialization protection
- **Input Validation**: Comprehensive validation of tick parameters and addresses

### Audit Status

⚠️ **This codebase has not been audited yet. Use at your own risk.**

### Best Practices

- Always verify contract addresses before deployment
- Use deterministic addresses (CREATE2) for token creation
- Validate tick parameters carefully
- Test thoroughly on testnets before mainnet deployment
- Review fee distribution logic for your use case

## Network Support

Currently configured for:
- **Linea**: Mainnet and testnet
- **Base**: Mainnet
- **BSC**: Binance Smart Chain
- **Hardhat**: Local development and forking

Additional networks can be added in `hardhat.config.ts` and `foundry.toml`.

## Dependencies

### Foundry Dependencies (Git Submodules)
- `@uniswap/v4-core`: Uniswap V4 core libraries
- `@uniswap/v4-periphery`: Uniswap V4 periphery contracts
- `@openzeppelin/contracts`: OpenZeppelin contracts
- `@openzeppelin/contracts-upgradeable`: OpenZeppelin upgradeable contracts

### Node.js Dependencies
- Hardhat: Development environment
- Ethers.js: Ethereum library
- TypeScript: Type safety
- Various Hardhat plugins for testing, deployment, and verification

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow Solidity style guide
- Use Foundry's formatter: `forge fmt`
- Write comprehensive tests for new features
- Document complex logic with NatSpec comments

## License

This project is licensed under AGPL-3.0-or-later - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions, please open an issue on GitHub.

---

**⚠️ Disclaimer**: This software is provided as-is without any guarantees. Always perform thorough testing and security audits before deploying to mainnet.
