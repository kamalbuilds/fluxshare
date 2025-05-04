"use client";
import React from "react";
import Link from "next/link";
import { ConnectButton } from "@iota/dapp-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <ConnectButton />
      </div>
      
      <div className="grid gap-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Active Subscriptions</CardTitle>
                  <CardDescription>Total active subscription plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">0</div>
                </CardContent>
                <CardFooter>
                  <Link href="/subscription/create">
                    <Button>Create New Plan</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Splitters</CardTitle>
                  <CardDescription>Active revenue sharing configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">0</div>
                </CardContent>
                <CardFooter>
                  <Link href="/payments/create-splitter">
                    <Button>Create Splitter</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                  <CardDescription>Revenue from all payment channels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">0 IOTA</div>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/analytics">
                    <Button variant="outline">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest payment activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 text-gray-500">
                    No recent transactions found
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Refresh</Button>
                  <Link href="/payments/history">
                    <Button variant="ghost">View All</Button>
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Link href="/subscription/create">
                      <Button className="w-full justify-start" variant="outline">
                        Create Subscription Plan
                      </Button>
                    </Link>
                    <Link href="/payments/create-splitter">
                      <Button className="w-full justify-start" variant="outline">
                        Set Up Revenue Sharing
                      </Button>
                    </Link>
                    <Link href="/payments/send">
                      <Button className="w-full justify-start" variant="outline">
                        Make One-time Payment
                      </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                      <Button className="w-full justify-start" variant="outline">
                        Account Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="subscriptions" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Your Subscription Plans</CardTitle>
                    <CardDescription>Manage your active subscription offerings</CardDescription>
                  </div>
                  <Link href="/subscription/create">
                    <Button>Create New Plan</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center p-16 text-gray-500">
                  No subscription plans found
                  <p className="mt-2 text-sm">
                    Create your first subscription plan to start accepting recurring payments
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Revenue Sharing</CardTitle>
                    <CardDescription>Manage your payment splitting configurations</CardDescription>
                  </div>
                  <Link href="/payments/create-splitter">
                    <Button>Create Splitter</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center p-16 text-gray-500">
                  No payment splitters found
                  <p className="mt-2 text-sm">
                    Create a revenue sharing arrangement to automatically distribute funds among multiple recipients
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Analytics</CardTitle>
                <CardDescription>Track your revenue streams and payment distributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-16 text-gray-500">
                  No analytics data available
                  <p className="mt-2 text-sm">
                    Analytics will be displayed once you have payment activity
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 