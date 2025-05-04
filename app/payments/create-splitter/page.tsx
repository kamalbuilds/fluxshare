"use client";
import React from "react";
import Link from "next/link";

import { PaymentSplitterForm } from "@/components/payment/payment-splitter-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectButton } from "@iota/dapp-kit";

export default function CreateSplitterPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Revenue Sharing Plan</h1>
          <p className="text-gray-500">Set up automatic distribution of funds among team members, collaborators, or stakeholders</p>
        </div>
        <ConnectButton />
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <PaymentSplitterForm 
            walletAddress={null} 
            kioskId={null} 
            onSuccess={() => {
              // Navigate to dashboard or show success message
              console.log('Revenue sharing plan created successfully');
            }}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>How Revenue Sharing Works</CardTitle>
              <CardDescription>
                Understand the process of distributing payments on the IOTA blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Define Team Members</h3>
                <p className="text-sm text-gray-500">
                  Add the addresses of all contributors who should receive a portion of the revenue.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">2. Set Shares</h3>
                <p className="text-sm text-gray-500">
                  Determine the percentage each team member should receive. All shares must add up to 100%.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">3. Process Payments</h3>
                <p className="text-sm text-gray-500">
                  When revenue comes in, it's automatically distributed according to the defined shares.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">4. Track Distribution</h3>
                <p className="text-sm text-gray-500">
                  Monitor all transaction splits in your dashboard with complete transparency.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-950/50">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Popular Use Cases</h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Co-creator revenue distribution</li>
                  <li>• Freelancer team project payments</li>
                  <li>• Platform and creator splits</li>
                  <li>• Investor profit sharing</li>
                  <li>• Royalty distributions for digital content</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Having trouble setting up your revenue sharing plan? Check out these resources:
                </p>
                
                <div className="space-y-2">
                  <Link 
                    href="/documentation/revenue-sharing" 
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
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
                      className="h-4 w-4"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                    Documentation
                  </Link>
                  
                  <Link 
                    href="/support" 
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
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
                      className="h-4 w-4"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Get Support
                  </Link>
                  
                  <Link 
                    href="https://docs.iota.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
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
                      className="h-4 w-4"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    IOTA Documentation
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 