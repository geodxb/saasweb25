import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardContent className="pt-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-12 h-12 text-red-600" />
              </div>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. This area requires higher privileges.
            </p>
            
            {profile && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Your current role:</span> {profile.role.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Contact your administrator if you believe you should have access to this page.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-6">
              If you believe this is an error, please contact support at{' '}
              <a href="mailto:support@clientflow.com" className="text-blue-600 hover:underline">
                support@clientflow.com
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}