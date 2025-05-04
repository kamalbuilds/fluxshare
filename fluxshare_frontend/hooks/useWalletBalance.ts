'use client';

import { useCurrentAccount, useIotaClientQuery } from '@iota/dapp-kit';
import { useMemo } from 'react';
import { formatIotaAmount } from '@/lib/iota/client';

export const useWalletBalance = () => {
  const currentAccount = useCurrentAccount();

  // Query user's IOTA coins
  const { data: coins, isLoading, error, refetch } = useIotaClientQuery(
    'getCoins',
    {
      owner: currentAccount?.address || '',
      coinType: '0x2::iota::IOTA',
    },
    {
      enabled: !!currentAccount?.address,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  // Calculate total balance
  const totalBalance = useMemo(() => {
    if (!coins?.data) return BigInt(0);
    
    return coins.data.reduce((total: bigint, coin: any) => {
      return total + BigInt(coin.balance || '0');
    }, BigInt(0));
  }, [coins?.data]);

  // Format balance for display
  const formattedBalance = useMemo(() => {
    return formatIotaAmount(totalBalance);
  }, [totalBalance]);

  // Get available coins
  const availableCoins = useMemo(() => {
    return coins?.data || [];
  }, [coins?.data]);

  return {
    totalBalance,
    formattedBalance,
    availableCoins,
    coinsCount: availableCoins.length,
    isLoading,
    error,
    refetch,
    isConnected: !!currentAccount,
    address: currentAccount?.address,
  };
}; 