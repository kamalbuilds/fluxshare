'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  DollarSign, 
  User, 
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSubscriptionManager } from '@/hooks/useSubscriptionManager';
import { useCurrentAccount } from '@iota/dapp-kit';
import { formatIotaAmount, hasActiveSubscription } from '@/lib/iota/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  period: number;
  creator: string;
  created_at: string;
}

interface SubscriptionPlansListProps {
  registryId: string | null;
}

export const SubscriptionPlansList: React.FC<SubscriptionPlansListProps> = ({ registryId }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [subscribingPlanId, setSubscribingPlanId] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{[key: number]: boolean}>({});
  
  const currentAccount = useCurrentAccount();
  const { subscribe, fetchSubscriptionPlans, isLoading, error, isConnected } = useSubscriptionManager();
  const { toast } = useToast();

  useEffect(() => {
    const loadPlans = async () => {
      if (registryId && isConnected) {
        setIsLoadingPlans(true);
        try {
          const fetchedPlans = await fetchSubscriptionPlans(registryId);
          setPlans(fetchedPlans);
          
          // Check subscription status for each plan
          if (currentAccount) {
            const statusChecks: {[key: number]: boolean} = {};
            for (const plan of fetchedPlans) {
              const hasSubscription = await hasActiveSubscription(registryId, currentAccount.address, plan.id);
              statusChecks[plan.id] = hasSubscription;
            }
            setSubscriptionStatus(statusChecks);
          }
        } catch (err) {
          console.error('Error loading subscription plans:', err);
        } finally {
          setIsLoadingPlans(false);
        }
      }
    };

    loadPlans();
  }, [registryId, isConnected, currentAccount, fetchSubscriptionPlans]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!currentAccount || !registryId) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and ensure registry is available',
        variant: 'destructive',
      });
      return;
    }

    if (plan.creator === currentAccount.address) {
      toast({
        title: 'Cannot Subscribe',
        description: 'You cannot subscribe to your own plan',
        variant: 'destructive',
      });
      return;
    }

    if (subscriptionStatus[plan.id]) {
      toast({
        title: 'Already Subscribed',
        description: 'You already have an active subscription to this plan',
        variant: 'destructive',
      });
      return;
    }

    setSubscribingPlanId(plan.id);

    try {
      const result = await subscribe(registryId, plan.id, plan.price);

      if (result) {
        toast({
          title: 'Success!',
          description: `Successfully subscribed to "${plan.name}"`,
        });
        
        // Update subscription status
        setSubscriptionStatus(prev => ({...prev, [plan.id]: true}));
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast({
        title: 'Subscription Failed',
        description: error || 'Failed to subscribe to plan',
        variant: 'destructive',
      });
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const formatPeriod = (periodInSeconds: number): string => {
    const days = Math.floor(periodInSeconds / (24 * 60 * 60));
    if (days === 1) return '1 day';
    if (days < 30) return `${days} days`;
    if (days === 30) return '1 month';
    const months = Math.floor(days / 30);
    return `${months} months`;
  };

  const formatCreatedAt = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString();
  };

  const getButtonState = (plan: SubscriptionPlan) => {
    if (plan.creator === currentAccount?.address) {
      return { text: 'Your Plan', variant: 'secondary' as const, disabled: true };
    }
    if (subscriptionStatus[plan.id]) {
      return { text: 'Subscribed ✓', variant: 'secondary' as const, disabled: true };
    }
    if (subscribingPlanId === plan.id) {
      return { text: 'Subscribing...', variant: 'default' as const, disabled: true };
    }
    return { text: 'Subscribe Now', variant: 'default' as const, disabled: isLoading };
  };

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view subscription plans.
        </AlertDescription>
      </Alert>
    );
  }

  if (!registryId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No subscription registry found. Please create one first.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading subscription plans...</span>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No subscription plans available yet. Be the first to create one!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Subscription Plans</h3>
        <Badge variant="secondary">{plans.length} plans</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant="outline">ID: {plan.id}</Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {formatIotaAmount(plan.price)} IOTA
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{formatPeriod(plan.period)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600 truncate">
                    {plan.creator === currentAccount?.address ? 'You' : 
                     `${plan.creator.slice(0, 6)}...${plan.creator.slice(-4)}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Created {formatCreatedAt(plan.created_at)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleSubscribe(plan)}
                {...getButtonState(plan)}
                className="w-full"
              >
                {getButtonState(plan).text}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 