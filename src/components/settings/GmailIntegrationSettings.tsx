import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Send,
  Clock,
  BarChart3,
  ExternalLink,
  Settings,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { gmailService } from '@/lib/gmail';
import { useAuth } from '@/hooks/useAuth';

export default function GmailIntegrationSettings() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [emailsSent, setEmailsSent] = useState(0);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    setStatusError(null);
    setErrorType(null);
    
    try {
      // Check Gmail API status
      const status = await gmailService.checkGmailStatus();
      
      if (!status.available) {
        setStatusError(status.error || 'Gmail API is not available');
        setErrorType(status.errorType || 'unknown');
        setIsConnected(false);
      } else {
        // Initialize Gmail service
        await gmailService.initialize();
        
        // Check if user is authorized
        const isAuthorized = gmailService.isUserAuthorized();
        setIsConnected(isAuthorized);
      }
      
      // Set last checked time
      setLastChecked(new Date());
      
      // Get usage stats (in a real implementation, this would come from Firestore)
      // For demo, use a random number
      setEmailsSent(Math.floor(Math.random() * 50));
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setIsConnected(false);
      setStatusError(error instanceof Error ? error.message : 'Unknown error checking Gmail connection');
      setErrorType('unknown');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setStatusError(null);
    setErrorType(null);
    
    try {
      // Check Gmail API status first
      const status = await gmailService.checkGmailStatus();
      
      if (!status.available) {
        setStatusError(status.error || 'Gmail API is not available');
        setErrorType(status.errorType || 'unknown');
        toast.error(status.error || 'Gmail API is not available');
        return;
      }
      
      // Initialize Gmail service
      await gmailService.initialize();
      
      // Authorize Gmail
      const authorized = await gmailService.authorize();
      setIsConnected(authorized);
      
      if (authorized) {
        toast.success('Successfully connected to Gmail');
        setStatusError(null);
        setErrorType(null);
      } else {
        toast.error('Failed to connect to Gmail');
      }
    } catch (error) {
      console.error('Error connecting to Gmail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error connecting to Gmail';
      toast.error(errorMessage);
      setStatusError(errorMessage);
      setErrorType('connection_error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      // Revoke authorization
      const revoked = await gmailService.revokeAuthorization();
      
      if (revoked) {
        setIsConnected(false);
        toast.success('Gmail connection revoked');
      } else {
        toast.error('Failed to revoke Gmail connection');
      }
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast.error('Failed to disconnect Gmail. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const renderErrorHelp = () => {
    if (!statusError || !errorType) return null;

    const getErrorHelp = () => {
      switch (errorType) {
        case 'api_disabled':
          return {
            title: 'Gmail API Not Enabled',
            description: 'The Gmail API is not enabled in your Google Cloud Project.',
            steps: [
              'Go to the Google Cloud Console',
              'Select your project',
              'Navigate to "APIs & Services" > "Library"',
              'Search for "Gmail API" and click on it',
              'Click the "Enable" button',
              'Wait a few minutes for the API to be activated',
              'Return here and click "Refresh" to try again'
            ],
            link: 'https://console.cloud.google.com/apis/library/gmail.googleapis.com',
            linkText: 'Open Google Cloud Console'
          };
        case 'invalid_api_key':
          return {
            title: 'Invalid API Key',
            description: 'Your Google API key is invalid or not properly configured.',
            steps: [
              'Go to the Google Cloud Console',
              'Navigate to "APIs & Services" > "Credentials"',
              'Check your API key configuration',
              'Ensure the Gmail API is enabled for your API key',
              'Verify the API key is correctly set in your environment variables',
              'Make sure there are no extra spaces or characters'
            ],
            link: 'https://console.cloud.google.com/apis/credentials',
            linkText: 'Check API Credentials'
          };
        case 'invalid_client_id':
          return {
            title: 'Invalid OAuth Client ID',
            description: 'Your OAuth 2.0 Client ID is invalid or not properly configured.',
            steps: [
              'Go to the Google Cloud Console',
              'Navigate to "APIs & Services" > "Credentials"',
              'Check your OAuth 2.0 Client ID configuration',
              'Ensure your domain is added to "Authorized JavaScript origins"',
              'Add "http://localhost:5173" for development',
              'Verify the Client ID is correctly set in your environment variables'
            ],
            link: 'https://console.cloud.google.com/apis/credentials',
            linkText: 'Check OAuth Settings'
          };
        case 'configuration':
          return {
            title: 'Configuration Missing',
            description: 'Gmail integration is not properly configured.',
            steps: [
              'Set up your Google Cloud Project',
              'Enable the Gmail API',
              'Create API credentials (API Key and OAuth 2.0 Client ID)',
              'Add your credentials to the environment variables',
              'Set VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID',
              'Restart your development server'
            ],
            link: 'https://console.cloud.google.com/',
            linkText: 'Google Cloud Console'
          };
        case 'network_error':
          return {
            title: 'Network Connection Error',
            description: 'Unable to connect to Google services.',
            steps: [
              'Check your internet connection',
              'Verify you can access google.com',
              'Try disabling any VPN or proxy',
              'Check if your firewall is blocking the connection',
              'Wait a moment and try again'
            ],
            link: null,
            linkText: null
          };
        default:
          return {
            title: 'Gmail Integration Error',
            description: 'An error occurred while setting up Gmail integration.',
            steps: [
              'Check your Google Cloud Console configuration',
              'Ensure the Gmail API is enabled',
              'Verify your API credentials are correct',
              'Try refreshing the page and connecting again',
              'Contact support if the issue persists'
            ],
            link: 'https://console.cloud.google.com/',
            linkText: 'Google Cloud Console'
          };
      }
    };

    const errorHelp = getErrorHelp();

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-800">{errorHelp.title}</p>
            <p className="text-sm text-red-700 mt-1">{errorHelp.description}</p>
            <p className="text-sm text-red-700 mt-2 font-medium">To fix this issue:</p>
            <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-red-700">
              {errorHelp.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            {errorHelp.link && (
              <div className="mt-3">
                <a
                  href={errorHelp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-red-800 hover:text-red-900 underline"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {errorHelp.linkText}
                </a>
              </div>
            )}
            <div className="mt-3 text-xs text-red-600">
              <p className="font-medium">Technical Error:</p>
              <p className="font-mono bg-red-100 p-1 rounded">{statusError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Gmail Integration</CardTitle>
                <CardDescription>Connect your Gmail account to send emails directly to leads</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
            >
              {isConnected ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderErrorHelp()}

          {isConnected ? (
            <>
              {/* Usage Stats */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Usage Statistics</h3>
                    <div className="mt-2">
                      <p className="text-sm text-blue-700">Emails Sent: <span className="font-medium">{emailsSent}</span></p>
                      <p className="text-xs text-blue-600 mt-1">
                        Last checked: {lastChecked?.toLocaleString() || 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
                <div>
                  <p className="font-medium">Gmail Account Connected</p>
                  <p className="text-sm text-gray-600">You can now send emails directly from Locafyr</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkConnection}
                    disabled={isDisconnecting}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Disconnect
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Gmail Connected Successfully</p>
                    <p className="text-sm text-green-700 mt-1">
                      You can now send emails directly to leads from the lead detail view.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {!statusError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Gmail Not Connected</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Connect your Gmail account to send emails directly to leads from Locafyr.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6 text-center">
                <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Gmail Account</h3>
                <p className="text-gray-600 mb-6">
                  Locafyr needs permission to send emails on your behalf. Your emails and data remain private and secure.
                </p>
                
                {/* Browser requirements notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-left">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Before connecting:</p>
                      <ul className="mt-1 space-y-1 text-blue-700">
                        <li>• Allow popups for this site in your browser</li>
                        <li>• Ensure you're not using an ad blocker that blocks popups</li>
                        <li>• Make sure you have a stable internet connection</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting || !!statusError}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Connect Gmail Account
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">About Gmail Integration</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Locafyr uses Google's OAuth 2.0 to securely connect to your Gmail account. We only request permission to send emails and never store your password.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}