'use client';

import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { useState, useCallback } from 'react';
import { 
  createSubscriptionPlanTransaction,
  subscribeTransaction,
  renewSubscriptionTransaction,
  cancelSubscriptionTransaction,
  getSubscriptionRegistry,
  getUserOwnedCoins 
} from '@/lib/iota/client';
import type { 
  CreateSubscriptionPlanParams,
  SubscribeParams,
  TransactionResult 
} from '@/lib/iota/types';

export const useSubscriptionManager = () => {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlan = useCallback(async (params: CreateSubscriptionPlanParams): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the registry to pass as parameter
      const registry = await getSubscriptionRegistry();
      if (!registry) {
        throw new Error('Subscription registry not found');
      }

      const transaction = createSubscriptionPlanTransaction(registry.data.objectId, params);
      
      const result = await signAndExecuteTransaction({
        transaction,
      });

      return {
        digest: result.digest,
        effects: result.effects,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription plan';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, signAndExecuteTransaction]);

  const subscribe = useCallback(async (planId: number, paymentAmount: string): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the registry
      const registry = await getSubscriptionRegistry();
      if (!registry) {
        throw new Error('Subscription registry not found');
      }

      // Get user's coins to use for subscription payment
      const coins = await getUserOwnedCoins(currentAccount.address);
      if (coins.length === 0) {
        throw new Error('No IOTA coins found in wallet');
      }

      // Use the first available coin
      const coinId = coins[0].coinObjectId;
      
      const transaction = subscribeTransaction(
        registry.data.objectId,
        { plan_id: planId, payment_amount: paymentAmount },
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to plan';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, signAndExecuteTransaction]);

  const renewSubscription = useCallback(async (subscriptionId: number): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the registry
      const registry = await getSubscriptionRegistry();
      if (!registry) {
        throw new Error('Subscription registry not found');
      }

      // Get user's coins to use for renewal payment
      const coins = await getUserOwnedCoins(currentAccount.address);
      if (coins.length === 0) {
        throw new Error('No IOTA coins found in wallet');
      }

      // Use the first available coin
      const coinId = coins[0].coinObjectId;
      
      const transaction = renewSubscriptionTransaction(
        registry.data.objectId,
        subscriptionId,
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to renew subscription';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, signAndExecuteTransaction]);

  const cancelSubscription = useCallback(async (subscriptionId: number): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the registry
      const registry = await getSubscriptionRegistry();
      if (!registry) {
        throw new Error('Subscription registry not found');
      }

      const transaction = cancelSubscriptionTransaction(
        registry.data.objectId,
        subscriptionId
      );
      
      const result = await signAndExecuteTransaction({
        transaction,
      });

      return {
        digest: result.digest,
        effects: result.effects,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, signAndExecuteTransaction]);

  return {
    createPlan,
    subscribe,
    renewSubscription,
    cancelSubscription,
    isLoading,
    error,
    isConnected: !!currentAccount,
  };
}; 