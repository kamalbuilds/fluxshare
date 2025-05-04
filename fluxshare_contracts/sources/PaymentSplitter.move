module fluxshare::payment_splitter {
    use std::string::String;
    use std::vector;
    use iota::object::{Self, UID};
    use iota::coin::{Self, Coin};
    use iota::transfer;
    use iota::iota::IOTA;
    use iota::tx_context::{Self, TxContext};
    use iota::event;
    
    // === Errors ===
    const UNAUTHORIZED: u64 = 0;
    const INVALID_RECIPIENT: u64 = 1;
    const INVALID_SHARE: u64 = 2;
    const SPLITTER_NOT_FOUND: u64 = 3;
    const INSUFFICIENT_FUNDS: u64 = 4;

    // === Structs ===
    public struct Recipient has copy, drop, store {
        address: address,
        share: u64,
    }

    public struct PaymentSplitter has key, store {
        id: UID,
        splitter_id: u64,
        owner: address,
        name: String,
        recipients: vector<Recipient>,
        total_shares: u64,
        created_at: u64,
    }

    public struct PaymentSplitterRegistry has key {
        id: UID,
        splitters: vector<PaymentSplitter>,
        next_splitter_id: u64,
    }

    // === Events ===
    public struct SplitterCreatedEvent has copy, drop {
        splitter_id: u64,
        owner: address,
        name: String,
        timestamp: u64,
    }

    public struct PaymentProcessedEvent has copy, drop {
        splitter_id: u64,
        payer: address,
        amount: u64,
        timestamp: u64,
    }

    // === Public-Mutative Functions ===
    
    /// Initialize the payment splitter registry
    public fun initialize(ctx: &mut TxContext) {
        let registry = PaymentSplitterRegistry {
            id: object::new(ctx),
            splitters: vector::empty(),
            next_splitter_id: 0,
        };
        
        transfer::share_object(registry);
    }

    /// Create a new payment splitter
    public fun create_splitter(
        registry: &mut PaymentSplitterRegistry,
        name: String,
        recipient_addresses: vector<address>,
        recipient_shares: vector<u64>,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        let addresses_len = vector::length(&recipient_addresses);
        let shares_len = vector::length(&recipient_shares);
        
        // Must have at least one recipient and same number of addresses and shares
        assert!(addresses_len > 0, INVALID_RECIPIENT);
        assert!(addresses_len == shares_len, INVALID_RECIPIENT);
        
        // Create recipients vector and calculate total shares
        let mut recipients = vector::empty<Recipient>();
        let mut total_shares = 0;
        let mut i = 0;
        
        while (i < addresses_len) {
            let address = *vector::borrow(&recipient_addresses, i);
            let share = *vector::borrow(&recipient_shares, i);
            
            // Each share must be positive
            assert!(share > 0, INVALID_SHARE);
            
            let recipient = Recipient {
                address,
                share,
            };
            
            vector::push_back(&mut recipients, recipient);
            total_shares = total_shares + share;
            i = i + 1;
        };
        
        // Create the payment splitter
        let splitter = PaymentSplitter {
            id: object::new(ctx),
            splitter_id: registry.next_splitter_id,
            owner: tx_context::sender(ctx),
            name,
            recipients,
            total_shares,
            created_at: tx_context::epoch_timestamp_ms(ctx) / 1000, // Convert ms to seconds
        };
        
        // Emit event
        event::emit(SplitterCreatedEvent {
            splitter_id: registry.next_splitter_id,
            owner: tx_context::sender(ctx),
            name,
            timestamp: tx_context::epoch_timestamp_ms(ctx) / 1000,
        });
        
        // Add splitter to registry and increment ID counter
        vector::push_back(&mut registry.splitters, splitter);
        registry.next_splitter_id = registry.next_splitter_id + 1;
    }

    /// Process a payment through a splitter
    public fun process_payment(
        registry: &PaymentSplitterRegistry,
        splitter_id: u64,
        mut payment: Coin<IOTA>,
        ctx: &mut TxContext
    ) {
        let payer = tx_context::sender(ctx);
        
        // Find the splitter
        let splitters_len = vector::length(&registry.splitters);
        let mut splitter_idx = 0;
        let mut found = false;
        
        while (splitter_idx < splitters_len) {
            let splitter = vector::borrow(&registry.splitters, splitter_idx);
            if (splitter.splitter_id == splitter_id) {
                found = true;
                break;
            };
            splitter_idx = splitter_idx + 1;
        };
        
        assert!(found, SPLITTER_NOT_FOUND);
        
        // Get the splitter details
        let splitter = vector::borrow(&registry.splitters, splitter_idx);
        
        // Get payment amount
        let payment_amount = coin::value(&payment);
        
        // Calculate and distribute shares
        let recipients_len = vector::length(&splitter.recipients);
        let mut i = 0;
        
        while (i < recipients_len) {
            let recipient = vector::borrow(&splitter.recipients, i);
            
            // Calculate recipient's share of payment
            let share_amount = (payment_amount * recipient.share) / splitter.total_shares;
            
            if (share_amount > 0) {
                let recipient_payment = coin::split(&mut payment, share_amount, ctx);
                transfer::public_transfer(recipient_payment, recipient.address);
            };
            
            i = i + 1;
        };
        
        // Send any remaining dust to the first recipient (could be due to rounding)
        if (coin::value(&payment) > 0) {
            let first_recipient = vector::borrow(&splitter.recipients, 0);
            transfer::public_transfer(payment, first_recipient.address);
        } else {
            // If nothing left, just destroy the empty coin
            coin::destroy_zero(payment);
        };
        
        // Emit payment processed event
        event::emit(PaymentProcessedEvent {
            splitter_id,
            payer,
            amount: payment_amount,
            timestamp: tx_context::epoch_timestamp_ms(ctx) / 1000,
        });
    }

    /// Update recipients for a payment splitter
    public fun update_recipients(
        registry: &mut PaymentSplitterRegistry,
        splitter_id: u64,
        recipient_addresses: vector<address>,
        recipient_shares: vector<u64>,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        let addresses_len = vector::length(&recipient_addresses);
        let shares_len = vector::length(&recipient_shares);
        
        // Must have at least one recipient and same number of addresses and shares
        assert!(addresses_len > 0, INVALID_RECIPIENT);
        assert!(addresses_len == shares_len, INVALID_RECIPIENT);
        
        // Find the splitter
        let splitters_len = vector::length(&registry.splitters);
        let mut splitter_idx = 0;
        let mut found = false;
        
        while (splitter_idx < splitters_len) {
            let splitter = vector::borrow(&registry.splitters, splitter_idx);
            if (splitter.splitter_id == splitter_id) {
                found = true;
                break;
            };
            splitter_idx = splitter_idx + 1;
        };
        
        assert!(found, SPLITTER_NOT_FOUND);
        
        // Verify ownership
        let splitter = vector::borrow_mut(&mut registry.splitters, splitter_idx);
        assert!(splitter.owner == tx_context::sender(ctx), UNAUTHORIZED);
        
        // Create new recipients vector and calculate total shares
        let mut recipients = vector::empty<Recipient>();
        let mut total_shares = 0;
        let mut i = 0;
        
        while (i < addresses_len) {
            let address = *vector::borrow(&recipient_addresses, i);
            let share = *vector::borrow(&recipient_shares, i);
            
            // Each share must be positive
            assert!(share > 0, INVALID_SHARE);
            
            let recipient = Recipient {
                address,
                share,
            };
            
            vector::push_back(&mut recipients, recipient);
            total_shares = total_shares + share;
            i = i + 1;
        };
        
        // Update splitter
        splitter.recipients = recipients;
        splitter.total_shares = total_shares;
    }
    
    // === Public-View Functions ===
    
    /// Get the owner of a payment splitter
    public fun get_splitter_owner(
        registry: &PaymentSplitterRegistry,
        splitter_id: u64
    ): address {
        let splitters_len = vector::length(&registry.splitters);
        let mut splitter_idx = 0;
        
        while (splitter_idx < splitters_len) {
            let splitter = vector::borrow(&registry.splitters, splitter_idx);
            if (splitter.splitter_id == splitter_id) {
                return splitter.owner
            };
            splitter_idx = splitter_idx + 1;
        };
        
        @0x0 // Return zero address if not found
    }
    
    /// Get the number of recipients in a splitter
    public fun get_recipient_count(
        registry: &PaymentSplitterRegistry,
        splitter_id: u64
    ): u64 {
        let splitters_len = vector::length(&registry.splitters);
        let mut splitter_idx = 0;
        
        while (splitter_idx < splitters_len) {
            let splitter = vector::borrow(&registry.splitters, splitter_idx);
            if (splitter.splitter_id == splitter_id) {
                return vector::length(&splitter.recipients)
            };
            splitter_idx = splitter_idx + 1;
        };
        
        0 // Return 0 if not found
    }
} 