"use client";
import React, { useState, useEffect } from "react";
import { SubscriptionPlansList } from "@/components/subscription/SubscriptionPlansList";
import { useSubscriptionManager } from "@/hooks/useSubscriptionManager";
import { useCurrentAccount } from "@iota/dapp-kit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { getSubscriptionRegistry } from "@/lib/iota/client";

export default function BrowseSubscriptionPlansPage() {
  const currentAccount = useCurrentAccount();
  const { isConnected } = useSubscriptionManager();
  
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);

  useEffect(() => {
    const loadRegistry = async () => {
      if (isConnected && currentAccount) {
        setIsLoadingRegistry(true);
        try {
          // Try to find user's own registry first
          const userRegistryId = await getSubscriptionRegistry(currentAccount.address);
          if (userRegistryId) {
            setRegistryId(userRegistryId);
          } else {
            // If no user registry, use a global registry ID from your example
            // In a real app, you might want to have a global registry or search for public registries
            setRegistryId("0xc4bb0f82fad9483084f4833b909cf73c5ed91e3c3490a254e362fc323721ebad");
          }
        } catch (error) {
          console.error('Error loading registry:', error);
          // Fallback to your registry ID
          setRegistryId("0xc4bb0f82fad9483084f4833b909cf73c5ed91e3c3490a254e362fc323721ebad");
        } finally {
          setIsLoadingRegistry(false);
        }
      } else {
        setIsLoadingRegistry(false);
      }
    };

    loadRegistry();
  }, [isConnected, currentAccount]);

  if (!isConnected) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Browse Subscription Plans</h1>
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your IOTA wallet to browse subscription plans
            </AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  if (isLoadingRegistry) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Browse Subscription Plans</h1>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading registry...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Subscription Plans</h1>
        <p className="text-gray-600">
          Discover and subscribe to available subscription plans on the IOTA blockchain
        </p>
        {registryId && (
          <p className="text-sm text-gray-500 mt-2">
            Registry: {registryId.slice(0, 20)}...
          </p>
        )}
      </div>

      <SubscriptionPlansList registryId={registryId} />
    </main>
  );
} 