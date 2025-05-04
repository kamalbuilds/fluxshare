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
  params: ProcessPaymentParams
): Transaction => {
  const tx = new Transaction();
  
  // Convert amount to proper BigInt format (IOTA has 9 decimals)
  const amountInMist = BigInt(Math.floor(parseFloat(params.amount) * 1_000_000_000));
  
  // Split coins from gas coin for the payment
  const paymentCoin = tx.splitCoins(tx.gas, [amountInMist]);
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.PAYMENT_SPLITTER, PAYMENT_SPLITTER_FUNCTIONS.PROCESS_PAYMENT),
    arguments: [
      tx.object(registryId),
      tx.pure.u64(params.splitter_id),
      paymentCoin,
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
  params: SubscribeParams
): Transaction => {
  const tx = new Transaction();
  
  // Convert amount to proper BigInt format (IOTA has 9 decimals)
  const amountInMist = BigInt(Math.floor(parseFloat(params.payment_amount) * 1_000_000_000));
  
  // Split coins from gas coin for the payment
  const paymentCoin = tx.splitCoins(tx.gas, [amountInMist]);
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.SUBSCRIPTION_MANAGER, SUBSCRIPTION_MANAGER_FUNCTIONS.SUBSCRIBE),
    arguments: [
      tx.object(registryId),
      tx.pure.u64(params.plan_id),
      paymentCoin,
    ],
  });
  
  return tx;
};

export const renewSubscriptionTransaction = (
  registryId: string,
  subscriptionId: number,
  paymentAmount: string
): Transaction => {
  const tx = new Transaction();
  
  // Convert amount to proper BigInt format (IOTA has 9 decimals)
  const amountInMist = BigInt(Math.floor(parseFloat(paymentAmount) * 1_000_000_000));
  
  // Split coins from gas coin for the payment
  const paymentCoin = tx.splitCoins(tx.gas, [amountInMist]);
  
  tx.moveCall({
    target: buildTarget(MODULE_NAMES.SUBSCRIPTION_MANAGER, SUBSCRIPTION_MANAGER_FUNCTIONS.RENEW_SUBSCRIPTION),
    arguments: [
      tx.object(registryId),
      tx.pure.u64(subscriptionId),
      paymentCoin,
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

// Check if user has sufficient balance for transaction
export const checkSufficientBalance = async (
  userAddress: string, 
  requiredAmount: string
): Promise<{ hasBalance: boolean; totalBalance: string; message: string }> => {
  try {
    const coins = await getUserOwnedCoins(userAddress);
    
    if (coins.length === 0) {
      return {
        hasBalance: false,
        totalBalance: '0',
        message: 'No IOTA coins found in wallet. Please add IOTA to your wallet.'
      };
    }
    
    // Calculate total balance
    const totalBalance = coins.reduce((sum, coin) => {
      return sum + BigInt(coin.balance || '0');
    }, BigInt(0));
    
    const requiredAmountMist = parseIotaAmount(requiredAmount);
    const gasEstimate = BigInt(10_000_000); // 10M MIST for gas
    const totalRequired = requiredAmountMist + gasEstimate;
    
    const hasBalance = totalBalance >= totalRequired;
    
    return {
      hasBalance,
      totalBalance: formatIotaAmount(totalBalance),
      message: hasBalance 
        ? 'Sufficient balance available'
        : `Insufficient balance. Required: ${formatIotaAmount(totalRequired)} IOTA, Available: ${formatIotaAmount(totalBalance)} IOTA`
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    return {
      hasBalance: false,
      totalBalance: '0',
      message: 'Error checking wallet balance'
    };
  }
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

// Query functions for checking existing registries
export async function getPaymentSplitterRegistry(ownerAddress: string): Promise<string | null> {
  try {
    const client = new IotaClient({ url: getFullnodeUrl('devnet') });
    
    console.log('Checking for payment splitter registry for address:', ownerAddress);
    
    // First, try to find registry by checking transaction history
    const transactions = await client.queryTransactionBlocks({
      filter: {
        FromAddress: ownerAddress,
      },
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
      limit: 50,
    });

    console.log('Found', transactions.data?.length || 0, 'transactions');
    
    // Look for registry creation in transaction effects
    for (const txn of transactions.data || []) {
      if (txn.objectChanges) {
        for (const change of txn.objectChanges) {
          if (change.type === 'created' && 
              change.objectType && 
              change.objectType.includes('PaymentSplitterRegistry')) {
            console.log('Found payment splitter registry in transaction:', change.objectId);
            return change.objectId;
          }
        }
      }
    }

    // If not found in transaction history, try checking owned objects as fallback
    const objects = await client.getOwnedObjects({
      owner: ownerAddress,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      }
    });

    console.log('Found', objects.data?.length || 0, 'owned objects');
    
    if (objects.data) {
      for (const object of objects.data) {
        console.log('Object type:', object.data?.type);
        if (object.data?.type && object.data.type.includes('PaymentSplitterRegistry')) {
          console.log('Found payment splitter registry:', object.data.objectId);
          return object.data.objectId;
        }
      }
    }
    
    console.log('No payment splitter registry found');
    return null;
  } catch (error) {
    console.error('Error querying payment splitter registry:', error);
    return null;
  }
}

export async function getSubscriptionRegistry(ownerAddress: string): Promise<string | null> {
  try {
    const client = new IotaClient({ url: getFullnodeUrl('devnet') });
    
    console.log('Checking for subscription registry for address:', ownerAddress);
    
    // First, try to find registry by checking transaction history
    const transactions = await client.queryTransactionBlocks({
      filter: {
        FromAddress: ownerAddress,
      },
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
      limit: 50,
    });

    console.log('Found', transactions.data?.length || 0, 'transactions');
    
    // Look for registry creation in transaction effects
    for (const txn of transactions.data || []) {
      if (txn.objectChanges) {
        for (const change of txn.objectChanges) {
          if (change.type === 'created' && 
              change.objectType && 
              change.objectType.includes('SubscriptionRegistry')) {
            console.log('Found subscription registry in transaction:', change.objectId);
            return change.objectId;
          }
        }
      }
    }

    // If not found in transaction history, try checking owned objects as fallback
    const objects = await client.getOwnedObjects({
      owner: ownerAddress,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      }
    });

    console.log('Found', objects.data?.length || 0, 'owned objects');
    
    if (objects.data) {
      for (const object of objects.data) {
        console.log('Object type:', object.data?.type);
        if (object.data?.type && object.data.type.includes('SubscriptionRegistry')) {
          console.log('Found subscription registry:', object.data.objectId);
          return object.data.objectId;
        }
      }
    }
    
    console.log('No subscription registry found');
    return null;
  } catch (error) {
    console.error('Error querying subscription registry:', error);
    return null;
  }
}

// Alternative approach: Query all owned objects and filter by type
export async function getUserRegistries(ownerAddress: string): Promise<{
  paymentSplitterRegistry?: string;
  subscriptionRegistry?: string;
}> {
  try {
    const client = new IotaClient({ url: getFullnodeUrl('devnet') });
    
    const objects = await client.getOwnedObjects({
      owner: ownerAddress,
      options: {
        showContent: true,
        showType: true,
      }
    });

    const registries: {
      paymentSplitterRegistry?: string;
      subscriptionRegistry?: string;
    } = {};

    if (objects.data) {
      for (const object of objects.data) {
        if (object.data?.type) {
          if (object.data.type.includes('PaymentSplitterRegistry')) {
            registries.paymentSplitterRegistry = object.data.objectId;
          } else if (object.data.type.includes('SubscriptionRegistry')) {
            registries.subscriptionRegistry = object.data.objectId;
          }
        }
      }
    }

    return registries;
  } catch (error) {
    console.error('Error querying user registries:', error);
    return {};
  }
}

// Query subscription plans from blockchain
export const getSubscriptionPlans = async (registryId: string): Promise<any[]> => {
  const client = getIotaClient();
  
  try {
    console.log('Fetching subscription plans from registry:', registryId);
    
    // Get the registry object to read its state
    const registryObject = await client.getObject({
      id: registryId,
      options: {
        showContent: true,
        showType: true,
      }
    });

    console.log('Registry object:', registryObject);

    const plans: any[] = [];

    // Parse plans directly from registry object content
    if (registryObject.data?.content && 'fields' in registryObject.data.content) {
      const fields = registryObject.data.content.fields as any;
      
      if (fields.plans && Array.isArray(fields.plans)) {
        console.log('Found', fields.plans.length, 'plans in registry');
        
        for (const planData of fields.plans) {
          if (planData.fields) {
            const plan = {
              id: parseInt(planData.fields.plan_id || '0'),
              name: planData.fields.name || 'Unnamed Plan',
              description: planData.fields.description || 'No description',
              price: planData.fields.price || '0',
              period: parseInt(planData.fields.period_in_seconds || '0'),
              creator: planData.fields.owner || '',
              created_at: (parseInt(planData.fields.created_at || '0') * 1000).toString(), // Convert seconds to milliseconds
              active: planData.fields.active || false,
            };
            
            // Only include active plans
            if (plan.active) {
              plans.push(plan);
              console.log('Added plan:', plan);
            }
          }
        }
      }
    }

    console.log('Parsed subscription plans:', plans);
    return plans;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
};

// Check if user has an active subscription to a specific plan
export const hasActiveSubscription = async (registryId: string, userAddress: string, planId: number): Promise<boolean> => {
  const client = getIotaClient();
  
  try {
    console.log('Checking subscription status for user:', userAddress, 'plan:', planId);
    
    const registryObject = await client.getObject({
      id: registryId,
      options: {
        showContent: true,
        showType: true,
      }
    });

    if (registryObject.data?.content && 'fields' in registryObject.data.content) {
      const fields = registryObject.data.content.fields as any;
      
      if (fields.subscriptions && Array.isArray(fields.subscriptions)) {
        for (const subscription of fields.subscriptions) {
          if (subscription.fields && 
              subscription.fields.subscriber === userAddress &&
              parseInt(subscription.fields.plan_id) === planId &&
              subscription.fields.active === true) {
            console.log('Found active subscription:', subscription.fields);
            return true;
          }
        }
      }
    }
    
    console.log('No active subscription found for user:', userAddress, 'plan:', planId);
    return false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

// Get subscription plans for a specific creator
export const getUserSubscriptionPlans = async (creatorAddress: string): Promise<any[]> => {
  const client = getIotaClient();
  
  try {
    console.log('Fetching subscription plans for creator:', creatorAddress);
    
    // Query events for plans created by this user
    const events = await client.queryEvents({
      query: {
        MoveEventModule: {
          package: PACKAGE_ID,
          module: MODULE_NAMES.SUBSCRIPTION_MANAGER,
        }
      },
      limit: 100,
    });

    const plans: any[] = [];
    
    if (events.data) {
      for (const event of events.data) {
        if (event.type && event.type.includes('PlanCreated') && event.parsedJson) {
          const planData = event.parsedJson as any;
          
          // Filter by creator address
          if (planData.creator === creatorAddress) {
            plans.push({
              id: planData.plan_id || planData.id,
              name: planData.name,
              description: planData.description,
              price: planData.price,
              period: planData.period_in_seconds,
              creator: planData.creator,
              created_at: event.timestampMs,
            });
          }
        }
      }
    }

    return plans;
  } catch (error) {
    console.error('Error fetching user subscription plans:', error);
    return [];
  }
}; 