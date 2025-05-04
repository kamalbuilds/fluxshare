'use client';

import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { useState, useCallback } from 'react';
import { 
  createSubscriptionPlanTransaction,
  subscribeTransaction,
  renewSubscriptionTransaction,
  cancelSubscriptionTransaction,
  getUserOwnedCoins,
  getSubscriptionPlans,
  getUserSubscriptionPlans
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

  const createPlan = useCallback(async (
    params: CreateSubscriptionPlanParams,
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
      const transaction = createSubscriptionPlanTransaction(registryId, params);
      
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

  const subscribe = useCallback(async (
    registryId: string,
    planId: number, 
    paymentAmount: string
  ): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    if (!registryId) {
      throw new Error('Registry ID is required');
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      throw new Error('Invalid payment amount');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create transaction using gas coin splitting
      const transaction = subscribeTransaction(
        registryId,
        { plan_id: planId, payment_amount: paymentAmount }
      );
      
      // Set gas budget explicitly
      transaction.setGasBudget(10_000_000); // 10M MIST gas budget
      
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

  const renewSubscription = useCallback(async (
    registryId: string,
    subscriptionId: number,
    paymentAmount: string
  ): Promise<TransactionResult | null> => {
    if (!currentAccount) {
      throw new Error('Wallet not connected');
    }

    if (!registryId) {
      throw new Error('Registry ID is required');
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      throw new Error('Invalid payment amount');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create transaction using gas coin splitting
      const transaction = renewSubscriptionTransaction(
        registryId,
        subscriptionId,
        paymentAmount
      );
      
      // Set gas budget explicitly
      transaction.setGasBudget(10_000_000); // 10M MIST gas budget
      
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

  const cancelSubscription = useCallback(async (
    registryId: string,
    subscriptionId: number
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
      const transaction = cancelSubscriptionTransaction(
        registryId,
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

  const fetchSubscriptionPlans = useCallback(async (registryId: string): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const plans = await getSubscriptionPlans(registryId);
      return plans;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription plans';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserPlans = useCallback(async (creatorAddress: string): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const plans = await getUserSubscriptionPlans(creatorAddress);
      return plans;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user plans';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createPlan,
    subscribe,
    renewSubscription,
    cancelSubscription,
    fetchSubscriptionPlans,
    fetchUserPlans,
    isLoading,
    error,
    isConnected: !!currentAccount,
  };
}; 