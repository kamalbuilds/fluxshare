// Types for PaymentSplitter contract
export interface Recipient {
  address: string;
  share: number;
}

export interface PaymentSplitter {
  id: string;
  splitter_id: number;
  owner: string;
  name: string;
  recipients: Recipient[];
  total_shares: number;
  created_at: number;
}

export interface PaymentSplitterRegistry {
  id: string;
  splitters: PaymentSplitter[];
  next_splitter_id: number;
}

// Types for SubscriptionManager contract
export interface SubscriptionPlan {
  id: string;
  plan_id: number;
  owner: string;
  name: string;
  description: string;
  price: string; // Using string for bigint values
  period_in_seconds: number;
  active: boolean;
  created_at: number;
}

export interface Subscription {
  id: string;
  subscription_id: number;
  subscriber: string;
  plan_id: number;
  start_timestamp: number;
  next_payment_due: number;
  active: boolean;
}

export interface SubscriptionRegistry {
  id: string;
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  next_plan_id: number;
  next_subscription_id: number;
}

// Events
export interface SplitterCreatedEvent {
  splitter_id: number;
  owner: string;
  name: string;
  timestamp: number;
}

export interface PaymentProcessedEvent {
  splitter_id: number;
  payer: string;
  amount: string;
  timestamp: number;
}

export interface SubscriptionCreatedEvent {
  subscription_id: number;
  subscriber: string;
  plan_id: number;
  timestamp: number;
}

export interface SubscriptionRenewedEvent {
  subscription_id: number;
  subscriber: string;
  plan_id: number;
  timestamp: number;
}

// Transaction types
export interface CreateSplitterParams {
  name: string;
  recipient_addresses: string[];
  recipient_shares: number[];
}

export interface ProcessPaymentParams {
  splitter_id: number;
  amount: string;
}

export interface CreateSubscriptionPlanParams {
  name: string;
  description: string;
  price: string;
  period_in_seconds: number;
}

export interface SubscribeParams {
  plan_id: number;
  payment_amount: string;
}

// Transaction result types
export interface TransactionResult {
  digest: string;
  effects?: any;
  objectChanges?: any;
} 