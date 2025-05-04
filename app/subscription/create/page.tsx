"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectButton } from "@iota/dapp-kit";

export default function CreateSubscriptionPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Subscription Plan</h1>
          <p className="text-gray-500">Set up a new subscription offering for your customers</p>
        </div>
        <ConnectButton />
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>
                Configure the details of your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input id="name" placeholder="e.g., Basic Plan, Premium Membership" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what subscribers will receive" 
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (in IOTA)</Label>
                    <Input id="price" type="number" min="0" step="0.000001" placeholder="0.00" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period">Billing Period</Label>
                    <select 
                      id="period" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="30">Monthly (30 days)</option>
                      <option value="90">Quarterly (90 days)</option>
                      <option value="180">Bi-Annual (180 days)</option>
                      <option value="365">Annual (365 days)</option>
                      <option value="custom">Custom Period</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Feature List</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="e.g., Unlimited access" />
                      <Button type="button" variant="ghost" className="shrink-0">
                        Remove
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="e.g., Priority support" />
                      <Button type="button" variant="ghost" className="shrink-0">
                        Remove
                      </Button>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      Add Feature
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button>Create Subscription Plan</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Plan Preview</CardTitle>
              <CardDescription>
                How your plan will appear to potential subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">Basic Plan</h3>
                    <p className="text-sm text-gray-500">Your subscription plan description will appear here</p>
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold">0 IOTA</div>
                    <p className="text-sm text-gray-500">Monthly</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="space-y-1">
                      <li className="text-sm flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-primary"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Unlimited access</span>
                      </li>
                      <li className="text-sm flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-primary"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Button className="w-full" disabled>Subscribe Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Help & Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-blue-500 shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    <span>Create descriptive names and clear descriptions to attract subscribers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-blue-500 shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    <span>List specific features to help customers understand the value proposition.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-blue-500 shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    <span>Consider offering multiple subscription tiers to cater to different customer needs.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 