"use client";
import React, { useState } from "react";
import { X, Plus, DollarSign, AlertCircle } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

interface Recipient {
  address: string;
  percentage: number;
  name: string;
}

interface PaymentSplitterFormProps {
  walletAddress: string | null;
  kioskId: string | null;
  onSuccess: () => void;
}

export function PaymentSplitterForm({ walletAddress, kioskId, onSuccess }: PaymentSplitterFormProps) {
  const [splitterName, setSplitterName] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: "", percentage: 0, name: "" },
    { address: "", percentage: 0, name: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPercentage = recipients.reduce((sum, recipient) => sum + (recipient.percentage || 0), 0);
  const isValid = totalPercentage === 100;

  const addRecipient = () => {
    setRecipients([...recipients, { address: "", percentage: 0, name: "" }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length <= 2) {
      setError("You need at least two recipients for a revenue sharing plan");
      return;
    }
    
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
    setError(null);
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string | number) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { 
      ...newRecipients[index], 
      [field]: field === 'percentage' ? Number(value) : value 
    };
    setRecipients(newRecipients);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      setError("Please connect your wallet to create a revenue sharing plan");
      return;
    }
    
    if (!isValid) {
      setError("The total percentage must equal 100%");
      return;
    }
    
    if (!splitterName) {
      setError("Please give your revenue sharing plan a name");
      return;
    }
    
    if (recipients.some(r => !r.address || !r.percentage)) {
      setError("Please fill in all recipient addresses and percentages");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Here we would call the IOTA SDK to create the payment splitter contract
      // For now, we'll simulate the contract creation with a timeout
      
      console.log("Creating payment splitter with:", {
        name: splitterName,
        recipients,
        owner: walletAddress,
        kioskId
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Once the contract is created successfully, call the onSuccess callback
      onSuccess();
      
    } catch (err) {
      console.error("Error creating payment splitter:", err);
      setError("Failed to create revenue sharing plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="plan-name">Revenue Sharing Plan Name</Label>
              <Input 
                id="plan-name" 
                placeholder="e.g., Project Alpha Team Split" 
                value={splitterName}
                onChange={(e) => setSplitterName(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Give your revenue sharing plan a recognizable name
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Recipients</Label>
                <div className="text-sm text-gray-500">
                  Total: <span className={totalPercentage === 100 ? "text-green-600" : "text-red-600"}>
                    {totalPercentage}%
                  </span>
                </div>
              </div>
              
              {recipients.map((recipient, index) => (
                <div key={index} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <Label>Recipient {index + 1}</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeRecipient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor={`recipient-address-${index}`}>IOTA Address</Label>
                      <Input 
                        id={`recipient-address-${index}`} 
                        placeholder="Recipient's IOTA address"
                        value={recipient.address}
                        onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`recipient-percentage-${index}`}>Share (%)</Label>
                      <div className="relative">
                        <Input 
                          id={`recipient-percentage-${index}`} 
                          type="number"
                          min="1"
                          max="100" 
                          placeholder="e.g. 25"
                          value={recipient.percentage || ''}
                          onChange={(e) => updateRecipient(index, 'percentage', e.target.value)}
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`recipient-name-${index}`}>Name (Optional)</Label>
                    <Input 
                      id={`recipient-name-${index}`} 
                      placeholder="e.g. John's Wallet, Marketing Team"
                      value={recipient.name}
                      onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addRecipient}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Recipient
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="py-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!isValid || loading}
              >
                {loading ? (
                  <>Creating Revenue Sharing Plan...</>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Create Revenue Sharing Plan
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>By creating a revenue sharing plan, you are deploying a smart contract on the IOTA blockchain that will automatically split payments according to the percentages defined above.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
} 