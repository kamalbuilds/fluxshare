"use client";
import React from "react";
import Link from "next/link";
import { ConnectButton } from "@iota/dapp-kit";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

export default function PaymentsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-gray-500">Manage payment splitting and track your payment history</p>
        </div>
        <ConnectButton />
      </div>

      <Tabs defaultValue="revenue-sharing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue-sharing">Revenue Sharing</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue-sharing" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Revenue Sharing Plans</CardTitle>
                  <CardDescription>
                    Your current active revenue sharing configurations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No active plans found</h3>
                    <p className="text-gray-500 mb-4">You haven't created any revenue sharing plans yet</p>
                    <Link href="/payments/create-splitter">
                      <Button>Create New Plan</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Recently processed payment splits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent transactions found</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/payments/create-splitter">
                    <Button className="w-full">Create Revenue Sharing Plan</Button>
                  </Link>
                  <Button className="w-full" variant="outline">View All Transactions</Button>
                  <Button className="w-full" variant="outline">Export Payment Data</Button>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>How Revenue Sharing Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">1. Define Recipients</h3>
                    <p className="text-sm text-gray-500">
                      Add team members, collaborators, or stakeholders who should receive a share of the revenue.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">2. Set Share Percentages</h3>
                    <p className="text-sm text-gray-500">
                      Define the percentage split for each recipient from the total incoming payment.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">3. Automatic Distribution</h3>
                    <p className="text-sm text-gray-500">
                      When payments come in, funds are automatically split and sent to each recipient's wallet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="payment-history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View all incoming and outgoing payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Connect your wallet to view payment history</h3>
                <p className="text-gray-500 mb-4">You need to connect your IOTA wallet to view your payment history</p>
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>
                Get insights into your payment flows and revenue sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Connect your wallet to view analytics</h3>
                <p className="text-gray-500 mb-4">You need to connect your IOTA wallet to access analytics</p>
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Need to create a new payment plan?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Link href="/payments/create-splitter" className="flex-1">
              <Card className="h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Splitting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Create a plan to split payments among multiple recipients</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Create Splitter</Button>
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/subscription" className="flex-1">
              <Card className="h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Subscription Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Set up recurring payments for products or services</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Create Subscription</Button>
                </CardFooter>
              </Card>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 