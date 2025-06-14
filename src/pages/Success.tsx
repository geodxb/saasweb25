import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionOperations, productOperations } from '@/lib/stripe';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (user && sessionId) {
      processSuccessfulPayment();
    }
  }, [user, sessionId]);

  const processSuccessfulPayment = async () => {
    if (!user) return;

    try {
      // In a real implementation, you would:
      // 1. Verify the session with Stripe
      // 2. Create/update the subscription in Firestore
      // 3. Send confirmation email
      
      // For demo purposes, we'll simulate this
      setTimeout(async () => {
        try {
          // Get the user's current subscription
          const subscription = await subscriptionOperations.getUserSubscription(user.uid);
          if (subscription) {
            const product = await productOperations.getProduct(subscription.productId);
            setSubscriptionDetails({ subscription, product });
          }
          setIsProcessing(false);
        } catch (error) {
          console.error('Error processing payment success:', error);
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error processing successful payment:', error);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-green-600" />
            <h2 className="text-xl font-semibold mb-2">Processing your payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your subscription.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your purchase. Your subscription is now active.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {subscriptionDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6"
              >
                <h3 className="font-semibold text-green-800 mb-3">Subscription Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Plan:</span>
                    <span className="font-medium text-green-800">
                      {subscriptionDetails.product?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount:</span>
                    <span className="font-medium text-green-800">
                      ${subscriptionDetails.product?.price}/month
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Next billing:</span>
                    <span className="font-medium text-green-800">
                      {subscriptionDetails.subscription?.currentPeriodEnd?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <h3 className="font-semibold text-blue-800 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Your account has been upgraded
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  All premium features are now available
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Receipt sent to your email
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/settings?tab=billing')}
                className="flex-1"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View Billing
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-sm text-gray-600"
            >
              <p>
                Need help? Contact our support team at{' '}
                <a href="mailto:support@clientflow.com" className="text-blue-600 hover:underline">
                  support@clientflow.com
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}