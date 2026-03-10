# Lenda — Aave v3 BNB Testnet Deployment Notes

## Deployed Contracts (BNB Testnet, chain 97)

| Contract | Address |
|---------|---------|
| PoolAddressesProvider | `0x377D405892526997e4aF347Ec0D2A5Ed44A13835` |
| Pool (proxy) | `0x594ce065aB781bD970F61f3d7f10F2BEa451293D` |
| PoolConfigurator (proxy) | `0xF1C2a6f80c23ea1567126aa2CBE0671554bCC382` |
| WrappedTokenGatewayV3 | `0x575eB6f2a567E760b1f11DaF255D84d6650FB335` |
| WalletBalanceProvider | `0xACB2e5c44F3B3AD618746594cbEb64C90c671973` |
| UiPoolDataProviderV3 | `0x54A47A5B9065DB9bCa750ED5c4BCaf42b14cE00C` |
| UiIncentiveDataProviderV3 | `0x9619E3a884129806Cf19a006b93Da6999C7D9E78` |
| AaveOracle | `0x4DE5387d57656e92544450f492E746530E1CbF5f` |
| ACLManager | `0x1945108E8eE80b865Fb9E6951855ef2b1605266d` |
| PoolDataProvider | `0xf7b8ce72f773E7Acc7DC00C9a81c88e66cc95FF4` |
| IncentivesController (proxy) | `0xD928B39DB10dB978fCeeD0Ad6739C5562496c5f5` |
| Faucet | `0xf0B359d4fcA26fCDb305f5Bb625EfBAeb1cE123E` |

### Test Tokens
| Token | Address | Decimals |
|-------|---------|---------|
| USDT  | `0xcB4861bb044b95B4AC53C1F4269A84b72241eEc4` | 18 (BSC) |
| WBNB  | `0xFc065C20C220dC8115B9e34E28a2caEb2E7cAB34` | 18 |
| USDC  | `0xBeA561c544d0595d8AAb359785eF5f1B8a50702D` | 18 (BSC) |

### Mock Price Aggregators
| Token | Aggregator | Price |
|-------|-----------|-------|
| USDT  | `0x5AA89A6E6F13D7A8098AA2536e8e0E9b00453E47` | $1.00 |
| WBNB  | `0x163ea397976F00Df27667E62066bdE077BED6b09` | $300.00 |
| USDC  | `0xA67e73B3C9c6B599B537Ef7507f3400Bbdaf2eaE` | $1.00 |

---

## How to Verify Deployment is OK

### 1. Check pool is live (not paused)
```bash
node -e "
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
const POOL_ABI = ['function paused() view returns (bool)', 'function getReservesList() view returns (address[])'];
const pool = new ethers.Contract('0x594ce065aB781bD970F61f3d7f10F2BEa451293D', POOL_ABI, provider);
pool.paused().then(p => console.log('Paused:', p));
pool.getReservesList().then(l => console.log('Reserves:', l));
"
```

Expected: `Paused: false`, Reserves shows 3 addresses.

### 2. Check oracle prices
```bash
node -e "
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
const ORACLE_ABI = ['function getAssetPrice(address) view returns (uint256)'];
const oracle = new ethers.Contract('0x4DE5387d57656e92544450f492E746530E1CbF5f', ORACLE_ABI, provider);
const tokens = {
  USDT: '0xcB4861bb044b95B4AC53C1F4269A84b72241eEc4',
  WBNB: '0xFc065C20C220dC8115B9e34E28a2caEb2E7cAB34',
  USDC: '0xBeA561c544d0595d8AAb359785eF5f1B8a50702D',
};
Promise.all(Object.entries(tokens).map(async ([sym, addr]) => {
  const price = await oracle.getAssetPrice(addr);
  console.log(sym, ethers.utils.formatUnits(price, 8), 'USD');
}));
"
```

Expected: USDT = 1.00, WBNB = 300.00, USDC = 1.00

### 3. Mint test tokens from faucet
```bash
node -e "
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);
const FAUCET_ABI = ['function mint(address token, address to, uint256 amount)'];
const faucet = new ethers.Contract('0xf0B359d4fcA26fCDb305f5Bb625EfBAeb1cE123E', FAUCET_ABI, signer);
const USDT = '0xcB4861bb044b95B4AC53C1F4269A84b72241eEc4';
faucet.mint(USDT, signer.address, ethers.utils.parseEther('1000')).then(tx => tx.wait()).then(() => console.log('Minted 1000 USDT'));
"
```

---

## If Something Is Wrong

### Pool paused → unpause
```bash
cd /root/aave-v3-deploy-bnb
node -e "
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
const ABI = ['function setPoolPause(bool paused)'];
const cfg = new ethers.Contract('0xF1C2a6f80c23ea1567126aa2CBE0671554bCC382', ABI, signer);
cfg.setPoolPause(false).then(tx => tx.wait()).then(() => console.log('Unpaused'));
"
```

### Oracle price missing → update price aggregator
The mock aggregators use fixed prices hardcoded in contract constructor. To change a price:
1. Deploy a new MockAggregator with new price
2. Call `AaveOracle.setAssetSources([token], [newAggregatorAddr])`

```bash
cd /root/aave-v3-deploy-bnb
# Deploy new aggregator with price $350 for WBNB
node -e "
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

// MockAggregator constructor: (int256 _initialAnswer)
const MOCK_AGGREGATOR_ABI = ['constructor(int256)'];
const bytecode = require('./artifacts/@aave/core-v3/contracts/mocks/oracle/CLAggregators/MockAggregator.sol/MockAggregator.json').bytecode;
const factory = new ethers.ContractFactory(MOCK_AGGREGATOR_ABI, bytecode, signer);
const newPrice = ethers.utils.parseUnits('350', 8);  // $350 with 8 decimals
factory.deploy(newPrice).then(async c => {
  await c.deployed();
  console.log('New aggregator:', c.address);

  const ORACLE_ABI = ['function setAssetSources(address[], address[])'];
  const oracle = new ethers.Contract('0x4DE5387d57656e92544450f492E746530E1CbF5f', ORACLE_ABI, signer);
  const WBNB = '0xFc065C20C220dC8115B9e34E28a2caEb2E7cAB34';
  await oracle.setAssetSources([WBNB], [c.address]);
  console.log('Oracle updated');
});
"
```

### Continue/retry deployment (if interrupted)
```bash
cd /root/aave-v3-deploy-bnb
npx hardhat deploy --network bsc-testnet
```

Runs are idempotent — already deployed contracts are reused (checked by artifact files in `deployments/bsc-testnet/`).

If stuck on "nonce has already been used" — just re-run, picks up where left off.

If stuck on same error many times — check full error:
```bash
npx hardhat deploy --network bsc-testnet 2>&1 | grep -A 10 "ERROR processing"
```

### Deployer wallet
- Address: `0x0b5Ce0876F4Ddae8612d4a3E3587f27dd46820C6`
- Key: in `/root/aave-v3-deploy-bnb/.env`
- Get testnet BNB: https://testnet.bnbchain.org/faucet-smart

---

## Deployment source

All scripts: `/root/aave-v3-deploy-bnb/`
Market config: `/root/aave-v3-deploy-bnb/markets/bnb/`
Artifacts: `/root/aave-v3-deploy-bnb/deployments/bsc-testnet/`

Deployed: 2026-03-10
