'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Users, DollarSign, AlertCircle, Database } from 'lucide-react';
import { usePaymentSplitter } from '@/hooks/usePaymentSplitter';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { createPaymentSplitterRegistryTransaction, getPaymentSplitterRegistry } from '@/lib/iota/client';
import { useToast } from '@/hooks/use-toast';
import { getIotaClient } from '@/lib/iota/client';

interface Recipient {
  address: string;
  share: number;
}

export const PaymentSplitterForm = () => {
  const [splitterName, setSplitterName] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: '', share: 50 },
    { address: '', share: 50 }
  ]);
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [needsRegistry, setNeedsRegistry] = useState(false);
  const [isCreatingRegistry, setIsCreatingRegistry] = useState(false);
  const [isCheckingRegistry, setIsCheckingRegistry] = useState(true);
  
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { createSplitter, processPayment, isLoading, error, isConnected } = usePaymentSplitter();
  const { toast } = useToast();

  // Check for existing registry on mount and account change
  useEffect(() => {
    const checkRegistryStatus = async () => {
      if (isConnected && currentAccount) {
        setIsCheckingRegistry(true);
        
        try {
          // First check blockchain for existing registry
          const existingRegistryId = await getPaymentSplitterRegistry(currentAccount.address);
          
          if (existingRegistryId) {
            setRegistryId(existingRegistryId);
            setNeedsRegistry(false);
            // Also update localStorage for future reference
            localStorage.setItem(`payment-splitter-registry-${currentAccount.address}`, existingRegistryId);
          } else {
            // Check localStorage as backup
            const storedRegistryId = localStorage.getItem(`payment-splitter-registry-${currentAccount.address}`);
            if (storedRegistryId) {
              // Verify the stored ID still exists on blockchain
              try {
                const client = getIotaClient();
                await client.getObject({ id: storedRegistryId });
                setRegistryId(storedRegistryId);
                setNeedsRegistry(false);
              } catch {
                // Stored registry doesn't exist anymore, clear it
                localStorage.removeItem(`payment-splitter-registry-${currentAccount.address}`);
                setNeedsRegistry(true);
              }
            } else {
              setNeedsRegistry(true);
            }
          }
        } catch (error) {
          console.error('Error checking registry status:', error);
          // Fall back to localStorage check
          const storedRegistryId = localStorage.getItem(`payment-splitter-registry-${currentAccount.address}`);
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

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', share: 0 }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string | number) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const getTotalShares = () => {
    return recipients.reduce((total, recipient) => total + recipient.share, 0);
  };

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
      const transaction = createPaymentSplitterRegistryTransaction();
      
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
              localStorage.setItem(`payment-splitter-registry-${currentAccount.address}`, newRegistryId);
              
              toast({
                title: 'Success!',
                description: 'Payment splitter registry created successfully',
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Registry creation error:', err);
      toast({
        title: 'Error',
        description: 'Failed to create payment splitter registry',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingRegistry(false);
    }
  };

  const handleCreateSplitter = async () => {
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
        description: 'Please create a payment splitter registry first',
        variant: 'destructive',
      });
      return;
    }

    if (!splitterName.trim()) {
      toast({
        title: 'Missing Name',
        description: 'Please enter a name for the payment splitter',
        variant: 'destructive',
      });
      return;
    }

    if (recipients.some(r => !r.address.trim() || r.share <= 0)) {
      toast({
        title: 'Invalid Recipients',
        description: 'All recipients must have valid addresses and positive shares',
        variant: 'destructive',
      });
      return;
    }

    if (getTotalShares() !== 100) {
      toast({
        title: 'Invalid Shares',
        description: 'Total shares must equal 100%',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createSplitter({
        name: splitterName,
        recipient_addresses: recipients.map(r => r.address),
        recipient_shares: recipients.map(r => r.share),
      }, registryId);

      if (result) {
        toast({
          title: 'Success!',
          description: `Payment splitter "${splitterName}" created successfully`,
        });
        
        // Reset form
        setSplitterName('');
        setRecipients([
          { address: '', share: 50 },
          { address: '', share: 50 }
        ]);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to create payment splitter',
        variant: 'destructive',
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Payment Splitter
          </CardTitle>
          <CardDescription>
            Set up automatic payment distribution among multiple recipients
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your IOTA wallet to create a payment splitter.
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
            <Users className="h-5 w-5" />
            Create Payment Splitter
          </CardTitle>
          <CardDescription>
            Set up automatic payment distribution among multiple recipients
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
            Initialize Payment Splitter Registry
          </CardTitle>
          <CardDescription>
            Create a registry to manage payment splitters on the IOTA blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Before creating payment splitters, you need to initialize a registry contract. 
              This is a one-time setup that creates a shared object to manage all payment splitters.
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
                Create Payment Splitter Registry
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
          <Users className="h-5 w-5" />
          Create Payment Splitter
        </CardTitle>
        <CardDescription>
          Set up automatic payment distribution among multiple recipients
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

        {/* Splitter Name */}
        <div className="space-y-2">
          <Label htmlFor="splitter-name">Splitter Name</Label>
          <Input
            id="splitter-name"
            placeholder="e.g., Team Revenue Split"
            value={splitterName}
            onChange={(e) => setSplitterName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Recipients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Recipients</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRecipient}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </div>

          {recipients.map((recipient, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor={`address-${index}`}>Address</Label>
                <Input
                  id={`address-${index}`}
                  placeholder="0x..."
                  value={recipient.address}
                  onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="w-24">
                <Label htmlFor={`share-${index}`}>Share %</Label>
                <Input
                  id={`share-${index}`}
                  type="number"
                  min="1"
                  max="100"
                  value={recipient.share}
                  onChange={(e) => updateRecipient(index, 'share', parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRecipient(index)}
                disabled={isLoading || recipients.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Total Shares Display */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Total Shares:</span>
          <Badge 
            variant={getTotalShares() === 100 ? "default" : "destructive"}
          >
            {getTotalShares()}%
          </Badge>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Button */}
        <Button 
          onClick={handleCreateSplitter}
          disabled={isLoading || !isConnected || getTotalShares() !== 100 || !registryId}
          className="w-full"
        >
          {isLoading ? (
            'Creating...'
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Create Payment Splitter
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}; 