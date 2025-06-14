import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  errorInfo?: React.ErrorInfo;
}

export default function ErrorFallback({ error, resetErrorBoundary, errorInfo }: ErrorFallbackProps) {
  const navigate = useNavigate();

  // Extract a more user-friendly message from the error
  const getUserFriendlyMessage = (error: Error): string => {
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'There was a problem connecting to our servers. Please check your internet connection and try again.';
    }
    
    // Check for timeout errors
    if (error.message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }
    
    // Check for permission errors
    if (error.message.includes('permission') || error.message.includes('access')) {
      return 'You don\'t have permission to perform this action. Please contact support if you believe this is an error.';
    }
    
    // Default message
    return 'Something unexpected happened. We\'ve been notified and are working to fix the issue.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Something went wrong</CardTitle>
          <CardDescription>
            {getUserFriendlyMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800 font-mono">
                {error.message}
              </p>
              {errorInfo && (
                <details className="mt-2">
                  <summary className="text-xs text-red-800 cursor-pointer">Stack trace</summary>
                  <pre className="text-xs text-red-800 font-mono mt-2 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}
          <div className="flex space-x-2">
            <Button onClick={resetErrorBoundary} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}