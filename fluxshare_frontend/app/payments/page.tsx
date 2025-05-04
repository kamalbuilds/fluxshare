"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentAccount } from "@iota/dapp-kit";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  Edit,
  Trash2,
  Send,
  ArrowRight,
  Wallet,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { ConnectButton } from "@iota/dapp-kit";
import { getPaymentSplitterRegistry, getObjectById, getTransactionHistory } from "../../lib/iota/client";
import { usePaymentSplitter } from "../../hooks/usePaymentSplitter";
import { useToast } from "../../hooks/use-toast";
import { useWalletBalance } from "../../hooks/useWalletBalance";

// Mock data for demonstration - replace with real data from blockchain
const mockRevenuePlans = [
  {
    id: 1,
    name: "Team Revenue Split",
    recipients: 3,
    totalShares: 100,
    createdAt: "2024-06-01",
    status: "active",
    recipients_detail: [
      { address: "0x123...abc", share: 50 },
      { address: "0x456...def", share: 30 },
      { address: "0x789...ghi", share: 20 }
    ]
  },
  {
    id: 2,
    name: "Content Creator Split",
    recipients: 2,
    totalShares: 100,
    createdAt: "2024-05-15",
    status: "active",
    recipients_detail: [
      { address: "0xabc...123", share: 70 },
      { address: "0xdef...456", share: 30 }
    ]
  }
];

const mockTransactions = [
  {
    id: "1",
    date: "2024-06-01",
    amount: 1000,
    splitterId: 1,
    planName: "Team Revenue Split",
    status: "completed",
    txHash: "0x123abc..."
  },
  {
    id: "2", 
    date: "2024-05-30",
    amount: 750,
    splitterId: 2,
    planName: "Content Creator Split",
    status: "completed",
    txHash: "0x456def..."
  }
];

export default function PaymentsPage() {
  const currentAccount = useCurrentAccount();
  const { processPayment, isLoading: isProcessingPayment } = usePaymentSplitter();
  const { toast } = useToast();
  const { formattedBalance, isLoading: isLoadingBalance, totalBalance } = useWalletBalance();
  const [revenuePlans, setRevenuePlans] = useState(mockRevenuePlans);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Check for payment splitter registry when wallet connects
  useEffect(() => {
    const checkRegistry = async () => {
      if (currentAccount) {
        try {
          const existingRegistry = await getPaymentSplitterRegistry(currentAccount.address);
          setRegistryId(existingRegistry);
          
          // If registry exists, fetch real revenue plans
          if (existingRegistry) {
            await fetchRevenuePlans(existingRegistry);
            await fetchTransactionHistory();
          }
        } catch (error) {
          console.error('Error checking registry:', error);
        }
      }
    };

    checkRegistry();
  }, [currentAccount]);

  const fetchRevenuePlans = async (registryId: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching revenue plans from registry:', registryId);
      
      // Get the registry object to read payment splitters
      const registryObject = await getObjectById(registryId);
      
      if (registryObject.data?.content && 'fields' in registryObject.data.content) {
        const fields = registryObject.data.content.fields as any;
        
        if (fields.splitters && Array.isArray(fields.splitters)) {
          console.log('Found', fields.splitters.length, 'splitters in registry');
          
          const realPlans = fields.splitters.map((splitterData: any, index: number) => {
            const splitter = splitterData.fields;
            return {
              id: parseInt(splitter.splitter_id || index.toString()),
              name: splitter.name || `Payment Splitter ${index + 1}`,
              recipients: Array.isArray(splitter.recipients) ? splitter.recipients.length : 0,
              totalShares: parseInt(splitter.total_shares || '100'),
              createdAt: new Date(parseInt(splitter.created_at || '0') * 1000).toISOString().split('T')[0],
              status: "active",
              recipients_detail: Array.isArray(splitter.recipients) 
                ? splitter.recipients.map((recipient: any) => ({
                    address: recipient.fields?.address || recipient.address,
                    share: parseInt(recipient.fields?.share || recipient.share || '0')
                  }))
                : []
            };
          });
          
          console.log('Parsed revenue plans:', realPlans);
          
          // If we have real data, use it; otherwise fallback to mock data
          if (realPlans.length > 0) {
            setRevenuePlans(realPlans);
          } else {
            setRevenuePlans(mockRevenuePlans);
          }
        } else {
          console.log('No splitters found in registry, using mock data');
          setRevenuePlans(mockRevenuePlans);
        }
      }
    } catch (error) {
      console.error('Error fetching revenue plans:', error);
      // Fallback to mock data on error
      setRevenuePlans(mockRevenuePlans);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    if (!currentAccount) return;
    
    try {
      console.log('Fetching transaction history for:', currentAccount.address);
      
      const txHistory = await getTransactionHistory(currentAccount.address);
      const paymentTransactions = [];
      
      // Parse payment-related transactions from events
      for (const tx of txHistory) {
        if (tx.events) {
          for (const event of tx.events) {
            if (event.type && event.type.includes('PaymentProcessedEvent') && event.parsedJson) {
              const eventData = event.parsedJson as any;
              paymentTransactions.push({
                id: tx.digest || Math.random().toString(),
                date: new Date(parseInt(tx.timestampMs || '0')).toISOString().split('T')[0],
                amount: parseFloat(eventData.amount || '0') / 1000000, // Convert from nanoIOTA
                splitterId: parseInt(eventData.splitter_id || '0'),
                planName: `Payment Splitter ${eventData.splitter_id || 'Unknown'}`,
                status: "completed",
                txHash: (tx.digest || '').slice(0, 10) + "..."
              });
            }
          }
        }
      }
      
      console.log('Found payment transactions:', paymentTransactions);
      
      // If we have real transactions, use them; otherwise use mock data
      if (paymentTransactions.length > 0) {
        setTransactions(paymentTransactions);
      } else {
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      // Fallback to mock data
      setTransactions(mockTransactions);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleProcessPayment = async () => {
    if (!selectedPlan || !paymentAmount || !registryId) {
      toast({
        title: 'Invalid Input',
        description: 'Please ensure all fields are filled correctly',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Processing payment:', {
        registryId,
        planId: selectedPlan.id,
        amount: paymentAmount,
        currentAccount: currentAccount?.address
      });

      const result = await processPayment(
        registryId,
        selectedPlan.id,
        paymentAmount
      );

      if (result) {
        toast({
          title: 'Payment Processed!',
          description: `Successfully split ${paymentAmount} IOTA among ${selectedPlan.recipients} recipients`,
        });

        // Add to transaction history
        const newTransaction = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          amount: parseFloat(paymentAmount),
          splitterId: selectedPlan.id,
          planName: selectedPlan.name,
          status: "completed",
          txHash: result.digest.slice(0, 10) + "..."
        };

        setTransactions(prev => [newTransaction, ...prev]);
        setSelectedPlan(null);
        setPaymentAmount("");
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      
      let errorMessage = 'Failed to process payment';
      let errorTitle = 'Payment Failed';
      
      if (error instanceof Error) {
        if (error.message.includes('Insufficient balance')) {
          errorTitle = 'Insufficient Balance';
          errorMessage = error.message + '\n\nPlease add more IOTA to your wallet or reduce the payment amount.';
        } else if (error.message.includes('No IOTA coins found')) {
          errorTitle = 'No IOTA Found';
          errorMessage = 'No IOTA coins found in your wallet. Please add IOTA from the faucet or transfer from another wallet.';
        } else if (error.message.includes('gas')) {
          errorTitle = 'Gas Error';
          errorMessage = 'Transaction failed due to gas issues. Please ensure you have sufficient IOTA for gas fees (minimum ~0.01 IOTA).';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditPlan = (plan: any) => {
    // Implement edit functionality
    console.log('Editing plan:', plan);
  };

  const RevenueShareManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* Active Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Revenue Sharing Plans</CardTitle>
              <CardDescription>
                Your current active revenue sharing configurations
              </CardDescription>
            </div>
            <Link href="/payments/create-splitter">
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {revenuePlans.length > 0 ? (
              <div className="space-y-4">
                {revenuePlans.map((plan) => (
                  <div key={plan.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium">{plan.name}</h3>
                          <p className="text-sm text-gray-500">
                            {plan.recipients} recipients • Created {plan.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Process Payment
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                          disabled={true} // TODO: Implement edit functionality
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {plan.recipients_detail.map((recipient, idx) => (
                        <div key={idx} className="flex justify-between bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                          <span>{formatAddress(recipient.address)}</span>
                          <span className="font-medium">{recipient.share}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No revenue plans found</h3>
                <p className="text-gray-500 mb-4">Create your first revenue sharing plan to start splitting payments</p>
                <Link href="/payments/create-splitter">
                  <Button>Create Your First Plan</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Processing Modal */}
        {selectedPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Process Payment - {selectedPlan.name}</CardTitle>
              <CardDescription>
                Enter the amount to split among recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will split the payment immediately among all recipients according to their configured shares.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Payment Amount (IOTA)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  placeholder="Enter amount to split"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0"
                  step="0.000001"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Minimum amount: 0.000001 IOTA</span>
                  {currentAccount && (
                    <span>
                      Wallet balance: {isLoadingBalance ? 'Loading...' : formattedBalance} IOTA
                    </span>
                  )}
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-2">Payment Distribution Preview:</h4>
                <div className="space-y-2">
                  {selectedPlan.recipients_detail.map((recipient: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{formatAddress(recipient.address)}</span>
                      <span className="font-medium">
                        {paymentAmount ? (parseFloat(paymentAmount) * recipient.share / 100).toFixed(6) : '0.000000'} IOTA ({recipient.share}%)
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Estimated Gas Fee:</span>
                      <span>~0.01 IOTA</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Required:</span>
                      <span>
                        {paymentAmount ? (parseFloat(paymentAmount) + 0.01).toFixed(6) : '0.010000'} IOTA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || isProcessingPayment}
                  onClick={handleProcessPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Split Payment
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedPlan(null);
                    setPaymentAmount("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Active Plans</span>
              <span className="font-medium">{revenuePlans.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Recipients</span>
              <span className="font-medium">{revenuePlans.reduce((acc, plan) => acc + plan.recipients, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Processed This Month</span>
              <span className="font-medium">{formatCurrency(1750)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>How Revenue Sharing Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Define Recipients</h3>
              <p className="text-sm text-gray-500">
                Add team members, collaborators, or stakeholders who should receive a share.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">2. Set Share Percentages</h3>
              <p className="text-sm text-gray-500">
                Define the percentage split for each recipient from the total payment.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">3. Process Payments</h3>
              <p className="text-sm text-gray-500">
                Enter an amount and it's automatically split according to your plan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const PaymentHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>
          View all incoming and outgoing payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentAccount ? (
          transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.planName}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date} • {formatAddress(transaction.txHash)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                    <Badge variant="secondary">{transaction.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-gray-500">Your payment history will appear here once you start processing payments</p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Connect your wallet to view payment history</h3>
            <p className="text-gray-500 mb-4">You need to connect your IOTA wallet to view your payment history</p>
            <ConnectButton />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const PaymentAnalytics = () => (
    <div className="space-y-6">
      {currentAccount ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(1750)}</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-gray-500">Across 2 plans</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(875)}</div>
                <p className="text-xs text-gray-500">Per transaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Send className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.planName}</p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(transaction.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment Analytics</CardTitle>
            <CardDescription>
              Get insights into your payment flows and revenue sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Connect your wallet to view analytics</h3>
              <p className="text-gray-500 mb-4">You need to connect your IOTA wallet to access analytics</p>
              <ConnectButton />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-gray-500">Manage payment splitting and track your payment history</p>
        </div>
        {currentAccount && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Wallet className="h-4 w-4" />
            <span>{formatAddress(currentAccount.address)}</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="revenue-sharing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue-sharing">Revenue Sharing</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue-sharing" className="mt-6">
          <RevenueShareManagement />
        </TabsContent>
        
        <TabsContent value="payment-history" className="mt-6">
          <PaymentHistory />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <PaymentAnalytics />
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