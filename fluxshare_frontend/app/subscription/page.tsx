"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@iota/dapp-kit";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Manager</h1>
          <p className="text-gray-500">Create and manage automated subscription plans on the IOTA blockchain</p>
        </div>
        <ConnectButton />
      </div>

      <Tabs defaultValue="create" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Subscription</TabsTrigger>
          <TabsTrigger value="manage">Manage Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Subscription Plan</CardTitle>
                  <CardDescription>
                    Set up a recurring payment plan for your product or service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="plan-name">Subscription Name</Label>
                      <Input id="plan-name" placeholder="Premium Plan" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" placeholder="100" />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select defaultValue="iota">
                          <SelectTrigger id="currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="iota">IOTA</SelectItem>
                            <SelectItem value="shimmer">SHIMMER</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billing-cycle">Billing Cycle</Label>
                        <Select defaultValue="monthly">
                          <SelectTrigger id="billing-cycle">
                            <SelectValue placeholder="Select cycle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="trial-period">Trial Period (Days)</Label>
                        <Input id="trial-period" type="number" placeholder="0" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input id="recipient" placeholder="IOTA address" />
                    </div>
                    
                    <div className="pt-4">
                      <Button className="w-full">Create Subscription Plan</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>How Subscriptions Work</CardTitle>
                  <CardDescription>
                    Understand the process of creating and managing subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">1. Create a Plan</h3>
                    <p className="text-sm text-gray-500">
                      Set up your subscription details, including price, billing cycle, and optional trial period.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">2. Share with Subscribers</h3>
                    <p className="text-sm text-gray-500">
                      Share your subscription link with customers to allow them to subscribe.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">3. Automatic Billing</h3>
                    <p className="text-sm text-gray-500">
                      FluxShare handles recurring payments automatically based on your billing cycle.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-950/50">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Features</h4>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Zero transaction fees</li>
                      <li>• Secure smart contracts</li>
                      <li>• Automatic payments</li>
                      <li>• Subscription analytics</li>
                      <li>• Cancellation management</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="manage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Subscription Plans</CardTitle>
              <CardDescription>
                View and manage your active subscription plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Connect your wallet to view subscriptions</h3>
                <p className="text-gray-500 mb-4">You need to connect your IOTA wallet to view and manage your subscription plans</p>
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
} 