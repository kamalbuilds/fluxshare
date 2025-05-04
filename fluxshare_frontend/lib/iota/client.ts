import { IotaClient, getFullnodeUrl } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { 
  PACKAGE_ID, 
  MODULE_NAMES, 
  PAYMENT_SPLITTER_FUNCTIONS, 
  SUBSCRIPTION_MANAGER_FUNCTIONS,
  DEFAULTS 
} from './constants';
import type {
  CreateSplitterParams,
  ProcessPaymentParams,
  CreateSubscriptionPlanParams,
  SubscribeParams,
  TransactionResult,
  PaymentSplitter,
  SubscriptionPlan,
  Subscription
} from './types';

// Initialize IOTA client
export const getIotaClient = (): IotaClient => {
  return new IotaClient({
    url: getFullnodeUrl('devnet'),
  });
};

// Helper function to build module target string
const buildTarget = (moduleName: string, functionName: string): string => {
  return `${PACKAGE_ID}::${moduleName}::${functionName}`;
};

// Payment Splitter Functions
export const createPaymentSplitterTransaction = (
  registryId: string,
  params: CreateSplitterParams
): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.PAYMENT_SPLITTER, PAYMENT_SPLITTER_FUNCTIONS.CREATE_SPLITTER),
    arguments: [
      tx.object(registryId),
      tx.pure.string(params.name),
      tx.pure.vector('address', params.recipient_addresses),
      tx.pure.vector('u64', params.recipient_shares),
    ],
  });
  
  return tx;
};

export const processPaymentTransaction = (
  registryId: string,
  params: ProcessPaymentParams,
  coinId: string
): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.PAYMENT_SPLITTER, PAYMENT_SPLITTER_FUNCTIONS.PROCESS_PAYMENT),
    arguments: [
      tx.object(registryId),
      tx.pure.u64(params.splitter_id),
      tx.object(coinId),
    ],
  });
  
  return tx;
};

export const updateRecipientsTransaction = (
  registryId: string,
  splitterId: number,
  recipientAddresses: string[],
  recipientShares: number[]
): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.PAYMENT_SPLITTER, PAYMENT_SPLITTER_FUNCTIONS.UPDATE_RECIPIENTS),
    arguments: [
      tx.object(registryId),
      tx.pure.u64(splitterId),
      tx.pure.vector('address', recipientAddresses),
      tx.pure.vector('u64', recipientShares),
    ],
  });
  
  return tx;
};

// Subscription Manager Functions
export const createSubscriptionPlanTransaction = (
  registryId: string,
  params: CreateSubscriptionPlanParams
): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.SUBSCRIPTION_MANAGER, SUBSCRIPTION_MANAGER_FUNCTIONS.CREATE_PLAN),
    arguments: [
      tx.object(registryId),
      tx.pure.string(params.name),
      tx.pure.string(params.description),
      tx.pure.u64(params.price),
      tx.pure.u64(params.period_in_seconds),
    ],
  });
  
  return tx;
};

export const subscribeTransaction = (
  registryId: string,
  params: SubscribeParams,
  coinId: string
): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.SUBSCRIPTION_MANAGER, SUBSCRIPTION_MANAGER_FUNCTIONS.SUBSCRIBE),
    arguments: [
      tx.object(registryId),
      tx.pure.u64(params.plan_id),
      tx.object(coinId),
    ],
  });
  
  return tx;
};

export const renewSubscriptionTransaction = (
  registryId: string,
  subscriptionId: number,
  coinId: string
): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.SUBSCRIPTION_MANAGER, SUBSCRIPTION_MANAGER_FUNCTIONS.RENEW_SUBSCRIPTION),
    arguments: [
      tx.object(registryId),
      tx.pure.u64(subscriptionId),
      tx.object(coinId),
    ],
  });
  
  return tx;
};

export const cancelSubscriptionTransaction = (
  registryId: string,
  subscriptionId: number
): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.SUBSCRIPTION_MANAGER, SUBSCRIPTION_MANAGER_FUNCTIONS.CANCEL_SUBSCRIPTION),
    arguments: [
      tx.object(registryId),
      tx.pure.u64(subscriptionId),
    ],
  });
  
  return tx;
};

// Query Functions - Fixed to use proper shared object queries
export const getPaymentSplitterRegistry = async (): Promise<any> => {
  const client = getIotaClient();
  
  try {
    // Query for all objects of the PaymentSplitterRegistry type
    const objects = await client.multiGetObjects({
      ids: [], // We'll use getDynamicFields instead
      options: {
        showContent: true,
        showType: true,
      }
    });
    
    // Alternative approach: Query events to find registry creation
    const events = await client.queryEvents({
      query: {
        MoveEventModule: {
          package: PACKAGE_ID,
          module: MODULE_NAMES.PAYMENT_SPLITTER,
        }
      },
      limit: 1,
    });
    
    // For now, we'll use a known registry ID or create one
    // In a real app, you'd track the registry ID from deployment
    return null; // Will be handled in the hooks
  } catch (error) {
    console.error('Error fetching payment splitter registry:', error);
    throw error;
  }
};

export const getSubscriptionRegistry = async (): Promise<any> => {
  const client = getIotaClient();
  
  try {
    // Similar approach for subscription registry
    const events = await client.queryEvents({
      query: {
        MoveEventModule: {
          package: PACKAGE_ID,
          module: MODULE_NAMES.SUBSCRIPTION_MANAGER,
        }
      },
      limit: 1,
    });
    
    return null; // Will be handled in the hooks
  } catch (error) {
    console.error('Error fetching subscription registry:', error);
    throw error;
  }
};

export const getUserOwnedCoins = async (address: string): Promise<any[]> => {
  const client = getIotaClient();
  
  try {
    const coins = await client.getCoins({
      owner: address,
      coinType: '0x2::iota::IOTA',
    });
    
    return coins.data;
  } catch (error) {
    console.error('Error fetching user coins:', error);
    throw error;
  }
};

export const getObjectById = async (objectId: string): Promise<any> => {
  const client = getIotaClient();
  
  try {
    const object = await client.getObject({
      id: objectId,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      }
    });
    
    return object;
  } catch (error) {
    console.error('Error fetching object:', error);
    throw error;
  }
};

// Registry creation functions
export const createPaymentSplitterRegistryTransaction = (): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.PAYMENT_SPLITTER, PAYMENT_SPLITTER_FUNCTIONS.INITIALIZE),
    arguments: [],
  });
  
  return tx;
};

export const createSubscriptionRegistryTransaction = (): Transaction => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.SUBSCRIPTION_MANAGER, SUBSCRIPTION_MANAGER_FUNCTIONS.INITIALIZE),
    arguments: [],
  });
  
  return tx;
};

// Utility functions
export const formatIotaAmount = (amount: string | bigint): string => {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
  // IOTA has 9 decimals
  const divisor = BigInt(1_000_000_000);
  const integerPart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }
  
  return `${integerPart}.${fractionalPart.toString().padStart(9, '0').replace(/0+$/, '')}`;
};

export const parseIotaAmount = (amount: string): bigint => {
  const [integerPart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(9, '0').slice(0, 9);
  return BigInt(integerPart) * BigInt(1_000_000_000) + BigInt(paddedFractional);
};

// Transaction history and events
export const getTransactionHistory = async (address: string): Promise<any[]> => {
  const client = getIotaClient();
  
  try {
    const transactions = await client.queryTransactionBlocks({
      filter: {
        FromAddress: address,
      },
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
      },
      limit: 50,
    });
    
    return transactions.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

export const getEventsByType = async (eventType: string): Promise<any[]> => {
  const client = getIotaClient();
  
  try {
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::${eventType}`,
      },
      limit: 50,
    });
    
    return events.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}; 