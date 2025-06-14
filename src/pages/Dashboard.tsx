import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Globe,
  Mail,
  Database,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { leadOperations, clientOperations } from '@/lib/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkIntegrationsSetup } from '@/lib/integrations';
import { emailAnalyticsOperations } from '@/lib/emailAnalytics';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeClients: 0,
    monthlyRevenue: '$0',
    conversionRate: '0%',
    leadGrowth: '0%',
    clientGrowth: '0%',
    revenueGrowth: '0%',
    conversionChange: '0%',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState({
    totalLeads: 0,
    activeClients: 0,
    totalRevenue: 0,
    conversionRate: 0,
  });
  const [integrationStats, setIntegrationStats] = useState({
    connectedIntegrations: 0,
    emailsSent: 0,
    integrationDetails: [] as {name: string, status: string, icon: any}[]
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadIntegrationStats();
      
      // Set up interval to refresh data every 5 minutes
      const refreshInterval = setInterval(() => {
        loadDashboardData(false);
        loadIntegrationStats();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [user, profile]);

  const loadDashboardData = async (showLoading = true) => {
    if (!user) return;

    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      
      // Load leads with error handling
      let leads: any[] = [];
      try {
        leads = await leadOperations.getLeads(user.uid, profile?.role);
      } catch (leadError) {
        console.error('Error loading leads:', leadError);
        toast.error('Failed to load leads data');
        // Continue with empty leads array
      }
      
      const convertedLeads = leads.filter(lead => lead.status === 'converted');
      
      // Load clients (if user has permission)
      let clients: any[] = [];
      if (profile && ['admin', 'closer', 'agent'].includes(profile.role)) {
        try {
          clients = await clientOperations.getClients(user.uid, profile.role);
        } catch (clientError) {
          console.error('Error loading clients:', clientError);
          toast.error('Failed to load clients data');
          // Continue with empty clients array
        }
      }
      
      // Calculate metrics
      // Filter out any undefined leads first, then process the valid ones
      const validLeads = leads.filter(lead => lead !== undefined && lead !== null);
      
      // Calculate total revenue from lead values
      const totalRevenue = validLeads.reduce((sum, lead) => {
        // Extract numeric value from string like "$5,000"
        const value = parseFloat((lead.value || '0').replace(/[^0-9.-]+/g, '')) || 0;
        return sum + value;
      }, 0);
      
      // Calculate conversion rate
      const conversionRate = validLeads.length > 0 
        ? Math.round((convertedLeads.length / validLeads.length) * 100)
        : 0;
      
      // Get active clients
      const activeClients = clients.filter(c => c.status === 'active').length;
      
      // Calculate growth rates by comparing to previous metrics
      const leadGrowth = previousMetrics.totalLeads > 0 
        ? Math.round(((validLeads.length - previousMetrics.totalLeads) / previousMetrics.totalLeads) * 100)
        : 0;
        
      const clientGrowth = previousMetrics.activeClients > 0 
        ? Math.round(((activeClients - previousMetrics.activeClients) / previousMetrics.activeClients) * 100)
        : 0;
        
      const revenueGrowth = previousMetrics.totalRevenue > 0 
        ? Math.round(((totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100)
        : 0;
        
      const conversionChange = previousMetrics.conversionRate > 0 
        ? Math.round((conversionRate - previousMetrics.conversionRate))
        : 0;
      
      // Store current metrics for future comparison
      setPreviousMetrics({
        totalLeads: validLeads.length,
        activeClients,
        totalRevenue,
        conversionRate,
      });

      setMetrics({
        totalLeads: validLeads.length,
        activeClients,
        monthlyRevenue: `$${totalRevenue.toLocaleString()}`,
        conversionRate: `${conversionRate}%`,
        leadGrowth: `${leadGrowth > 0 ? '+' : ''}${leadGrowth}%`,
        clientGrowth: `${clientGrowth > 0 ? '+' : ''}${clientGrowth}%`,
        revenueGrowth: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%`,
        conversionChange: `${conversionChange > 0 ? '+' : ''}${conversionChange}%`,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
      toast.error('Failed to load dashboard data');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const loadIntegrationStats = async () => {
    if (!user) return;

    try {
      // Get connected integrations count and details
      const integrationStatus = await checkIntegrationsSetup();
      const connectedCount = Object.entries(integrationStatus)
        .filter(([_, isConnected]) => isConnected)
        .length;
      
      // Create integration details array
      const integrationDetails = Object.entries(integrationStatus)
        .filter(([_, isConnected]) => isConnected)
        .map(([name, _]) => {
          let icon;
          switch(name) {
            case 'airtable': icon = Database; break;
            case 'calendly': icon = Calendar; break;
            case 'googleSheets': icon = Database; break;
            case 'googleCalendar': icon = Calendar; break;
            case 'gmail': icon = Mail; break;
            case 'zapier': icon = Workflow; break;
            case 'n8n': icon = Workflow; break;
            case 'make': icon = Workflow; break;
            default: icon = Globe;
          }
          
          // Format the name for display
          const displayName = name === 'googleSheets' ? 'Google Sheets' : 
                             name === 'googleCalendar' ? 'Google Calendar' : 
                             name.charAt(0).toUpperCase() + name.slice(1);
          
          return {
            name: displayName,
            status: 'active',
            icon
          };
        });
      
      // Get emails sent count
      const emailStats = await emailAnalyticsOperations.getEmailStats(user.uid);
      
      setIntegrationStats({
        connectedIntegrations: connectedCount,
        emailsSent: emailStats.total,
        integrationDetails
      });
    } catch (error) {
      console.error('Error loading integration stats:', error);
      // Don't show an error toast for this as it's not critical
    }
  };

  const handleRetry = () => {
    loadDashboardData();
    loadIntegrationStats();
  };

  const metricsData = [
    {
      name: 'Total Leads',
      value: metrics.totalLeads.toString(),
      change: metrics.leadGrowth,
      changeType: metrics.leadGrowth.startsWith('+') ? 'positive' : metrics.leadGrowth.startsWith('-') ? 'negative' : 'neutral',
      icon: UserPlus,
      description: 'Active prospects',
    },
    {
      name: 'Active Clients',
      value: metrics.activeClients.toString(),
      change: metrics.clientGrowth,
      changeType: metrics.clientGrowth.startsWith('+') ? 'positive' : metrics.clientGrowth.startsWith('-') ? 'negative' : 'neutral',
      icon: Users,
      description: 'Current clients',
    },
    {
      name: 'Total Value',
      value: metrics.monthlyRevenue,
      change: metrics.revenueGrowth,
      changeType: metrics.revenueGrowth.startsWith('+') ? 'positive' : metrics.revenueGrowth.startsWith('-') ? 'negative' : 'neutral',
      icon: DollarSign,
      description: 'Pipeline value',
    },
    {
      name: 'Conversion Rate',
      value: metrics.conversionRate,
      change: metrics.conversionChange,
      changeType: metrics.conversionChange.startsWith('+') ? 'positive' : metrics.conversionChange.startsWith('-') ? 'negative' : 'neutral',
      icon: TrendingUp,
      description: 'Lead to client',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.displayName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your business.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            All systems operational
          </Badge>
          {profile && (
            <Badge className={`${profile.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
              {profile.role.toUpperCase()}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.name}
                </CardTitle>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <metric.icon className="h-4 w-4 text-gray-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs">
                    {metric.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    ) : metric.changeType === 'negative' ? (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    ) : (
                      <span className="w-3 h-3 mr-1"></span>
                    )}
                    <span className={metric.changeType === 'positive' ? 'text-green-600' : metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'}>
                      {metric.change}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Integration Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connected Integrations */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Connected Integrations</h3>
                </div>
                <span className="text-2xl font-bold">{integrationStats.connectedIntegrations}</span>
              </div>
              
              {integrationStats.connectedIntegrations > 0 ? (
                <div className="space-y-2">
                  {integrationStats.integrationDetails.slice(0, 3).map((integration, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <integration.icon className="w-4 h-4 text-blue-500" />
                        <span>{integration.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    </div>
                  ))}
                  {integrationStats.integrationDetails.length > 3 && (
                    <div className="text-xs text-blue-600 mt-1">
                      +{integrationStats.integrationDetails.length - 3} more integrations
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">No integrations connected yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/integrations')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Connect Integrations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emails Sent */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-medium">Emails Sent</h3>
                </div>
                <span className="text-2xl font-bold">{integrationStats.emailsSent}</span>
              </div>
              
              {integrationStats.emailsSent > 0 ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Open rate:</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Click rate:</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => navigate('/email-outreach?tab=analytics')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">No emails sent yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate('/email-outreach')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Emails
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}