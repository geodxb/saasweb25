import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  Globe,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Eye,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { adminOperations } from '@/lib/admin';
import { stripeUtils } from '@/lib/stripe';
import { toast } from 'sonner';

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalLeads: number;
  monthlyLeads: number;
  conversionRate: number;
  churnRate: number;
  averageRevenuePerUser: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RevenueData {
  month: string;
  revenue: number;
  users: number;
  leads: number;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadAdminData();
    }
  }, [profile, timeRange]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      const [metricsData, revenueChartData, alertsData] = await Promise.all([
        adminOperations.getSystemMetrics(timeRange),
        adminOperations.getRevenueData(timeRange),
        adminOperations.getSystemAlerts(),
      ]);

      setMetrics(metricsData);
      setRevenueData(revenueChartData);
      setSystemAlerts(alertsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAdminData();
    toast.success('Dashboard data refreshed');
  };

  const handleExportData = async () => {
    try {
      await adminOperations.exportSystemData(timeRange);
      toast.success('System data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const getMetricChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, type: 'neutral' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      type: change > 0 ? 'positive' as const : change < 0 ? 'negative' as const : 'neutral' as const,
    };
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return AlertCircle;
      case 'warning':
        return Clock;
      default:
        return CheckCircle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* System Health Alert */}
      {metrics?.systemHealth !== 'healthy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            metrics.systemHealth === 'critical' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className={`w-5 h-5 ${
              metrics.systemHealth === 'critical' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <h3 className={`font-medium ${
                metrics.systemHealth === 'critical' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                System Health: {metrics.systemHealth.toUpperCase()}
              </h3>
              <p className={`text-sm ${
                metrics.systemHealth === 'critical' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {metrics.systemHealth === 'critical' 
                  ? 'Critical issues detected. Immediate attention required.'
                  : 'Some issues detected. Please review system alerts.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Total Users',
              value: metrics.totalUsers.toLocaleString(),
              change: getMetricChange(metrics.totalUsers, metrics.totalUsers * 0.9),
              icon: Users,
              description: `${metrics.activeUsers} active`,
            },
            {
              name: 'Monthly Revenue',
              value: stripeUtils.formatPrice(metrics.monthlyRevenue, 'MXN'),
              change: getMetricChange(metrics.monthlyRevenue, metrics.monthlyRevenue * 0.85),
              icon: DollarSign,
              description: 'This month',
            },
            {
              name: 'Total Leads',
              value: metrics.totalLeads.toLocaleString(),
              change: getMetricChange(metrics.totalLeads, metrics.totalLeads * 0.8),
              icon: UserPlus,
              description: `${metrics.monthlyLeads} this month`,
            },
            {
              name: 'Conversion Rate',
              value: `${metrics.conversionRate.toFixed(1)}%`,
              change: getMetricChange(metrics.conversionRate, metrics.conversionRate * 0.95),
              icon: TrendingUp,
              description: 'Lead to client',
            },
          ].map((metric, index) => (
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
                      {metric.change.type === 'positive' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                      ) : metric.change.type === 'negative' ? (
                        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                      ) : null}
                      <span className={
                        metric.change.type === 'positive' ? 'text-green-600' : 
                        metric.change.type === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }>
                        {metric.change.value > 0 ? `${metric.change.value.toFixed(1)}%` : 'No change'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{metric.description}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Revenue chart would be displayed here</p>
                      <p className="text-sm">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New users over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>User growth chart would be displayed here</p>
                      <p className="text-sm">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium">{stripeUtils.formatPrice(metrics.totalRevenue, 'MXN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ARPU:</span>
                      <span className="font-medium">{stripeUtils.formatPrice(metrics.averageRevenuePerUser, 'MXN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Churn Rate:</span>
                      <span className="font-medium">{metrics.churnRate.toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database:</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Database className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">API:</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Globe className="w-3 h-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Services:</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Zap className="w-3 h-3 mr-1" />
                        Running
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="w-4 h-4 mr-2" />
                      View Billing
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      System Logs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Revenue Analytics</h3>
                    <p>Detailed revenue charts and analytics would be displayed here</p>
                    <p className="text-sm mt-2">Including MRR, ARR, churn analysis, and cohort data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>Recent system events and user activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Activity Feed</h3>
                    <p>Real-time system activity and user events would be displayed here</p>
                    <p className="text-sm mt-2">Including logins, subscriptions, lead activities, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Monitor system health and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.length > 0 ? (
                    systemAlerts.map((alert) => {
                      const AlertIcon = getAlertIcon(alert.type);
                      return (
                        <div
                          key={alert.id}
                          className={`flex items-start space-x-3 p-4 rounded-lg border ${
                            alert.resolved ? 'bg-gray-50 border-gray-200' : getAlertColor(alert.type)
                          }`}
                        >
                          <AlertIcon className={`w-5 h-5 mt-0.5 ${
                            alert.resolved ? 'text-gray-400' : 
                            alert.type === 'error' ? 'text-red-600' :
                            alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {alert.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {alert.resolved && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Resolved
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
                      <h3 className="text-lg font-medium mb-2">All Clear!</h3>
                      <p>No system alerts at this time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}