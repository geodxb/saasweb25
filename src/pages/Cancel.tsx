import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, Home, CreditCard, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Cancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Log the canceled payment attempt for analytics
    console.log('Payment canceled:', { sessionId });
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
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
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </motion.div>
            <CardTitle className="text-3xl text-red-600">Payment Canceled</CardTitle>
            <CardDescription className="text-lg">
              Your payment was canceled. No charges were made to your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
            >
              <h3 className="font-semibold text-yellow-800 mb-3">What happened?</h3>
              <ul className="space-y-2 text-yellow-700">
                <li className="flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-yellow-600" />
                  Payment process was interrupted
                </li>
                <li className="flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-yellow-600" />
                  No charges were made
                </li>
                <li className="flex items-center">
                  <XCircle className="w-4 h-4 mr-2 text-yellow-600" />
                  Your account remains unchanged
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <h3 className="font-semibold text-blue-800 mb-3">Want to try again?</h3>
              <p className="text-blue-700 mb-4">
                You can return to the billing page to select a plan and complete your purchase.
                If you experienced any issues, our support team is here to help.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                onClick={() => navigate('/settings?tab=billing')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <Button 
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-sm text-gray-600 border-t pt-6"
            >
              <div className="flex items-center justify-center mb-2">
                <HelpCircle className="w-4 h-4 mr-1" />
                <span className="font-medium">Need assistance?</span>
              </div>
              <p>
                Contact our support team at{' '}
                <a href="mailto:support@clientflow.com" className="text-blue-600 hover:underline">
                  support@clientflow.com
                </a>
                {' '}or chat with us for immediate help.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}