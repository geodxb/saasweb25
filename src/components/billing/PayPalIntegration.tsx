import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { paypalClient, PayPalTransaction } from '@/lib/paypal/paypalClient';

// Mock transaction data for initial state
const mockTransactions = [
  {
    id: 'PAYID-MQJL5YI8YX227394X1234567',
    status: 'COMPLETED',
    amount: {
      value: '65.00',
      currency_code: 'USD'
    },
    payer: {
      email_address: 'alex@example.com',
      name: {
        given_name: 'Alex',
        surname: 'Thompson'
      }
    },
    description: 'Lead generation service - 6 leads',
    create_time: '2023-05-16T10:22:11Z',
    update_time: '2023-05-16T10:22:11Z'
  },
  {
    id: 'PAYID-MQJL5YI8YX227394X7654321',
    status: 'COMPLETED',
    amount: {
      value: '40.00',
      currency_code: 'USD'
    },
    payer: {
      email_address: 'jessica@company.org',
      name: {
        given_name: 'Jessica',
        surname: 'Miller'
      }
    },
    description: 'Lead generation service - 4 leads',
    create_time: '2023-05-15T16:45:33Z',
    update_time: '2023-05-15T16:45:33Z'
  },
  {
    id: 'PAYID-MQJL5YI8YX227394X9876543',
    status: 'FAILED',
    amount: {
      value: '30.00',
      currency_code: 'USD'
    },
    payer: {
      email_address: 'robert@business.co',
      name: {
        given_name: 'Robert',
        surname: 'Garcia'
      }
    },
    description: 'Lead generation service - 3 leads',
    create_time: '2023-05-14T08:12:59Z',
    update_time: '2023-05-14T08:12:59Z'
  }
] as PayPalTransaction[];

export default function PayPalIntegration() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<PayPalTransaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [chargeData, setChargeData] = useState({
    email: '',
    amount: '',
    description: ''
  });
  const [connectData, setConnectData] = useState({
    clientId: '',
    secret: ''
  });
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      initializePayPal();
    }
  }, [user]);

  const initializePayPal = async () => {
    setIsLoading(true);
    try {
      // Initialize PayPal client
      const initialized = await paypalClient.initialize();
      setIsConnected(initialized);
      
      if (initialized) {
        // Load transactions
        await loadTransactions();
      }
    } catch (error) {
      console.error('Error initializing PayPal:', error);
      toast.error('Failed to initialize PayPal integration');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // In a real implementation, this would fetch from the PayPal API
      // For demo, we'll use mock data
      // const paypalTransactions = await paypalClient.getTransactions();
      // setTransactions(paypalTransactions);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Transactions loaded successfully');
    } catch (error) {
      console.error('Error loading PayPal transactions:', error);
      toast.error('Failed to load transactions');
    }
  };

  const handleConnect = async () => {
    if (!connectData.clientId || !connectData.secret) {
      toast.error('Client ID and Secret are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await paypalClient.setCredentials(
        connectData.clientId,
        connectData.secret
      );
      
      if (success) {
        setIsConnected(true);
        setIsConnectModalOpen(false);
        await loadTransactions();
        toast.success('PayPal connected successfully');
      }
    } catch (error) {
      console.error('Error connecting PayPal:', error);
      toast.error('Failed to connect PayPal');
    } finally {
      setIsSubmitting(false);
      setConnectData({ clientId: '', secret: '' });
      setShowSecret(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const success = await paypalClient.disconnect();
      
      if (success) {
        setIsConnected(false);
        setTransactions([]);
        toast.success('PayPal disconnected successfully');
      } else {
        toast.error('Failed to disconnect PayPal');
      }
    } catch (error) {
      console.error('Error disconnecting PayPal:', error);
      toast.error('Failed to disconnect PayPal');
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
      // Create and capture a PayPal order
      const orderId = await paypalClient.createOrder({
        amount: chargeData.amount,
        currency: 'USD',
        description: chargeData.description,
        email: chargeData.email
      });
      
      const transaction = await paypalClient.captureOrder(orderId);
      
      // Add the new transaction to the list
      setTransactions([transaction, ...transactions]);
      
      setIsChargeModalOpen(false);
      setChargeData({ email: '', amount: '', description: '' });
      toast.success('Payment processed successfully');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter transactions based on search term and status filter
  const filteredTransactions = transactions.filter(transaction => {
    const customerName = transaction.payer?.name 
      ? `${transaction.payer.name.given_name || ''} ${transaction.payer.name.surname || ''}`.trim()
      : '';
    
    const matchesSearch = 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.payer?.email_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && transaction.status === 'COMPLETED') ||
      (statusFilter === 'failed' && transaction.status === 'FAILED') ||
      (statusFilter === 'refunded' && transaction.status === 'REFUNDED');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-yellow-100 text-yellow-800">Refunded</Badge>;
      case 'PENDING':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getCustomerName = (transaction: PayPalTransaction) => {
    if (transaction.payer?.name) {
      return `${transaction.payer.name.given_name || ''} ${transaction.payer.name.surname || ''}`.trim();
    }
    
    if (transaction.payer?.email_address) {
      return transaction.payer.email_address.split('@')[0];
    }
    
    return 'Unknown';
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
          <p className="text-gray-600">Loading PayPal integration...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Connect Your PayPal Account</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Connect your PayPal account to process payments and track transactions.
          </p>
          <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Connect PayPal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect PayPal Account</DialogTitle>
                <DialogDescription>
                  Enter your PayPal API credentials to connect your account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input 
                    id="clientId" 
                    placeholder="Enter your PayPal Client ID"
                    value={connectData.clientId}
                    onChange={(e) => setConnectData({...connectData, clientId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret</Label>
                  <div className="relative">
                    <Input 
                      id="secret" 
                      type={showSecret ? 'text' : 'password'}
                      placeholder="Enter your PayPal Secret"
                      value={connectData.secret}
                      onChange={(e) => setConnectData({...connectData, secret: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="flex items-start">
                    <Key className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      You can find your API credentials in the PayPal Developer Dashboard under "My Apps & Credentials".
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
                  disabled={isSubmitting || !connectData.clientId || !connectData.secret}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-800">PayPal Connected</p>
              <p className="text-sm text-blue-700">Your PayPal account is connected and ready to process payments</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleDisconnect} className="border-blue-200 text-blue-700 hover:bg-blue-100">
            Disconnect
          </Button>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>PayPal Transactions</CardTitle>
              <CardDescription>View and manage your PayPal transactions</CardDescription>
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
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Manual Charge</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Process Manual Charge</DialogTitle>
                    <DialogDescription>
                      Create a one-time PayPal charge for a customer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="paypal-email">Customer Email</Label>
                      <Input 
                        id="paypal-email" 
                        type="email" 
                        placeholder="customer@example.com"
                        value={chargeData.email}
                        onChange={(e) => setChargeData({...chargeData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypal-amount">Amount ($)</Label>
                      <Input 
                        id="paypal-amount" 
                        type="number" 
                        placeholder="50.00"
                        value={chargeData.amount}
                        onChange={(e) => setChargeData({...chargeData, amount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paypal-description">Description</Label>
                      <Input 
                        id="paypal-description" 
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
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
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
                          <div className="font-medium">{getCustomerName(transaction)}</div>
                          <div className="text-sm text-gray-500">{transaction.payer?.email_address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${transaction.amount.value}</div>
                        <div className="text-xs text-gray-500">{transaction.description}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{formatDate(transaction.create_time)}</span>
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
                            {transaction.status === 'COMPLETED' && (
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download Receipt
                              </DropdownMenuItem>
                            )}
                            {transaction.status === 'COMPLETED' && (
                              <DropdownMenuItem>
                                <DollarSign className="w-4 h-4 mr-2" />
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
                <DollarSign className="w-8 h-8 text-gray-400" />
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

      {/* PayPal Dashboard Link */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <ExternalLink className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">PayPal Dashboard</p>
              <p className="text-sm text-gray-600">Access your full PayPal dashboard for advanced management</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.open('https://www.paypal.com/dashboard', '_blank')}>
            Open Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}