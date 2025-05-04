'use client';

import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { useState, useCallback } from 'react';
import { 
  createPaymentSplitterTransaction, 
  processPaymentTransaction,
  updateRecipientsTransaction,
  getUserOwnedCoins 
} from '@/lib/iota/client';
import type { 
  CreateSplitterParams, 
  ProcessPaymentParams,
  TransactionResult 
} from '@/lib/iota/types';

export const usePaymentSplitter = () => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSplitter = useCallback(async (
    params: CreateSplitterParams, 
    registryId: string
  ): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    if (!registryId) {
      throw new Error('Registry ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction = createPaymentSplitterTransaction(registryId, params);
      
      const result = await signAndExecuteTransaction({
        transaction,
      });

      return {
        digest: result.digest,
        effects: result.effects,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment splitter';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, signAndExecuteTransaction]);

  const processPayment = useCallback(async (
    registryId: string,
    splitterId: number, 
    amount: string
  ): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    if (!registryId) {
      throw new Error('Registry ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user's coins to use for payment
      const coins = await getUserOwnedCoins(currentAccount.address);
      if (coins.length === 0) {
        throw new Error('No IOTA coins found in wallet');
      }

      // Use the first available coin
      const coinId = coins[0].coinObjectId;
      
      const transaction = processPaymentTransaction(
        registryId,
        { splitter_id: splitterId, amount },
        coinId
      );
      
      const result = await signAndExecuteTransaction({
        transaction,
      });

      return {
        digest: result.digest,
        effects: result.effects,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, signAndExecuteTransaction]);

  const updateRecipients = useCallback(async (
    registryId: string,
    splitterId: number,
    recipientAddresses: string[],
    recipientShares: number[]
  ): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    if (!registryId) {
      throw new Error('Registry ID is required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction = updateRecipientsTransaction(
        registryId,
        splitterId,
        recipientAddresses,
        recipientShares
      );
      
      const result = await signAndExecuteTransaction({
        transaction,
      });

      return {
        digest: result.digest,
        effects: result.effects,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update recipients';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, signAndExecuteTransaction]);

  return {
    createSplitter,
    processPayment,
    updateRecipients,
    isLoading,
    error,
    isConnected: !!currentAccount,
  };
}; 