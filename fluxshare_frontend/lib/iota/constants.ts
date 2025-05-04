// Contract configuration
export const PACKAGE_ID = '0x059feebf7bbde97146ab5b2eca6c16602674e23593cfc0732c5350cfd0b68de2';

// Module names
export const MODULE_NAMES = {
  PAYMENT_SPLITTER: 'payment_splitter',
  SUBSCRIPTION_MANAGER: 'subscription_manager',
  SUBSCRIPTION_REGISTRY: 'subscription_registry'
} as const;

// Payment Splitter function names
export const PAYMENT_SPLITTER_FUNCTIONS = {
  INITIALIZE: 'initialize',
  CREATE_SPLITTER: 'create_splitter',
  PROCESS_PAYMENT: 'process_payment',
  UPDATE_RECIPIENTS: 'update_recipients',
} as const;

// Subscription Manager function names  
export const SUBSCRIPTION_MANAGER_FUNCTIONS = {
  INITIALIZE: 'initialize_registry',
  CREATE_PLAN: 'create_plan',
  SUBSCRIBE: 'subscribe',
  RENEW_SUBSCRIPTION: 'renew_subscription',
  CANCEL_SUBSCRIPTION: 'cancel_subscription',
} as const;

// Object type names for registry detection
export const OBJECT_TYPES = {
  PAYMENT_SPLITTER_REGISTRY: `${PACKAGE_ID}::payment_splitter::PaymentSplitterRegistry`,
  SUBSCRIPTION_REGISTRY: `${PACKAGE_ID}::subscription_manager::SubscriptionRegistry`,
} as const;

// Error codes
export const ERROR_CODES = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_RECIPIENT: 'INVALID_RECIPIENT',
  REGISTRY_NOT_FOUND: 'REGISTRY_NOT_FOUND',
} as const;

// Network configuration
export const NETWORKS = {
  TESTNET: 'testnet',
  DEVNET: 'devnet',
} as const;

// Default values
export const DEFAULTS = {
  GAS_BUDGET: 10_000_000,
  DEADLINE: 30,
} as const; 