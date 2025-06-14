import { motion } from 'framer-motion';
import { Bell, Search, Plus, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import MobileNav from './MobileNav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import { APP_INFO } from '@/lib/config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { leadOperations } from '@/lib/firestore';

export default function Header({ className = "" }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState('lead');
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    value: '$0',
    source: 'manual',
    status: 'new',
    tags: ['manual-entry'],
    priority: 'medium',
    industry: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      analytics.track({
        name: AnalyticsEvents.SIGN_OUT,
        userId: user?.uid,
      });
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const getUserInitials = () => {
    if (profile?.displayName) {
      return profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'closer':
        return 'bg-purple-100 text-purple-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'setter':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickAddLead = async () => {
    if (!user) return;
    
    if (!leadData.name || !leadData.email) {
      toast.error('Name and email are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare lead data
      const newLead = {
        ...leadData,
        ownerId: user.uid,
        assignedTo: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Create lead in Firestore
      const leadId = await leadOperations.createLead(newLead);
      
      toast.success('Lead added successfully');
      setIsQuickAddOpen(false);
      
      // Reset form
      setLeadData({
        name: '',
        email: '',
        phone: '',
        company: '',
        value: '$0',
        source: 'manual',
        status: 'new',
        tags: ['manual-entry'],
        priority: 'medium',
        industry: '',
        notes: ''
      });
      
      // Track event
      analytics.track({
        name: AnalyticsEvents.LEAD_CREATED,
        properties: { source: 'quick_add' },
        userId: user.uid
      });
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className={`bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <MobileNav />
          
          <div className="flex items-center space-x-2 md:hidden">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/logo.svg" 
                alt="Locafy Logo" 
                className="h-auto w-[100px]" /* Set to exactly 100px width */
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGMEI0MjkiLz48L3N2Zz4=';
                }}
              />
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-md w-full hidden md:block"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search businesses, locations..."
              className="pl-10 pr-4 py-2 w-full rounded-xl"
            />
          </motion.div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block"
          >
            <Button variant="outline" size="sm" className="rounded-xl shadow-sm" onClick={() => setIsQuickAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full md:h-10 md:w-10">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-black text-white text-xs md:text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[280px] md:w-80" align="end" forceMount>
              <div className="flex items-center space-x-3 p-4">
                <Avatar className="h-10 w-10 md:h-12 md:w-12">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-black text-white text-sm md:text-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.displayName || user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {profile?.role && (
                    <Badge className={`text-xs ${getRoleColor(profile.role)}`} variant="secondary">
                      {profile.role.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Add Modal */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Quick Add</DialogTitle>
          </DialogHeader>
          <Tabs value={quickAddTab} onValueChange={setQuickAddTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lead">Lead</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
            </TabsList>
            <TabsContent value="lead" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name" 
                      value={leadData.name}
                      onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={leadData.email}
                      onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={leadData.phone}
                      onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      value={leadData.company}
                      onChange={(e) => setLeadData({...leadData, company: e.target.value})}
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input 
                      id="value" 
                      value={leadData.value}
                      onChange={(e) => setLeadData({...leadData, value: e.target.value})}
                      placeholder="$1,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={leadData.status} 
                      onValueChange={(value) => setLeadData({...leadData, status: value as any})}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    value={leadData.industry}
                    onChange={(e) => setLeadData({...leadData, industry: e.target.value})}
                    placeholder="Technology, Healthcare, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    value={leadData.notes}
                    onChange={(e) => setLeadData({...leadData, notes: e.target.value})}
                    placeholder="Add any additional information..."
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleQuickAddLead}
                  disabled={isSubmitting || !leadData.name || !leadData.email}
                >
                  {isSubmitting ? 'Adding...' : 'Add Lead'}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="client" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Company Name *</Label>
                    <Input id="clientName" placeholder="Acme Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input id="contactName" placeholder="John Smith" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email *</Label>
                    <Input id="clientEmail" type="email" placeholder="john@acme.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input id="clientPhone" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientIndustry">Industry</Label>
                  <Input id="clientIndustry" placeholder="Technology, Healthcare, etc." />
                </div>
                <Button className="w-full">Add Client</Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {[
              {
                title: 'New lead added',
                description: 'A new lead was added from Google Maps Scraper',
                time: '2 hours ago',
                unread: true
              },
              {
                title: 'Campaign completed',
                description: 'Your email campaign "Follow-up Sequence" has completed',
                time: '1 day ago',
                unread: true
              },
              {
                title: 'Subscription renewal',
                description: 'Your subscription will renew in 7 days',
                time: '2 days ago',
                unread: false
              },
              {
                title: 'New feature available',
                description: 'Check out our new AI Assistant capabilities',
                time: '1 week ago',
                unread: false
              }
            ].map((notification, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{notification.title}</h4>
                  {notification.unread && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">New</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm">Mark all as read</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings?tab=notifications')}>
              Notification Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}