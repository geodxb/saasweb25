import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Mail,
  Eye,
  MousePointer,
  MessageSquare,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/useAuth';
import { emailAnalyticsOperations, EmailAnalytics } from '@/lib/emailAnalytics';
import { toast } from 'sonner';

export default function EmailAnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<EmailAnalytics[]>([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState<EmailAnalytics[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    openRate: 0,
    clickRate: 0,
    replyRate: 0,
  });

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  useEffect(() => {
    filterAnalytics();
  }, [analytics, searchTerm, timeFilter, statusFilter]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await emailAnalyticsOperations.getEmailAnalytics(user.uid);
      setAnalytics(data);
      
      // Get summary statistics
      const statsData = await emailAnalyticsOperations.getEmailStats(user.uid);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading email analytics:', error);
      toast.error('Failed to load email analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      await loadAnalytics();
      toast.success('Analytics refreshed');
    } catch (error) {
      toast.error('Failed to refresh analytics');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterAnalytics = () => {
    let filtered = [...analytics];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leadEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply time filter
    const now = new Date();
    if (timeFilter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(item => item.sentAt >= startOfDay);
    } else if (timeFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => item.sentAt >= startOfWeek);
    } else if (timeFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(item => item.sentAt >= startOfMonth);
    }
    
    // Apply status filter
    if (statusFilter === 'opened') {
      filtered = filtered.filter(item => item.opens > 0);
    } else if (statusFilter === 'clicked') {
      filtered = filtered.filter(item => item.clicks > 0);
    } else if (statusFilter === 'replied') {
      filtered = filtered.filter(item => item.replies > 0);
    } else if (statusFilter === 'no-action') {
      filtered = filtered.filter(item => item.opens === 0 && item.clicks === 0 && item.replies === 0);
    }
    
    setFilteredAnalytics(filtered);
  };

  const exportAnalytics = () => {
    if (filteredAnalytics.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create CSV content
    const headers = ['Lead Name', 'Lead Email', 'Subject', 'Sent Date', 'Opens', 'Clicks', 'Replies', 'Last Action', 'Last Action Date'];
    const csvContent = [
      headers.join(','),
      ...filteredAnalytics.map(item => [
        `"${item.leadName.replace(/"/g, '""')}"`,
        `"${item.leadEmail.replace(/"/g, '""')}"`,
        `"${item.subject.replace(/"/g, '""')}"`,
        item.sentAt.toLocaleDateString(),
        item.opens,
        item.clicks,
        item.replies,
        item.lastActionType || 'none',
        item.lastActionAt ? item.lastActionAt.toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Analytics exported successfully');
  };

  const getStatusBadge = (item: EmailAnalytics) => {
    if (item.replies > 0) {
      return <Badge className="bg-green-100 text-green-800">Replied</Badge>;
    } else if (item.clicks > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Clicked</Badge>;
    } else if (item.opens > 0) {
      return <Badge className="bg-blue-100 text-blue-800">Opened</Badge>;
    } else {
      return <Badge variant="outline">Sent</Badge>;
    }
  };

  const formatTimeAgo = (date?: Date) => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Function to simulate tracking for demo purposes
  const simulateTracking = (emailId: string, type: 'open' | 'click') => {
    if (type === 'open') {
      window.mockTrackEmailOpen(emailId);
    } else {
      window.mockTrackLinkClick(emailId, 'demo-link-id', 'https://example.com');
    }
    
    // Refresh analytics after a short delay
    setTimeout(() => {
      refreshAnalytics();
      toast.success(`Email ${type === 'open' ? 'open' : 'click'} tracked successfully`);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading email analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <Badge variant="outline">{stats.total} emails</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">Total Emails Sent</h3>
                <p className="text-sm text-gray-500">Across all campaigns</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <Badge variant="outline">{stats.openRate.toFixed(1)}%</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">Open Rate</h3>
                <p className="text-sm text-gray-500">{stats.opened} of {stats.total} emails opened</p>
              </div>
              <Progress value={stats.openRate} className="h-1 mt-4" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MousePointer className="w-5 h-5 text-yellow-600" />
                </div>
                <Badge variant="outline">{stats.clickRate.toFixed(1)}%</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">Click Rate</h3>
                <p className="text-sm text-gray-500">{stats.clicked} of {stats.total} emails clicked</p>
              </div>
              <Progress value={stats.clickRate} className="h-1 mt-4" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <Badge variant="outline">{stats.replyRate.toFixed(1)}%</Badge>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">Reply Rate</h3>
                <p className="text-sm text-gray-500">{stats.replied} of {stats.total} emails replied</p>
              </div>
              <Progress value={stats.replyRate} className="h-1 mt-4" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by lead name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="no-action">No Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {filteredAnalytics.length !== analytics.length && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Showing {filteredAnalytics.length} of {analytics.length} emails
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSearchTerm('');
              setTimeFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Analytics Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Email Outreach Analytics</CardTitle>
            <CardDescription>Track the performance of your email outreach campaigns</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAnalytics}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportAnalytics}
              disabled={filteredAnalytics.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAnalytics.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-center">Opens</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead className="text-center">Replies</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalytics.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.leadName}</div>
                          <div className="text-sm text-gray-500">{item.leadEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="max-w-[200px] truncate">
                                {item.subject}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.subject}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{item.sentAt.toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant={item.opens > 0 ? "default" : "outline"} 
                                className={item.opens > 0 ? "bg-blue-100 text-blue-800 cursor-pointer" : "cursor-pointer"}
                                onClick={() => simulateTracking(item.id, 'open')}
                              >
                                {item.opens}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to simulate an open event</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant={item.clicks > 0 ? "default" : "outline"} 
                                className={item.clicks > 0 ? "bg-yellow-100 text-yellow-800 cursor-pointer" : "cursor-pointer"}
                                onClick={() => simulateTracking(item.id, 'click')}
                              >
                                {item.clicks}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to simulate a link click event</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.replies > 0 ? "default" : "outline"} className={item.replies > 0 ? "bg-green-100 text-green-800" : ""}>
                          {item.replies}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.lastActionAt ? (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            <span>{formatTimeAgo(item.lastActionAt)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">No activity</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => simulateTracking(item.id, 'open')}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email analytics found</h3>
              <p className="text-gray-600 mb-4">
                {analytics.length === 0 
                  ? 'Start sending emails to see analytics here' 
                  : 'No emails match your current filters'}
              </p>
              {analytics.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setTimeFilter('all');
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

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Email Tracking Tips</h3>
              <ul className="mt-2 space-y-1 text-blue-700">
                <li className="flex items-start">
                  <ArrowUpRight className="w-3 h-3 text-blue-600 mr-1 mt-1" />
                  <span>Email opens are tracked using a tracking pixel, which may be blocked by some email clients.</span>
                </li>
                <li className="flex items-start">
                  <ArrowUpRight className="w-3 h-3 text-blue-600 mr-1 mt-1" />
                  <span>Link clicks are tracked when recipients click on links in your emails.</span>
                </li>
                <li className="flex items-start">
                  <ArrowUpRight className="w-3 h-3 text-blue-600 mr-1 mt-1" />
                  <span>Replies are tracked when recipients respond to your emails.</span>
                </li>
                <li className="flex items-start">
                  <ArrowUpRight className="w-3 h-3 text-blue-600 mr-1 mt-1" />
                  <span>For demo purposes, you can click on the open/click counts to simulate tracking events.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}