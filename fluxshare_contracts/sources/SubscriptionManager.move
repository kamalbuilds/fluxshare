module fluxshare::subscription_manager {
    use std::string::String;
    use std::vector;
    use iota::object::{Self, UID};
    use iota::coin::{Self, Coin};
    use iota::transfer;
    use iota::iota::IOTA;
    use iota::tx_context::{Self, TxContext};
    use iota::event;
    
    // === Errors ===
    const EInsufficientFunds: u64 = 0;
    const ESubscriptionNotFound: u64 = 1;
    const EUnauthorized: u64 = 2;
    const EInvalidSubscriptionPeriod: u64 = 3;

    // === Structs ===
    
    /// Represents a subscription plan that customers can subscribe to
    public struct SubscriptionPlan has key, store {
        /// Unique identifier for the plan
        id: UID,
        /// Unique sequential ID for the plan
        plan_id: u64,
        /// Address of the plan creator
        owner: address,
        /// Name of the subscription plan
        name: String,
        /// Description of what the plan offers
        description: String,
        /// Price per billing period in IOTA tokens
        price: u64,
        /// Subscription period in seconds (e.g., 30 days = 2592000 seconds)
        period_in_seconds: u64,
        /// Whether the plan is currently active
        active: bool,
        /// When the plan was created (Unix timestamp)
        created_at: u64,
    }

    /// Represents a user's subscription to a plan
    public struct Subscription has key, store {
        /// Unique identifier for the subscription
        id: UID,
        /// Unique sequential ID for the subscription
        subscription_id: u64,
        /// Address of the subscriber
        subscriber: address,
        /// ID of the subscribed plan
        plan_id: u64,
        /// When the subscription started (Unix timestamp)
        start_timestamp: u64,
        /// When the next payment is due (Unix timestamp)
        next_payment_due: u64,
        /// Whether the subscription is currently active
        active: bool,
    }

    /// Registry that tracks all subscription plans and subscriptions
    public struct SubscriptionRegistry has key {
        /// Unique identifier for the registry
        id: UID,
        /// List of all subscription plans
        plans: vector<SubscriptionPlan>,
        /// List of all subscriptions
        subscriptions: vector<Subscription>,
        /// Counter for generating new plan IDs
        next_plan_id: u64,
        /// Counter for generating new subscription IDs
        next_subscription_id: u64,
    }

    // === Events ===
    public struct SubscriptionCreatedEvent has copy, drop {
        subscription_id: u64,
        subscriber: address,
        plan_id: u64,
        timestamp: u64,
    }

    public struct SubscriptionRenewedEvent has copy, drop {
        subscription_id: u64,
        subscriber: address,
        plan_id: u64,
        timestamp: u64,
    }

    public struct SubscriptionCanceledEvent has copy, drop {
        subscription_id: u64,
        subscriber: address,
        timestamp: u64,
    }

    // === Public-Mutative Functions ===
    
    /// Initialize the subscription registry
    public fun initialize(ctx: &mut TxContext) {
        let registry = SubscriptionRegistry {
            id: object::new(ctx),
            plans: vector::empty(),
            subscriptions: vector::empty(),
            next_plan_id: 0,
            next_subscription_id: 0,
        };
        
        transfer::share_object(registry);
    }

    /// Create a new subscription plan
    public fun create_plan(
        registry: &mut SubscriptionRegistry,
        name: String,
        description: String,
        price: u64,
        period_in_seconds: u64,
        ctx: &mut TxContext
    ) {
        // Validate period is at least 1 day (86400 seconds)
        assert!(period_in_seconds >= 86400, EInvalidSubscriptionPeriod);
        
        // Create the subscription plan
        let plan = SubscriptionPlan {
            id: object::new(ctx),
            plan_id: registry.next_plan_id,
            owner: tx_context::sender(ctx),
            name,
            description,
            price,
            period_in_seconds,
            active: true,
            created_at: tx_context::epoch_timestamp_ms(ctx) / 1000, // Convert from ms to seconds
        };
        
        // Add plan to registry and increment ID counter
        vector::push_back(&mut registry.plans, plan);
        registry.next_plan_id = registry.next_plan_id + 1;
    }

    /// Subscribe to a plan
    public fun subscribe(
        registry: &mut SubscriptionRegistry,
        plan_id: u64,
        payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let subscriber_addr = tx_context::sender(ctx);
        
        // Find the plan
        let plans_len = vector::length(&registry.plans);
        let mut plan_idx = 0;
        let mut found = false;
        
        while (plan_idx < plans_len) {
            let plan = vector::borrow(&registry.plans, plan_idx);
            if (plan.plan_id == plan_id && plan.active) {
                found = true;
                break;
            };
            plan_idx = plan_idx + 1;
        };
        
        assert!(found, ESubscriptionNotFound);
        
        // Get the plan details
        let plan = vector::borrow(&registry.plans, plan_idx);
        
        // Verify payment has enough funds
        assert!(coin::value(&payment) >= plan.price, EInsufficientFunds);
        
        // Transfer payment to plan owner
        transfer::public_transfer(payment, plan.owner);
        
        // Calculate next payment due date
        let current_time = tx_context::epoch_timestamp_ms(ctx) / 1000; // Convert from ms to seconds
        let next_payment = current_time + plan.period_in_seconds;
        
        // Create subscription record
        let subscription = Subscription {
            id: object::new(ctx),
            subscription_id: registry.next_subscription_id,
            subscriber: subscriber_addr,
            plan_id: plan_id,
            start_timestamp: current_time,
            next_payment_due: next_payment,
            active: true,
        };
        
        // Emit event
        event::emit(SubscriptionCreatedEvent {
            subscription_id: registry.next_subscription_id,
            subscriber: subscriber_addr,
            plan_id: plan_id,
            timestamp: current_time,
        });
        
        // Add subscription to registry and increment ID counter
        vector::push_back(&mut registry.subscriptions, subscription);
        registry.next_subscription_id = registry.next_subscription_id + 1;
    }

    /// Process a subscription renewal payment
    public fun process_renewal(
        registry: &mut SubscriptionRegistry,
        subscription_id: u64,
        payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let subscriber_addr = tx_context::sender(ctx);
        
        // Find the subscription
        let subs_len = vector::length(&registry.subscriptions);
        let mut sub_idx = 0;
        let mut found = false;
        
        while (sub_idx < subs_len) {
            let subscription = vector::borrow(&registry.subscriptions, sub_idx);
            if (subscription.subscription_id == subscription_id && subscription.subscriber == subscriber_addr) {
                found = true;
                break;
            };
            sub_idx = sub_idx + 1;
        };
        
        assert!(found, ESubscriptionNotFound);
        
        // Get the subscription and plan
        let subscription = vector::borrow_mut(&mut registry.subscriptions, sub_idx);
        
        // Find the associated plan
        let plans_len = vector::length(&registry.plans);
        let mut plan_idx = 0;
        let mut plan_found = false;
        
        while (plan_idx < plans_len) {
            let plan = vector::borrow(&registry.plans, plan_idx);
            if (plan.plan_id == subscription.plan_id) {
                plan_found = true;
                break;
            };
            plan_idx = plan_idx + 1;
        };
        
        assert!(plan_found, ESubscriptionNotFound);
        
        let plan = vector::borrow(&registry.plans, plan_idx);
        
        // Verify payment has enough funds
        assert!(coin::value(&payment) >= plan.price, EInsufficientFunds);
        
        // Transfer payment to plan owner
        transfer::public_transfer(payment, plan.owner);
        
        // Update next payment due date
        subscription.next_payment_due = subscription.next_payment_due + plan.period_in_seconds;
        
        // Emit event
        event::emit(SubscriptionRenewedEvent {
            subscription_id,
            subscriber: subscriber_addr,
            plan_id: subscription.plan_id,
            timestamp: tx_context::epoch_timestamp_ms(ctx) / 1000,
        });
    }

    /// Cancel a subscription
    public fun cancel_subscription(
        registry: &mut SubscriptionRegistry,
        subscription_id: u64,
        ctx: &mut TxContext
    ) {
        let subscriber_addr = tx_context::sender(ctx);
        
        // Find the subscription
        let subs_len = vector::length(&registry.subscriptions);
        let mut sub_idx = 0;
        let mut found = false;
        
        while (sub_idx < subs_len) {
            let subscription = vector::borrow(&registry.subscriptions, sub_idx);
            if (subscription.subscription_id == subscription_id && subscription.subscriber == subscriber_addr) {
                found = true;
                break;
            };
            sub_idx = sub_idx + 1;
        };
        
        assert!(found, ESubscriptionNotFound);
        
        // Mark subscription as inactive
        let subscription = vector::borrow_mut(&mut registry.subscriptions, sub_idx);
        subscription.active = false;
        
        // Emit event
        event::emit(SubscriptionCanceledEvent {
            subscription_id,
            subscriber: subscriber_addr,
            timestamp: tx_context::epoch_timestamp_ms(ctx) / 1000,
        });
    }
    
    // === Public-View Functions ===
    
    /// Check if a subscription exists and is active
    public fun is_subscription_active(
        registry: &SubscriptionRegistry,
        subscriber: address,
        subscription_id: u64
    ): bool {
        let subs_len = vector::length(&registry.subscriptions);
        let mut sub_idx = 0;
        
        while (sub_idx < subs_len) {
            let subscription = vector::borrow(&registry.subscriptions, sub_idx);
            if (subscription.subscription_id == subscription_id && 
                subscription.subscriber == subscriber && 
                subscription.active) {
                return true
            };
            sub_idx = sub_idx + 1;
        };
        
        false
    }
    
    /// Get the price of a subscription plan
    public fun get_plan_price(
        registry: &SubscriptionRegistry,
        plan_id: u64
    ): u64 {
        let plans_len = vector::length(&registry.plans);
        let mut plan_idx = 0;
        
        while (plan_idx < plans_len) {
            let plan = vector::borrow(&registry.plans, plan_idx);
            if (plan.plan_id == plan_id && plan.active) {
                return plan.price
            };
            plan_idx = plan_idx + 1;
        };
        
        0
    }
} 