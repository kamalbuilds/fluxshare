// Contract configuration
export const PACKAGE_ID = '0x059feebf7bbde97146ab5b2eca6c16602674e23593cfc0732c5350cfd0b68de2';

// Module names
export const MODULE_NAMES = {
  PAYMENT_SPLITTER: 'payment_splitter',
  SUBSCRIPTION_MANAGER: 'subscription_manager',
  SUBSCRIPTION_REGISTRY: 'subscription_registry',
} as const;

// Function names for PaymentSplitter
export const PAYMENT_SPLITTER_FUNCTIONS = {
  INITIALIZE: 'initialize',
  CREATE_SPLITTER: 'create_splitter',
  PROCESS_PAYMENT: 'process_payment',
  UPDATE_RECIPIENTS: 'update_recipients',
  GET_SPLITTER: 'get_splitter',
  GET_ALL_SPLITTERS: 'get_all_splitters',
} as const;

// Function names for SubscriptionManager
export const SUBSCRIPTION_MANAGER_FUNCTIONS = {
  INITIALIZE: 'initialize',
  CREATE_PLAN: 'create_plan',
  SUBSCRIBE: 'subscribe',
  RENEW_SUBSCRIPTION: 'renew_subscription',
  CANCEL_SUBSCRIPTION: 'cancel_subscription',
  UPDATE_PLAN: 'update_plan',
} as const;

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 0,
  INVALID_RECIPIENT: 1,
  INVALID_SHARE: 2,
  SPLITTER_NOT_FOUND: 3,
  INSUFFICIENT_FUNDS: 4,
  SUBSCRIPTION_NOT_FOUND: 1,
  INVALID_SUBSCRIPTION_PERIOD: 3,
} as const;

// Network configuration
export const NETWORKS = {
  TESTNET: 'testnet',
  DEVNET: 'devnet',
} as const;

// Default values
export const DEFAULTS = {
  GAS_BUDGET: 10_000_000, // 10 MIOTA for gas
  MIN_SUBSCRIPTION_PERIOD: 86400, // 1 day in seconds
} as const; 