"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { connectWallet, disconnectWallet, getWalletAddress } from "@/lib/iota/client";
import { useToast } from "./ui/use-toast";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if wallet is already connected
    const address = getWalletAddress();
    if (address) {
      setWalletAddress(address);
    }
  }, []);
  
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const address = await connectWallet();
      setWalletAddress(address);
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
        variant: "default",
      });
      
      if (onConnect) {
        onConnect(address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setWalletAddress(null);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
        variant: "default",
      });
      
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect your wallet. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="flex items-center space-x-2">
      {walletAddress ? (
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm font-medium">
            {formatAddress(walletAddress)}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnectWallet}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          variant="default"
          onClick={handleConnectWallet}
          disabled={isConnecting}
          className="bg-primary hover:bg-primary/90"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
} 