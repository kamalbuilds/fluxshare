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
  Clock,
  Loader2
} from 'lucide-react';
import { useSubscriptionManager } from '@/hooks/useSubscriptionManager';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { createSubscriptionRegistryTransaction, parseIotaAmount, formatIotaAmount, getSubscriptionRegistry, getIotaClient } from '@/lib/iota/client';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPlansList } from './SubscriptionPlansList';

export const SubscriptionManagerForm = () => {
  // State for subscription creation
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planPeriod, setPlanPeriod] = useState('30'); // days
  const [subscriptionPlanId, setSubscriptionPlanId] = useState('');
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  
  // State for subscribing to plans
  const [planId, setPlanId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  
  // Registry management
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [needsRegistry, setNeedsRegistry] = useState(false);
  const [isCreatingRegistry, setIsCreatingRegistry] = useState(false);
  const [isCheckingRegistry, setIsCheckingRegistry] = useState(true);
  const [activeTab, setActiveTab] = useState('create');
  
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

  // Check for existing registry on mount and account change
  useEffect(() => {
    const checkRegistryStatus = async () => {
      if (isConnected && currentAccount) {
        setIsCheckingRegistry(true);
        
        try {
          // First check blockchain for existing registry
          const existingRegistryId = await getSubscriptionRegistry(currentAccount.address);
          
          if (existingRegistryId) {
            setRegistryId(existingRegistryId);
            setNeedsRegistry(false);
            // Also update localStorage for future reference
            localStorage.setItem(`subscription-registry-${currentAccount.address}`, existingRegistryId);
          } else {
            // Check localStorage as backup
            const storedRegistryId = localStorage.getItem(`subscription-registry-${currentAccount.address}`);
            if (storedRegistryId) {
              // Verify the stored ID still exists on blockchain
              try {
                const client = getIotaClient();
                await client.getObject({ id: storedRegistryId });
                setRegistryId(storedRegistryId);
                setNeedsRegistry(false);
              } catch {
                // Stored registry doesn't exist anymore, clear it
                localStorage.removeItem(`subscription-registry-${currentAccount.address}`);
                setNeedsRegistry(true);
              }
            } else {
              setNeedsRegistry(true);
            }
          }
        } catch (error) {
          console.error('Error checking registry status:', error);
          // Fall back to localStorage check
          const storedRegistryId = localStorage.getItem(`subscription-registry-${currentAccount.address}`);
          if (storedRegistryId) {
            setRegistryId(storedRegistryId);
            setNeedsRegistry(false);
          } else {
            setNeedsRegistry(true);
          }
        } finally {
          setIsCheckingRegistry(false);
        }
      } else {
        setIsCheckingRegistry(false);
      }
    };

    checkRegistryStatus();
  }, [isConnected, currentAccount]);

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
              const newRegistryId = registry.reference.objectId;
              setRegistryId(newRegistryId);
              setNeedsRegistry(false);
              
              // Persist registry ID in localStorage
              localStorage.setItem(`subscription-registry-${currentAccount.address}`, newRegistryId);
              
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
      }, registryId);

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

    if (!registryId) {
      toast({
        title: 'No Registry',
        description: 'Please create a subscription registry first',
        variant: 'destructive',
      });
      return;
    }

    if (!planId.trim() || !paymentAmount.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in both plan ID and payment amount',
        variant: 'destructive',
      });
      return;
    }

    const amountNumber = parseFloat(paymentAmount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }

    const planIdNumber = parseInt(planId);
    if (isNaN(planIdNumber) || planIdNumber < 0) {
      toast({
        title: 'Invalid Plan ID',
        description: 'Please enter a valid plan ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      const amountInNanos = parseIotaAmount(paymentAmount);
      const result = await subscribe(registryId, planIdNumber, amountInNanos.toString());

      if (result) {
        toast({
          title: 'Success!',
          description: `Successfully subscribed to plan ${planId}`,
        });
        
        // Clear form
        setPlanId('');
        setPaymentAmount('');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast({
        title: 'Subscription Failed',
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

  if (isCheckingRegistry) {
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
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span>Checking for existing registries...</span>
          </div>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Plan</TabsTrigger>
            <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
            <TabsTrigger value="browse">Browse Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  placeholder="e.g., Premium Plan"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="planDescription">Description</Label>
                <Textarea
                  id="planDescription"
                  placeholder="Describe what this plan offers..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planPrice">Price (IOTA)</Label>
                  <Input
                    id="planPrice"
                    type="number"
                    placeholder="0.1"
                    step="0.01"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="planPeriod">Period (Days)</Label>
                  <Input
                    id="planPeriod"
                    type="number"
                    placeholder="30"
                    value={planPeriod}
                    onChange={(e) => setPlanPeriod(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreatePlan} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Plan...
                  </>
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
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Manual subscription by Plan ID. Try the "Browse Plans" tab for a better experience!
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="planId">Plan ID</Label>
                <Input
                  id="planId"
                  type="number"
                  placeholder="0"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="paymentAmount">Payment Amount (IOTA)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="0.1"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSubscribe} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe to Plan
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <SubscriptionPlansList registryId={registryId} />
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