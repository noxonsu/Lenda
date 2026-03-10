import { useState } from 'react';
import { Contract } from 'ethers';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import ADDRESSES_PROVIDER_ABI from '../constants/lendingPoolAddressesProvider.json';
import CONFIGURATOR_ABI from '../constants/lendingPoolConfigurator.json';

export function useLendingPoolConfigurator() {
  const { provider } = useWeb3Context();
  const { currentMarketData, jsonRpcProvider } = useProtocolDataContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getConfiguratorContract = async (): Promise<Contract> => {
    const addressesProviderAddress =
      currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
    const addressesProvider = new Contract(
      addressesProviderAddress,
      ADDRESSES_PROVIDER_ABI,
      jsonRpcProvider
    );
    const configuratorAddress: string = await addressesProvider.getLendingPoolConfigurator();
    return new Contract(configuratorAddress, CONFIGURATOR_ABI, jsonRpcProvider);
  };

  const withdrawFromReserve = async (asset: string, amount: string, to: string): Promise<void> => {
    if (!provider) {
      throw new Error('Wallet not connected');
    }
    setLoading(true);
    setError(null);
    try {
      const contract = await getConfiguratorContract();
      const tx = await contract.connect(provider.getSigner()).withdrawFromReserve(asset, amount, to);
      await tx.wait(1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const configureReserveAsCollateral = async (
    asset: string,
    ltv: string,
    liquidationThreshold: string,
    liquidationBonus: string
  ): Promise<void> => {
    if (!provider) {
      throw new Error('Wallet not connected');
    }
    setLoading(true);
    setError(null);
    try {
      const contract = await getConfiguratorContract();
      const tx = await contract
        .connect(provider.getSigner())
        .configureReserveAsCollateral(asset, ltv, liquidationThreshold, liquidationBonus);
      await tx.wait(1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { withdrawFromReserve, configureReserveAsCollateral, loading, error };
}
