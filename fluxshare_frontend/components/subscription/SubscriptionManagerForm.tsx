'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Database, 
  Plus,
  CreditCard,
  Clock
} from 'lucide-react';
import { useSubscriptionManager } from '@/hooks/useSubscriptionManager';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { createSubscriptionRegistryTransaction, parseIotaAmount, formatIotaAmount } from '@/lib/iota/client';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionManagerForm = () => {
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planPeriod, setPlanPeriod] = useState('30'); // days
  const [subscriptionPlanId, setSubscriptionPlanId] = useState('');
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [needsRegistry, setNeedsRegistry] = useState(false);
  const [isCreatingRegistry, setIsCreatingRegistry] = useState(false);
  
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { 
    createPlan, 
    subscribe, 
    renewSubscription, 
    cancelSubscription,
    isLoading, 
    error, 
    isConnected 
  } = useSubscriptionManager();
  const { toast } = useToast();

  // Check if we need to create a registry
  useEffect(() => {
    if (isConnected) {
      // In a real app, you'd check if a registry exists
      // For now, we'll assume we need to create one
      setNeedsRegistry(true);
    }
  }, [isConnected]);

  const handleCreateRegistry = async () => {
    if (!currentAccount) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingRegistry(true);

    try {
      const transaction = createSubscriptionRegistryTransaction();
      
      const result = await signAndExecuteTransaction({
        transaction,
      });

      if (result) {
        // Extract the registry ID from the transaction effects
        const effects = result.effects;
        if (effects && typeof effects === 'object' && 'created' in effects) {
          const createdObjects = (effects as any).created;
          if (createdObjects && createdObjects.length > 0) {
            const registry = createdObjects.find((obj: any) => 
              obj.reference?.objectId
            );
            if (registry) {
              setRegistryId(registry.reference.objectId);
              setNeedsRegistry(false);
              toast({
                title: 'Success!',
                description: 'Subscription registry created successfully',
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Registry creation error:', err);
      toast({
        title: 'Error',
        description: 'Failed to create subscription registry',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingRegistry(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (!registryId) {
      toast({
        title: 'No Registry',
        description: 'Please create a subscription registry first',
        variant: 'destructive',
      });
      return;
    }

    if (!planName.trim() || !planDescription.trim() || !planPrice.trim() || !planPeriod.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all plan details',
        variant: 'destructive',
      });
      return;
    }

    const priceNumber = parseFloat(planPrice);
    const periodNumber = parseInt(planPeriod);

    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(periodNumber) || periodNumber < 1) {
      toast({
        title: 'Invalid Period',
        description: 'Period must be at least 1 day',
        variant: 'destructive',
      });
      return;
    }

    try {
      const priceInSmallestUnit = parseIotaAmount(planPrice);
      const periodInSeconds = periodNumber * 24 * 60 * 60; // Convert days to seconds

      const result = await createPlan({
        name: planName,
        description: planDescription,
        price: priceInSmallestUnit.toString(),
        period_in_seconds: periodInSeconds,
      });

      if (result) {
        toast({
          title: 'Success!',
          description: `Subscription plan "${planName}" created successfully`,
        });
        
        // Reset form
        setPlanName('');
        setPlanDescription('');
        setPlanPrice('');
        setPlanPeriod('30');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to create subscription plan',
        variant: 'destructive',
      });
    }
  };

  const handleSubscribe = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (!subscriptionPlanId.trim() || !subscriptionAmount.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter plan ID and payment amount',
        variant: 'destructive',
      });
      return;
    }

    const planId = parseInt(subscriptionPlanId);
    const amount = parseFloat(subscriptionAmount);

    if (isNaN(planId) || planId < 0) {
      toast({
        title: 'Invalid Plan ID',
        description: 'Please enter a valid plan ID',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await subscribe(planId, subscriptionAmount);

      if (result) {
        toast({
          title: 'Success!',
          description: `Successfully subscribed to plan ${planId}`,
        });
        
        // Reset form
        setSubscriptionPlanId('');
        setSubscriptionAmount('');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to subscribe to plan',
        variant: 'destructive',
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Subscription Manager
          </CardTitle>
          <CardDescription>
            Create subscription plans and manage recurring payments
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your IOTA wallet to manage subscriptions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (needsRegistry) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Initialize Subscription Registry
          </CardTitle>
          <CardDescription>
            Create a registry to manage subscription plans on the IOTA blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Before creating subscription plans, you need to initialize a registry contract. 
              This is a one-time setup that creates a shared object to manage all subscription plans.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleCreateRegistry}
            disabled={isCreatingRegistry}
            className="w-full"
          >
            {isCreatingRegistry ? (
              'Creating Registry...'
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Create Subscription Registry
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Subscription Manager
        </CardTitle>
        <CardDescription>
          Create subscription plans and manage recurring payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Registry Info */}
        {registryId && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Registry ID:</strong> <code className="text-sm">{registryId.slice(0, 20)}...</code>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="create-plan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create-plan">Create Plan</TabsTrigger>
            <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
          </TabsList>

          <TabsContent value="create-plan" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g., Premium Plan"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  placeholder="Describe what this plan offers..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-price">Price (IOTA)</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    step="0.000000001"
                    min="0"
                    placeholder="0.1"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-period">Period (Days)</Label>
                  <Input
                    id="plan-period"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={planPeriod}
                    onChange={(e) => setPlanPeriod(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreatePlan}
                disabled={isLoading || !registryId}
                className="w-full"
              >
                {isLoading ? (
                  'Creating Plan...'
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Subscription Plan
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="subscribe" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subscription-plan-id">Plan ID</Label>
                <Input
                  id="subscription-plan-id"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={subscriptionPlanId}
                  onChange={(e) => setSubscriptionPlanId(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription-amount">Payment Amount (IOTA)</Label>
                <Input
                  id="subscription-amount"
                  type="number"
                  step="0.000000001"
                  min="0"
                  placeholder="0.1"
                  value={subscriptionAmount}
                  onChange={(e) => setSubscriptionAmount(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button 
                onClick={handleSubscribe}
                disabled={isLoading || !registryId}
                className="w-full"
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe to Plan
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 