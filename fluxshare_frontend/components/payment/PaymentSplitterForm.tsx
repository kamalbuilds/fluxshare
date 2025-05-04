'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Users, DollarSign, AlertCircle, Database, Loader2 } from 'lucide-react';
import { usePaymentSplitter } from '@/hooks/usePaymentSplitter';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { createPaymentSplitterRegistryTransaction, getPaymentSplitterRegistry, createPaymentSplitterTransaction } from '@/lib/iota/client';
import { useToast } from '@/hooks/use-toast';
import { getIotaClient } from '@/lib/iota/client';

interface Recipient {
  address: string;
  share: number;
}

export const PaymentSplitterForm = () => {
  const [name, setName] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: '', share: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingRegistry, setIsCheckingRegistry] = useState(true);
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [isCreatingRegistry, setIsCreatingRegistry] = useState(false);

  const currentAccount = useCurrentAccount();
  const { toast } = useToast();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Check for existing payment splitter registry
  useEffect(() => {
    const checkRegistry = async () => {
      if (currentAccount) {
        setIsCheckingRegistry(true);
        try {
          const existingRegistry = await getPaymentSplitterRegistry(currentAccount.address);
          setRegistryId(existingRegistry);
          console.log('Payment splitter registry found:', existingRegistry);
        } catch (error) {
          console.error('Error checking registry:', error);
        } finally {
          setIsCheckingRegistry(false);
        }
      } else {
        setIsCheckingRegistry(false);
      }
    };

    checkRegistry();
  }, [currentAccount]);

  const createRegistry = async () => {
    if (!currentAccount) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to create a registry',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingRegistry(true);

    try {
      const transaction = createPaymentSplitterRegistryTransaction();

      signAndExecuteTransaction(
        { transaction },
        {
          onSuccess: async (result: any) => {
            console.log('Registry creation transaction result:', result);
            
            // Extract registry ID from effects.created array
            if (result.effects?.created && Array.isArray(result.effects.created)) {
              const createdRegistry = result.effects.created.find((created: any) => 
                created.reference?.objectId
              );
              
              if (createdRegistry?.reference?.objectId) {
                setRegistryId(createdRegistry.reference.objectId);
                toast({
                  title: "Success!",
                  description: "Payment splitter registry created successfully",
                });
              }
            }
          },
          onError: (error: any) => {
            console.error('Registry creation failed:', error);
            toast({
              title: 'Creation Failed',
              description: error.message || 'Failed to create payment splitter registry',
              variant: 'destructive',
            });
          },
        }
      );
    } catch (error) {
      console.error('Error creating registry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment splitter registry',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingRegistry(false);
    }
  };

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

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Plan name is required';
    
    if (recipients.length === 0) return 'At least one recipient is required';
    
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      if (!recipient.address.trim()) return `Recipient ${i + 1} address is required`;
      if (recipient.share <= 0) return `Recipient ${i + 1} share must be greater than 0`;
    }
    
    const totalShares = recipients.reduce((sum, r) => sum + r.share, 0);
    if (totalShares !== 100) return `Total shares must equal 100% (currently ${totalShares}%)`;
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAccount) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to create a payment splitter',
        variant: 'destructive',
      });
      return;
    }

    if (!registryId) {
      toast({
        title: 'Registry Required',
        description: 'Please initialize the payment splitter registry first',
        variant: 'destructive',
      });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const recipientAddresses = recipients.map(r => r.address);
      const recipientShares = recipients.map(r => r.share);

      const transaction = createPaymentSplitterTransaction(registryId, {
        name,
        recipient_addresses: recipientAddresses,
        recipient_shares: recipientShares,
      });

      signAndExecuteTransaction(
        { transaction },
        {
          onSuccess: (result: any) => {
            console.log('Payment splitter creation successful:', result);
            toast({
              title: 'Success!',
              description: `Payment splitter "${name}" created successfully`,
            });
            
            // Reset form
            setName('');
            setRecipients([{ address: '', share: 0 }]);
          },
          onError: (error: any) => {
            console.error('Payment splitter creation failed:', error);
            toast({
              title: 'Creation Failed',
              description: error.message || 'Failed to create payment splitter',
              variant: 'destructive',
            });
          },
        }
      );
    } catch (error) {
      console.error('Error creating payment splitter:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment splitter',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your IOTA wallet to create payment splitters
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isCheckingRegistry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking Registry...
          </CardTitle>
          <CardDescription>
            Checking for existing payment splitter registry
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!registryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Initialize Payment Splitter Registry</CardTitle>
          <CardDescription>
            Create a registry to manage payment splitters on the IOTA blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Before creating payment splitters, you need to initialize a registry contract. This is a one-time setup that creates a shared object to manage all payment splitters.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={createRegistry}
            disabled={isCreatingRegistry}
            className="w-full"
          >
            {isCreatingRegistry ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Registry...
              </>
            ) : (
              'Initialize Payment Splitter Registry'
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <span className="text-sm font-medium text-green-500">Total Shares:</span>
          <Badge 
            variant={recipients.reduce((total, recipient) => total + recipient.share, 0) === 100 ? "default" : "destructive"}
          >
            {recipients.reduce((total, recipient) => total + recipient.share, 0)}%
          </Badge>
        </div>

        {/* Error Display */}
        {isLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isLoading ? 'Creating payment splitter...' : 'Failed to create payment splitter'}
            </AlertDescription>
          </Alert>
        )}

        {/* Create Button */}
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !currentAccount || recipients.reduce((total, recipient) => total + recipient.share, 0) !== 100 || !registryId}
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