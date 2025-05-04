"use client";
import React from "react";
import { SubscriptionManagerForm } from "@/components/subscription/SubscriptionManagerForm";

export default function CreateSubscriptionPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create Subscription Plan</h1>
          <p className="text-gray-500">Set up a new subscription offering for your customers</p>
        </div>
      </div>
      
      <SubscriptionManagerForm />
    </main>
  );
} 