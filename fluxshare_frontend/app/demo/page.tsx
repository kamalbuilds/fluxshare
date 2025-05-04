'use client';

import React from 'react';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { PaymentSplitterForm } from '@/components/payment/PaymentSplitterForm';
import { SubscriptionManagerForm } from '@/components/subscription/SubscriptionManagerForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Shield, 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Blocks,
  Wallet
} from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FluxShare IOTA Integration Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience real smart contract interactions on the IOTA blockchain. 
            Connect your wallet and create payment splitters powered by Move smart contracts.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              IOTA Testnet
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Move Smart Contracts
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Production Ready
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Feeless Transactions</h3>
              <p className="text-sm text-gray-600">
                IOTA&apos;s feeless architecture makes micro-payments viable
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Move Security</h3>
              <p className="text-sm text-gray-600">
                Secure smart contracts with Move&apos;s safety guarantees
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Multi-Party Payments</h3>
              <p className="text-sm text-gray-600">
                Automatically split payments among team members
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Subscription Management</h3>
              <p className="text-sm text-gray-600">
                Recurring payment automation with transparent billing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Demo Interface */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Wallet Connection */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <WalletConnection />
              
              {/* Contract Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Blocks className="h-5 w-5" />
                    Smart Contract Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Package ID</label>
                    <code className="block text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                      0x059feebf7bbde97146ab5b2eca6c16602674e23593cfc0732c5350cfd0b68de2
                    </code>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Network</label>
                    <div className="mt-1">
                      <Badge variant="outline">IOTA Testnet</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Modules</label>
                    <div className="mt-1 space-y-1">
                      <Badge variant="outline" className="text-xs">payment_splitter</Badge>
                      <Badge variant="outline" className="text-xs">subscription_manager</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Demo Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="payment-splitter" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="payment-splitter" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Payment Splitter
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Subscriptions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payment-splitter" className="mt-6">
                <PaymentSplitterForm />
              </TabsContent>

              <TabsContent value="subscription" className="mt-6">
                <SubscriptionManagerForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* How It Works */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>How FluxShare Works on IOTA</CardTitle>
            <CardDescription>
              Understanding the integration between FluxShare and IOTA blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Connect Wallet</h3>
                <p className="text-sm text-gray-600">
                  Connect your IOTA wallet using the dApp Kit integration
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Create Splitter</h3>
                <p className="text-sm text-gray-600">
                  Define recipients and shares using Move smart contracts
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Automated Splits</h3>
                <p className="text-sm text-gray-600">
                  Payments are automatically distributed on-chain
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Built with ❤️ using IOTA dApp Kit, Move Smart Contracts, and Next.js
          </p>
        </div>
      </div>
    </div>
  );
} 