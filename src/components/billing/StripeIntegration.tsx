import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MoreHorizontal,
  Key
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { stripeClient, StripeCharge } from '@/lib/stripe/stripeClient';

export default function StripeIntegration() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<StripeCharge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [chargeData, setChargeData] = useState({
    email: '',
    amount: '',
    description: '',
    customerName: ''
  });
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      initializeStripe();
    }
  }, [user]);

  const initializeStripe = async () => {
    setIsLoading(true);
    try {
      // Initialize Stripe client
      const initialized = await stripeClient.initialize();
      setIsConnected(initialized);
      
      if (initialized) {
        // Load transactions
        await loadTransactions();
      }
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      toast.error('Failed to initialize Stripe integration');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const charges = await stripeClient.getCharges();
      setTransactions(charges);
    } catch (error) {
      console.error('Error loading Stripe transactions:', error);
      toast.error('Failed to load transactions');
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error('API key is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await stripeClient.setApiKey(apiKey);
      
      if (success) {
        setIsConnected(true);
        setIsConnectModalOpen(false);
        await loadTransactions();
        toast.success('Stripe connected successfully');
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast.error('Failed to connect Stripe');
    } finally {
      setIsSubmitting(false);
      setApiKey('');
      setShowApiKey(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const success = await stripeClient.disconnect();
      
      if (success) {
        setIsConnected(false);
        setTransactions([]);
        toast.success('Stripe disconnected successfully');
      } else {
        toast.error('Failed to disconnect Stripe');
      }
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      toast.error('Failed to disconnect Stripe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTransactions();
      toast.success('Transactions refreshed');
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      toast.error('Failed to refresh transactions');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualCharge = async () => {
    if (!chargeData.email || !chargeData.amount || !chargeData.description) {
      toast.error('Email, amount, and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(parseFloat(chargeData.amount) * 100);
      
      if (isNaN(amountInCents) || amountInCents <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      const charge = await stripeClient.createCharge({
        amount: amountInCents,
        currency: 'usd',
        description: chargeData.description,
        receipt_email: chargeData.email,
        customer_name: chargeData.customerName || undefined
      });
      
      // Add the new charge to the transactions list
      setTransactions([charge, ...transactions]);
      
      setIsChargeModalOpen(false);
      setChargeData({ email: '', amount: '', description: '', customerName: '' });
      toast.success('Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefund = async (chargeId: string) => {
    try {
      await stripeClient.refundCharge(chargeId);
      
      // Update the transaction in the list
      setTransactions(transactions.map(t => 
        t.id === chargeId 
          ? { ...t, status: 'refunded' as any, amount_refunded: t.amount } 
          : t
      ));
      
      toast.success('Refund processed successfully');
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  // Filter transactions based on search term and status filter
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      (transaction.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.receipt_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && transaction.status === 'succeeded') ||
      (statusFilter === 'failed' && transaction.status === 'failed') ||
      (statusFilter === 'refunded' && transaction.amount_refunded === transaction.amount);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (transaction: StripeCharge) => {
    if (transaction.amount_refunded === transaction.amount) {
      return <Badge className="bg-yellow-100 text-yellow-800">Refunded</Badge>;
    }
    
    switch (transaction.status) {
      case 'succeeded':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{transaction.status}</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatAmount = (amount: number, currency: string) => {
    // Convert cents to dollars
    const dollars = amount / 100;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(dollars);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Stripe integration...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Connect Your Stripe Account</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your Stripe account to process payments, manage subscriptions, and track transactions.
          </p>
          <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Connect Stripe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Stripe Account</DialogTitle>
                <DialogDescription>
                  Enter your Stripe Secret API key to connect your account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Stripe Secret API Key</Label>
                  <div className="relative">
                    <Input 
                      id="apiKey" 
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="sk_test_..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                  <p className="flex items-start">
                    <Key className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      You can find your API keys in the Stripe Dashboard under Developers &gt; API keys.
                      Make sure to use your Secret key, not your Publishable key.
                    </span>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConnectModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConnect}
                  disabled={isSubmitting || !apiKey.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Connect Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Stripe Connected</p>
              <p className="text-sm text-green-700">Your Stripe account is connected and ready to process payments</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleDisconnect} className="border-green-200 text-green-700 hover:bg-green-100">
            Disconnect
          </Button>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Stripe Transactions</CardTitle>
              <CardDescription>View and manage your payment transactions</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Dialog open={isChargeModalOpen} onOpenChange={setIsChargeModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Manual Charge</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Process Manual Charge</DialogTitle>
                    <DialogDescription>
                      Create a one-time charge for a customer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Customer Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="customer@example.com"
                        value={chargeData.email}
                        onChange={(e) => setChargeData({...chargeData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name (Optional)</Label>
                      <Input 
                        id="customerName" 
                        placeholder="John Smith"
                        value={chargeData.customerName}
                        onChange={(e) => setChargeData({...chargeData, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        placeholder="50.00"
                        value={chargeData.amount}
                        onChange={(e) => setChargeData({...chargeData, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input 
                        id="description" 
                        placeholder="Lead generation service"
                        value={chargeData.description}
                        onChange={(e) => setChargeData({...chargeData, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsChargeModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleManualCharge}
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Process Payment
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.customer_name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{transaction.receipt_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatAmount(transaction.amount, transaction.currency)}</div>
                        <div className="text-xs text-gray-500">{transaction.description}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{formatDate(transaction.created)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {transaction.status === 'succeeded' && transaction.amount_refunded < transaction.amount && (
                              <DropdownMenuItem onClick={() => handleRefund(transaction.id)}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Issue Refund
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => copyToClipboard(transaction.id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Transaction ID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Process your first payment to see transactions here'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Dashboard Link */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <ExternalLink className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Stripe Dashboard</p>
              <p className="text-sm text-gray-600">Access your full Stripe dashboard for advanced management</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
            Open Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}