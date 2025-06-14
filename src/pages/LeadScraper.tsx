import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Filter,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Globe,
  Linkedin,
  Star,
  Eye,
  Send,
  UserPlus,
  Loader2,
  ArrowRight,
  AlertTriangle,
  Info,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { leadScraper, ScrapingParams, ScrapedLead } from '@/lib/leadScraper';
import { rateLimiter, RATE_LIMITS, getUserIdentifier } from '@/lib/rateLimiter';
import { ErrorHandler, handleAsync } from '@/lib/errorHandler';
import { leadOperations } from '@/lib/firestore';
import { usePlanEnforcement } from '@/hooks/usePlanEnforcement';
import { useNavigate } from 'react-router-dom';
import GoBackButton from '@/components/common/GoBackButton';

interface SearchParams {
  keywords: string;
  platform: string;
  location: string;
  industry: string;
  companySize: string;
  jobTitle: string;
}

const platforms = [
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, description: 'Professional network' },
  { value: 'google-maps', label: 'Google Maps', icon: MapPin, description: 'Local businesses' },
  { value: 'company-website', label: 'Company Websites', icon: Globe, description: 'Direct from websites' },
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Marketing',
  'Consulting',
  'Non-profit',
  'Food & Dining',
  'Hospitality',
  'Beauty & Wellness',
  'Fitness',
  'Legal',
  'Automotive',
  'Home Services',
];

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 75) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'linkedin':
      return Linkedin;
    case 'google-maps':
      return MapPin;
    case 'company-website':
      return Globe;
    default:
      return Globe;
  }
};

export default function LeadScraper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canPerformAction, updateUsage } = usePlanEnforcement();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keywords: '',
    platform: '',
    location: '',
    industry: '',
    companySize: '',
    jobTitle: '',
  });
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<ScrapedLead | null>(null);
  const [isSendingToCRM, setIsSendingToCRM] = useState(false);
  const [usageStats, setUsageStats] = useState({
    used: 0,
    limit: 0,
    remaining: 0,
    resetTime: new Date(),
  });

  // Load usage stats on component mount
  useEffect(() => {
    if (user) {
      loadUsageStats();
    }
  }, [user]);

  const loadUsageStats = () => {
    const identifier = getUserIdentifier(user?.uid);
    const status = rateLimiter.getStatus(`lead_scraping:${identifier}`);
    
    if (status) {
      setUsageStats({
        used: status.count,
        limit: RATE_LIMITS.LEAD_SCRAPING.maxRequests,
        remaining: Math.max(0, RATE_LIMITS.LEAD_SCRAPING.maxRequests - status.count),
        resetTime: new Date(status.resetTime),
      });
    } else {
      setUsageStats({
        used: 0,
        limit: RATE_LIMITS.LEAD_SCRAPING.maxRequests,
        remaining: RATE_LIMITS.LEAD_SCRAPING.maxRequests,
        resetTime: new Date(Date.now() + RATE_LIMITS.LEAD_SCRAPING.windowMs),
      });
    }
  };

  const handleSearch = async () => {
    if (!searchParams.keywords.trim()) {
      toast.error('Please enter search keywords');
      return;
    }

    if (!searchParams.platform) {
      toast.error('Please select a platform');
      return;
    }

    // Check plan limits
    const permission = canPerformAction('create_lead');
    if (!permission.allowed) {
      toast.error(permission.reason || 'You have reached your plan limit for lead creation');
      return;
    }

    setIsSearching(true);
    
    // Add to search history
    const searchQuery = `${searchParams.keywords} - ${searchParams.platform}`;
    setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]);

    try {
      // Prepare scraping parameters
      const scrapingParams: ScrapingParams = {
        source: searchParams.platform,
        keywords: searchParams.keywords,
        location: searchParams.location || undefined,
        industry: searchParams.industry || undefined,
        companySize: searchParams.companySize || undefined,
        jobTitle: searchParams.jobTitle || undefined,
        maxResults: 10,
      };

      // Perform the search
      const result = await handleAsync(
        () => leadScraper.scrapeLeads(scrapingParams, user?.uid),
        'lead_scraper_search'
      );

      if (result) {
        setLeads(result.leads);
        
        // Update usage stats
        loadUsageStats();
        
        // Update plan usage
        updateUsage('leads', 1);
        
        toast.success(`Found ${result.leads.length} leads`);
      }
    } catch (error) {
      // Error is already handled by handleAsync
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSendToCRM = async () => {
    if (!user) {
      toast.error('Please sign in to send leads to CRM');
      return;
    }

    if (selectedLeads.length === 0) {
      toast.error('Please select leads to send to CRM');
      return;
    }

    // Check plan limits
    const permission = canPerformAction('create_lead');
    if (!permission.allowed) {
      toast.error(permission.reason || 'You have reached your plan limit for lead creation');
      return;
    }

    setIsSendingToCRM(true);

    try {
      // Filter selected leads
      const leadsToSend = leads.filter(lead => selectedLeads.includes(lead.id));
      
      // Convert to CRM format
      const crmLeads = leadScraper.convertToCRMLeads(leadsToSend, user.uid);
      
      // Create leads in CRM
      const createdLeads = await Promise.all(
        crmLeads.map(lead => leadOperations.createLead(lead as any))
      );
      
      // Update plan usage
      updateUsage('leads', leadsToSend.length);
      
      toast.success(`${leadsToSend.length} leads sent to CRM successfully!`);
      setSelectedLeads([]);
    } catch (error) {
      toast.error('Failed to send leads to CRM. Please try again.');
      console.error('Error sending to CRM:', error);
    } finally {
      setIsSendingToCRM(false);
    }
  };

  const handleExportLeads = () => {
    if (leads.length === 0) {
      toast.error('No leads to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Title', 'Company', 'Email', 'Phone', 'Location', 'Platform', 'Score', 'Website'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.name,
        lead.title || '',
        lead.company || '',
        lead.email || '',
        lead.phone || '',
        lead.location || '',
        lead.platform,
        lead.score,
        lead.website || '',
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Leads exported successfully!');
  };

  const getUsagePercentage = () => {
    if (usageStats.limit === 0) return 0;
    return (usageStats.used / usageStats.limit) * 100;
  };

  const formatTimeUntilReset = () => {
    const now = new Date();
    const diff = usageStats.resetTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <GoBackButton />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Scraper</h1>
          <p className="text-gray-600 mt-1">Find and collect leads from various platforms</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-blue-700 border-blue-200">
            <Target className="w-3 h-3 mr-1" />
            {leads.length} leads found
          </Badge>
        </div>
      </motion.div>

      {/* Usage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Scraping Usage</h3>
                  <p className="text-sm text-blue-600">
                    {usageStats.used} of {usageStats.limit} searches used
                    {usageStats.resetTime && ` • Resets in ${formatTimeUntilReset()}`}
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-1/3">
                <div className="flex justify-between text-xs text-blue-700 mb-1">
                  <span>{usageStats.used} used</span>
                  <span>{usageStats.remaining} remaining</span>
                </div>
                <Progress 
                  value={getUsagePercentage()} 
                  className="h-2 bg-blue-200"
                  style={{ '--progress-background': 'rgb(37 99 235)' } as React.CSSProperties}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Parameters
            </CardTitle>
            <CardDescription>Configure your lead search criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords *</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., marketing director, CEO, founder"
                  value={searchParams.keywords}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, keywords: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select 
                  value={searchParams.platform} 
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center space-x-2">
                          <platform.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{platform.label}</div>
                            <div className="text-xs text-gray-500">{platform.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select 
                  value={searchParams.industry} 
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any industry</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select 
                  value={searchParams.companySize} 
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, companySize: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any size</SelectItem>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Director, Manager, VP"
                value={searchParams.jobTitle}
                onChange={(e) => setSearchParams(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchParams.keywords.trim() || !searchParams.platform}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Start Search
                    </>
                  )}
                </Button>
                {searchHistory.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Clock className="w-4 h-4 mr-2" />
                        Recent Searches
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {searchHistory.map((search, index) => (
                        <DropdownMenuItem key={index}>
                          <Clock className="w-4 h-4 mr-2" />
                          {search}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {leads.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleExportLeads}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={handleSendToCRM}
                    disabled={selectedLeads.length === 0 || isSendingToCRM}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSendingToCRM ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to CRM ({selectedLeads.length})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {isSearching ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Searching for Leads</h3>
            <p className="text-gray-600">
              Looking for "{searchParams.keywords}" on {platforms.find(p => p.value === searchParams.platform)?.label}...
            </p>
          </CardContent>
        </Card>
      ) : leads.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Search Results
                  </CardTitle>
                  <CardDescription>
                    Found {leads.length} potential leads matching your criteria
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedLeads.length === leads.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label className="text-sm">Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead, index) => {
                    const PlatformIcon = getPlatformIcon(lead.platform);
                    return (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>
                                {lead.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center space-x-2">
                                <span>{lead.name}</span>
                                {lead.verified && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <div className="text-sm text-gray-600">{lead.title}</div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {lead.location}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{lead.company}</div>
                            {lead.industry && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {lead.industry}
                              </Badge>
                            )}
                            {lead.companySize && (
                              <div className="text-xs text-gray-500 mt-1">
                                <Building className="w-3 h-3 inline mr-1" />
                                {lead.companySize}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                {lead.phone}
                              </div>
                            )}
                            {lead.connections && (
                              <div className="text-xs text-gray-500">
                                {lead.connections} connections
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <PlatformIcon className="w-4 h-4" />
                            <span className="text-sm capitalize">{lead.platform.replace('-', ' ')}</span>
                          </div>
                          {lead.lastActive && (
                            <div className="text-xs text-gray-500 mt-1">
                              Active: {lead.lastActive}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getScoreColor(lead.score)} font-medium`}>
                            {lead.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {lead.profileUrl && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(lead.profileUrl, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedLeads(prev => [...prev, lead.id]);
                                toast.success(`${lead.name} added to selection`);
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found yet</h3>
              <p className="text-gray-600 mb-4">
                Enter your search criteria and select a platform to start finding leads
              </p>
              <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-800 mb-2">Search Tips:</h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li className="flex items-start">
                    <ArrowRight className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                    <span>Be specific with your keywords (e.g., "marketing director fintech" instead of just "marketing")</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                    <span>Include location for better results (e.g., "San Francisco" or "Remote")</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                    <span>Try different platforms for different types of leads</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {selectedLead.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span>{selectedLead.name}</span>
                    {selectedLead.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{selectedLead.title} at {selectedLead.company}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Contact Information</Label>
                  <div className="space-y-2 mt-2">
                    {selectedLead.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedLead.email}
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedLead.phone}
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedLead.location}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Company Details</Label>
                  <div className="space-y-2 mt-2">
                    <div className="text-sm">{selectedLead.company}</div>
                    {selectedLead.industry && (
                      <Badge variant="outline">{selectedLead.industry}</Badge>
                    )}
                    {selectedLead.companySize && (
                      <div className="text-sm text-gray-600">{selectedLead.companySize}</div>
                    )}
                  </div>
                </div>
              </div>
              {selectedLead.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedLead.description}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <Badge className={`${getScoreColor(selectedLead.score)} font-medium`}>
                    Score: {selectedLead.score}%
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {React.createElement(getPlatformIcon(selectedLead.platform), { className: "w-4 h-4" })}
                    <span className="text-sm capitalize">{selectedLead.platform.replace('-', ' ')}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {selectedLead.profileUrl && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedLeads(prev => 
                        prev.includes(selectedLead.id) 
                          ? prev 
                          : [...prev, selectedLead.id]
                      );
                      setSelectedLead(null);
                      toast.success(`${selectedLead.name} added to selection`);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add to CRM
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rate Limit Warning */}
      {usageStats.remaining < usageStats.limit * 0.2 && usageStats.used > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 max-w-md"
        >
          <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Approaching Rate Limit</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You have {usageStats.remaining} searches remaining. Limit resets in {formatTimeUntilReset()}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}