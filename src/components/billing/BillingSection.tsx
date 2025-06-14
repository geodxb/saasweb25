import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Crown,
  Check,
  Loader2,
  Calendar,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Download,
  Settings,
  Zap,
  Star,
  Shield,
  Users,
  Database,
  Headphones,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { 
  productOperations, 
  subscriptionOperations, 
  paymentOperations,
  stripeUtils,
  Product, 
  Subscription 
} from '@/lib/stripe';
import { toast } from 'sonner';

const planIcons = {
  'Free Plan': Shield,
  'Pro Plan': Zap,
  'Agency Plan': Crown,
};

const planColors = {
  'Free Plan': 'border-gray-200 hover:border-gray-300',
  'Pro Plan': 'border-blue-200 hover:border-blue-300',
  'Agency Plan': 'border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50',
};

const planButtonColors = {
  'Free Plan': 'bg-gray-600 hover:bg-gray-700',
  'Pro Plan': 'bg-blue-600 hover:bg-blue-700',
  'Agency Plan': 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
};

export default function BillingSection() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    email: user?.email || '',
    company: profile?.company || '',
    address: '',
    taxId: '',
  });

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load products and current subscription
      const [productsData, subscriptionData] = await Promise.all([
        productOperations.getProducts(),
        subscriptionOperations.getUserSubscription(user.uid),
      ]);

      setProducts(productsData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    // Check if user already has this plan
    if (currentSubscription?.productId === product.id) {
      toast.info('You already have this plan');
      return;
    }

    setIsUpgrading(product.id);
    try {
      if (product.price === 0) {
        // Free plan - just create a subscription record
        await subscriptionOperations.createSubscription({
          userId: user.uid,
          productId: product.id,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          cancelAtPeriodEnd: false,
        });
        
        // Cancel existing subscription if any
        if (currentSubscription) {
          await subscriptionOperations.requestCancellation(currentSubscription.id, true);
        }
        
        await loadBillingData();
        toast.success('Successfully switched to Free Plan');
      } else {
        // Paid plan - create checkout session
        const { url } = await paymentOperations.createCheckoutSession(product.id, user.uid);
        
        // In a real implementation, redirect to Stripe Checkout
        // window.location.href = url;
        
        // For demo, simulate successful payment
        toast.success('Redirecting to payment...');
        setTimeout(async () => {
          // Simulate successful payment
          await subscriptionOperations.createSubscription({
            userId: user.uid,
            productId: product.id,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            stripeSubscriptionId: `sub_demo_${Date.now()}`,
            stripeCustomerId: `cus_demo_${user.uid}`,
          });
          
          await loadBillingData();
          toast.success(`Successfully upgraded to ${product.name}!`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade plan');
    } finally {
      setIsUpgrading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    setIsCanceling(true);
    try {
      await subscriptionOperations.requestCancellation(currentSubscription.id, true);
      await loadBillingData();
      toast.success('Subscription will be canceled at the end of the current period');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleUpdateBillingInfo = async () => {
    // In a real implementation, this would update billing info via Stripe
    toast.success('Billing information updated');
  };

  const getCurrentProduct = () => {
    if (!currentSubscription) return null;
    return products.find(p => p.id === currentSubscription.productId);
  };

  const isCurrentPlan = (productId: string) => {
    return currentSubscription?.productId === productId && 
           stripeUtils.hasActiveSubscription(currentSubscription);
  };

  const getPlanIcon = (planName: string) => {
    const IconComponent = planIcons[planName as keyof typeof planIcons] || Zap;
    return IconComponent;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const currentProduct = getCurrentProduct();

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription and billing information</CardDescription>
        </CardHeader>
        <CardContent>
          {currentProduct ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg text-white">
                  {React.createElement(getPlanIcon(currentProduct.name), { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentProduct.name}</h3>
                  <p className="text-sm text-gray-600">{currentProduct.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {stripeUtils.formatPrice(currentProduct.price, currentProduct.currency)}
                    </span>
                    <span className="text-gray-500">/{currentProduct.interval}</span>
                    {currentSubscription && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {stripeUtils.getSubscriptionStatusText(currentSubscription)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-600">
                  <Crown className="w-3 h-3 mr-1" />
                  Current Plan
                </Badge>
                {currentSubscription && !currentSubscription.cancelAtPeriodEnd && currentProduct.price > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isCanceling}>
                        {isCanceling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Cancel Plan'
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your subscription? You'll continue to have access 
                          until the end of your current billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription}>
                          Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active subscription</h3>
              <p className="text-gray-600 mb-4">Choose a plan to get started with ClientFlow</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => {
              const PlanIcon = getPlanIcon(product.name);
              const isCurrentPlanActive = isCurrentPlan(product.id);
              const isUpgradingThis = isUpgrading === product.id;
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className={`relative rounded-lg border-2 p-6 transition-all ${
                    planColors[product.name as keyof typeof planColors] || 'border-gray-200 hover:border-gray-300'
                  } ${isCurrentPlanActive ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {isCurrentPlanActive && (
                    <Badge className="absolute -top-2 left-4 bg-blue-500">
                      <Crown className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  )}
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <PlanIcon className="w-8 h-8 text-gray-600" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        {stripeUtils.formatPrice(product.price, product.currency)}
                      </span>
                      <span className="text-gray-500">/{product.interval}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">{product.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      planButtonColors[product.name as keyof typeof planButtonColors] || 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    disabled={isCurrentPlanActive || isUpgradingThis}
                    onClick={() => handleUpgrade(product)}
                  >
                    {isUpgradingThis ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlanActive ? (
                      'Current Plan'
                    ) : (
                      product.price === 0 ? 'Get Started' : 'Upgrade'
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Update your payment method and billing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Method */}
          <div>
            <h4 className="font-medium mb-3">Payment Method</h4>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </div>

          <Separator />

          {/* Billing Details */}
          <div>
            <h4 className="font-medium mb-3">Billing Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input 
                  id="billingEmail" 
                  value={billingInfo.email}
                  onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  value={billingInfo.company}
                  onChange={(e) => setBillingInfo(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input 
                  id="taxId" 
                  placeholder="Enter tax ID"
                  value={billingInfo.taxId}
                  onChange={(e) => setBillingInfo(prev => ({ ...prev, taxId: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea 
                id="billingAddress" 
                placeholder="Enter billing address"
                value={billingInfo.address}
                onChange={(e) => setBillingInfo(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <Button onClick={handleUpdateBillingInfo} className="mt-4">
              Update Billing Information
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download your invoices and view payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentSubscription ? (
              [
                { 
                  date: currentSubscription.currentPeriodStart.toLocaleDateString(), 
                  amount: currentProduct ? stripeUtils.formatPrice(currentProduct.price, currentProduct.currency) : '$0.00', 
                  status: 'Paid', 
                  invoice: `INV-${currentSubscription.id.slice(-6).toUpperCase()}` 
                },
              ].map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.invoice}</p>
                    <p className="text-sm text-gray-500">{payment.date}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{payment.amount}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {payment.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No billing history yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage & Limits */}
      {currentProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>Track your current usage against plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium">Leads This Month</h4>
                <p className="text-2xl font-bold text-blue-600">47</p>
                <p className="text-sm text-gray-500">
                  of {currentProduct.metadata?.leadsLimit === -1 ? '∞' : currentProduct.metadata?.leadsLimit || 'N/A'} limit
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium">Storage Used</h4>
                <p className="text-2xl font-bold text-green-600">2.4 GB</p>
                <p className="text-sm text-gray-500">of 5 GB limit</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                  <Headphones className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium">Support Level</h4>
                <p className="text-lg font-medium text-purple-600 capitalize">
                  {currentProduct.metadata?.supportLevel || 'Basic'}
                </p>
                <p className="text-sm text-gray-500">Current tier</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}