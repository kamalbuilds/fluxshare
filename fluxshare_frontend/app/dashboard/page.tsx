"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@radix-ui/react-progress";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap
} from "lucide-react";

// Mock data for analytics
const mockRevenueData = [
  { month: 'Jan', revenue: 4500, subscriptions: 12, payments: 45 },
  { month: 'Feb', revenue: 6200, subscriptions: 18, payments: 62 },
  { month: 'Mar', revenue: 8100, subscriptions: 24, payments: 78 },
  { month: 'Apr', revenue: 7300, subscriptions: 21, payments: 69 },
  { month: 'May', revenue: 9800, subscriptions: 32, payments: 94 },
  { month: 'Jun', revenue: 12400, subscriptions: 38, payments: 112 },
];

const mockSubscriptionBreakdown = [
  { name: 'Premium Plan', value: 45, color: '#3b82f6' },
  { name: 'Basic Plan', value: 30, color: '#10b981' },
  { name: 'Pro Plan', value: 20, color: '#f59e0b' },
  { name: 'Enterprise', value: 5, color: '#ef4444' },
];

const mockPaymentSplits = [
  { date: '2024-06-01', amount: 2500, recipients: 3, type: 'Content Revenue' },
  { date: '2024-06-03', amount: 1800, recipients: 2, type: 'Course Sales' },
  { date: '2024-06-05', amount: 3200, recipients: 4, type: 'Sponsorship' },
  { date: '2024-06-07', amount: 2100, recipients: 3, type: 'Affiliate Commission' },
  { date: '2024-06-10', amount: 4500, recipients: 5, type: 'Product Launch' },
];

export default function DashboardPage() {
  const [hasRealData, setHasRealData] = useState(false);

  useEffect(() => {
    // Check if user has any real activity
    setHasRealData(false);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const AnalyticsContent = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(48300)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.2%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Splits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +15.1%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue/User</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(333)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-red-600">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -2.1%
              </span>
              {" "}from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Distribution of active subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockSubscriptionBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockSubscriptionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'Share']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payment Splits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payment Splits</CardTitle>
          <CardDescription>Latest revenue sharing activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPaymentSplits.map((split, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{split.type}</p>
                    <p className="text-sm text-muted-foreground">
                      Split among {split.recipients} recipients
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(split.amount)}</p>
                  <p className="text-sm text-muted-foreground">{split.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Payment History
          </Button>
        </CardFooter>
      </Card>

      {/* Performance Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+24.5%</div>
            <p className="text-sm text-muted-foreground mt-2">
              Year-over-year revenue growth
            </p>
            <Progress value={75} className="mt-3 w-full h-2 bg-secondary rounded-full">
              <div className="h-full bg-green-600 rounded-full" style={{ width: '75%' }} />
            </Progress>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">87.3%</div>
            <p className="text-sm text-muted-foreground mt-2">
              Monthly subscription retention rate
            </p>
            <Progress value={87} className="mt-3 w-full h-2 bg-secondary rounded-full">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '87%' }} />
            </Progress>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">99.2%</div>
            <p className="text-sm text-muted-foreground mt-2">
              Successful transaction rate
            </p>
            <Progress value={99} className="mt-3 w-full h-2 bg-secondary rounded-full">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '99%' }} />
            </Progress>
          </CardContent>
        </Card>
      </div>

      {!hasRealData && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Activity className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                This is sample analytics data. Real insights will appear once you have subscription and payment activity.
              </p>
              <Button variant="outline" size="sm">
                <Link href="/subscription/create">Create Your First Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
                  <Link href="/dashboard?tab=analytics">
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
                    <Link href="/subscription/browse">
                      <Button className="w-full justify-start" variant="outline">
                        Browse Subscription Plans
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
            <AnalyticsContent />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 