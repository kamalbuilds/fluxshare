'use client';

import React from 'react';
import { ConnectButton, useCurrentAccount } from '@iota/dapp-kit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Wallet, LogOut } from 'lucide-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useToast } from '@/hooks/use-toast';

export const WalletConnection = () => {
  const currentAccount = useCurrentAccount();
  const { formattedBalance, isLoading, coinsCount } = useWalletBalance();
  const { toast } = useToast();

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!currentAccount) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>
            Connect your IOTA wallet to start using FluxShare
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ConnectButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Connected
          </Badge>
        </CardTitle>
        <CardDescription>
          Your IOTA wallet is connected and ready to use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-md">
              {shortenAddress(currentAccount.address)}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyAddress}
              className="p-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Balance</label>
          <div className="px-3 py-2 text-sm bg-gray-100 rounded-md">
            {isLoading ? (
              <span className="text-gray-500">Loading...</span>
            ) : (
              <span className="font-mono">
                {formattedBalance} IOTA
              </span>
            )}
          </div>
        </div>

        {/* Coins Count */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Available Coins</label>
          <div className="px-3 py-2 text-sm bg-gray-100 rounded-md">
            {coinsCount} coin{coinsCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Disconnect Button */}
        <div className="pt-4 border-t">
          <ConnectButton />
        </div>
      </CardContent>
    </Card>
  );
}; 