import { ChainId } from '@aave/contract-helpers';

export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  // the network the market operates on
  chainId: ChainId;
  enabledFeatures?: {
    liquiditySwap?: boolean;
    staking?: boolean;
    governance?: boolean;
    faucet?: boolean;
    collateralRepay?: boolean;
    incentives?: boolean;
    permissions?: boolean;
  };
  cachingServerUrl?: string;
  cachingWSServerUrl?: string;
  rpcOnly?: boolean;
  isFork?: boolean;
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    LENDING_POOL: string;
    WETH_GATEWAY?: string;
    SWAP_COLLATERAL_ADAPTER?: string;
    REPAY_WITH_COLLATERAL_ADAPTER?: string;
    FAUCET?: string;
    PERMISSION_MANAGER?: string;
    WALLET_BALANCE_PROVIDER: string;
    L2_ENCODER?: string;
    /**
     * UiPoolDataProvider currently requires a non-master version
     * https://github.com/aave/protocol-v2/blob/feat/split-ui-dataprovider-logic/contracts/misc/UiPoolDataProvider.sol
     * If you deploy a market with the non default oracle or incentive controller you have to redeploy the UiPoolDataProvider as well as currently the addresses are static.
     * In the upcoming version this will no longer be needed.
     */
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER?: string;
  };
  /**
   * https://www.hal.xyz/ has integrated aave for healtfactor warning notification
   * the integration doesn't follow aave market naming & only supports a subset of markets.
   * When a halMarketName is specified a link to hal will be displayed on the ui.
   */
  halMarketName?: string;
};

export enum CustomMarket {
  proto_bnb_v3 = 'proto_bnb_v3',
  // BNB testnet: Aave v3 not officially deployed on chain 97.
  // For e2e tests use Tenderly fork of BSC mainnet (see cypress/support/tools/tenderly.ts).
  // To enable: deploy Aave v3 to BNB testnet, fill addresses, uncomment below.
  // proto_bnb_testnet_v3 = 'proto_bnb_testnet_v3',
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  // Aave v3 on BNB Chain (mainnet)
  // Source: https://github.com/bgd-labs/aave-address-book/blob/main/src/AaveV3BNB.sol
  [CustomMarket.proto_bnb_v3]: {
    v3: true,
    marketTitle: 'BNB Chain',
    chainId: ChainId.bsc,
    enabledFeatures: {
      incentives: true,
      collateralRepay: true,
      liquiditySwap: true,
    },
    rpcOnly: true,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: '0xff75B6da14FfbbfD355Daf7a2731456b3562Ba6D'.toLowerCase(),
      LENDING_POOL: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
      WETH_GATEWAY: '0x0c2C95b24529664fE55D4437D7A31175CFE6c4f7',
      SWAP_COLLATERAL_ADAPTER: '0x33E0b3fc976DC9C516926BA48CfC0A9E10a2aAA5',
      REPAY_WITH_COLLATERAL_ADAPTER: '0x5598BbFA2f4fE8151f45bBA0a3edE1b54B51a0a9',
      WALLET_BALANCE_PROVIDER: '0x36616cf17557639614c1cdDb356b1B83fc0B2132',
      UI_POOL_DATA_PROVIDER: '0x632b5Dfc315b228bfE779E6442322Ad8a110Ea13',
      UI_INCENTIVE_DATA_PROVIDER: '0x5c5228aC8BC1528482514aF3e27E692495148717',
    },
  },
  // proto_bnb_testnet_v3: Aave v3 NOT officially deployed on BNB testnet (chain 97).
  // For e2e auto-tests use Tenderly fork of BSC mainnet:
  //   const fork = new TenderlyFork({ forkNetworkID: 56 }); // cypress/support/tools/tenderly.ts
  // To enable: deploy Aave v3 to BNB testnet and fill addresses below.
  // [CustomMarket.proto_bnb_testnet_v3]: {
  //   v3: true,
  //   marketTitle: 'BNB Chain Testnet',
  //   chainId: ChainId.bsc_testnet,
  //   enabledFeatures: { faucet: true, incentives: true },
  //   rpcOnly: true,
  //   addresses: {
  //     LENDING_POOL_ADDRESS_PROVIDER: '0x0000000000000000000000000000000000000000', // TODO: deploy
  //     LENDING_POOL:                  '0x0000000000000000000000000000000000000000', // TODO: deploy
  //     WETH_GATEWAY:                  '0x0000000000000000000000000000000000000000', // TODO: deploy
  //     WALLET_BALANCE_PROVIDER:       '0x0000000000000000000000000000000000000000', // TODO: deploy
  //     UI_POOL_DATA_PROVIDER:         '0x0000000000000000000000000000000000000000', // TODO: deploy
  //     UI_INCENTIVE_DATA_PROVIDER:    '0x0000000000000000000000000000000000000000', // TODO: deploy
  //   },
  // },
} as const;
