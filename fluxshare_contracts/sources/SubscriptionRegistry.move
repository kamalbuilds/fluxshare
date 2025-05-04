module fluxshare::subscription_registry {
    use iota::object::{Self, UID};
    use iota::tx_context::{Self, TxContext};
    use iota::event;
    use iota::transfer;
    
    // === Structs ===
    public struct SubscriptionStats has key, store {
        id: UID,
        active_subscriptions: u64,
        total_subscriptions: u64,
        total_payments: u64,
        total_revenue: u64,
        last_updated: u64,
    }
    
    // === Events ===
    public struct SubscriptionCreatedEvent has copy, drop {
        subscription_id: u64,
        subscriber: address,
        plan_id: u64,
        timestamp: u64,
    }
    
    public struct SubscriptionCanceledEvent has copy, drop {
        subscription_id: u64,
        subscriber: address,
        plan_id: u64,
        timestamp: u64,
    }
    
    public struct PaymentProcessedEvent has copy, drop {
        subscription_id: u64,
        subscriber: address,
        plan_id: u64,
        amount: u64,
        timestamp: u64,
    }
    
    // === Public-Mutative Functions ===
    
    /// Initialize a new subscription statistics tracker
    public fun initialize(ctx: &mut TxContext) {
        let stats = SubscriptionStats {
            id: object::new(ctx),
            active_subscriptions: 0,
            total_subscriptions: 0,
            total_payments: 0,
            total_revenue: 0,
            last_updated: tx_context::epoch_timestamp_ms(ctx) / 1000, // Convert ms to seconds
        };
        
        transfer::share_object(stats);
    }
    
    /// Record a new subscription
    public fun record_subscription_created(
        stats: &mut SubscriptionStats,
        subscription_id: u64,
        subscriber: address,
        plan_id: u64,
        ctx: &mut TxContext
    ) {
        // Update stats
        stats.active_subscriptions = stats.active_subscriptions + 1;
        stats.total_subscriptions = stats.total_subscriptions + 1;
        stats.last_updated = tx_context::epoch_timestamp_ms(ctx) / 1000;
        
        // Emit event
        event::emit(SubscriptionCreatedEvent {
            subscription_id,
            subscriber,
            plan_id,
            timestamp: tx_context::epoch_timestamp_ms(ctx) / 1000,
        });
    }
    
    /// Record a subscription cancellation
    public fun record_subscription_canceled(
        stats: &mut SubscriptionStats,
        subscription_id: u64,
        subscriber: address,
        plan_id: u64,
        ctx: &mut TxContext
    ) {
        // Update stats
        if (stats.active_subscriptions > 0) {
            stats.active_subscriptions = stats.active_subscriptions - 1;
        };
        stats.last_updated = tx_context::epoch_timestamp_ms(ctx) / 1000;
        
        // Emit event
        event::emit(SubscriptionCanceledEvent {
            subscription_id,
            subscriber,
            plan_id,
            timestamp: tx_context::epoch_timestamp_ms(ctx) / 1000,
        });
    }
    
    /// Record a payment for a subscription
    public fun record_payment_processed(
        stats: &mut SubscriptionStats,
        subscription_id: u64,
        subscriber: address,
        plan_id: u64,
        amount: u64,
        ctx: &mut TxContext
    ) {
        // Update stats
        stats.total_payments = stats.total_payments + 1;
        stats.total_revenue = stats.total_revenue + amount;
        stats.last_updated = tx_context::epoch_timestamp_ms(ctx) / 1000;
        
        // Emit event
        event::emit(PaymentProcessedEvent {
            subscription_id,
            subscriber,
            plan_id,
            amount,
            timestamp: tx_context::epoch_timestamp_ms(ctx) / 1000,
        });
    }
    
    // === Public-View Functions ===
    
    /// Get subscription statistics
    public fun get_subscription_stats(stats: &SubscriptionStats): (u64, u64, u64, u64) {
        (
            stats.active_subscriptions,
            stats.total_subscriptions,
            stats.total_payments,
            stats.total_revenue
        )
    }
} 