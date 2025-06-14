import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Palette,
  Globe,
  Smartphone,
  Key,
  Trash2,
  Check,
  X,
  Plus,
  ExternalLink,
  AlertTriangle,
  Crown,
  Zap,
  Calendar,
  Mail,
  Database,
  Webhook,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Activity,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import BillingSection from '@/components/billing/BillingSection';
import IntegrationsSettings from '@/pages/settings/IntegrationsSettings';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string;
  permissions: string[];
  isVisible: boolean;
}

interface ConnectedService {
  id: string;
  name: string;
  description: string;
  icon: any;
  isConnected: boolean;
  lastSync?: string;
  status: 'active' | 'error' | 'pending';
}

const connectedServices: ConnectedService[] = [
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Schedule meetings and appointments',
    icon: Calendar,
    isConnected: true,
    lastSync: '2 hours ago',
    status: 'active',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and invoices',
    icon: CreditCard,
    isConnected: true,
    lastSync: '1 day ago',
    status: 'active',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation',
    icon: Mail,
    isConnected: false,
    status: 'pending',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps',
    icon: Zap,
    isConnected: true,
    lastSync: '5 minutes ago',
    status: 'error',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Database and project management',
    icon: Database,
    isConnected: false,
    status: 'pending',
  },
  {
    id: 'webhook',
    name: 'Custom Webhooks',
    description: 'Send data to custom endpoints',
    icon: Webhook,
    isConnected: true,
    lastSync: '30 minutes ago',
    status: 'active',
  },
];

export default function Settings() {
  const { user, profile, updateProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_51234567890abcdef',
      lastUsed: '2 hours ago',
      permissions: ['read', 'write'],
      isVisible: false,
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk_test_51234567890abcdef',
      lastUsed: '1 week ago',
      permissions: ['read'],
      isVisible: false,
    },
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    weekly: true,
    marketing: false,
    security: true,
  });

  const [profileData, setProfileData] = useState({
    displayName: profile?.displayName || '',
    email: user?.email || '',
    company: profile?.company || '',
    phone: profile?.phone || '',
    timezone: 'America/New_York',
    language: 'en',
  });

  const toggleApiKeyVisibility = (id: string) => {
    setApiKeys(keys => 
      keys.map(key => 
        key.id === id ? { ...key, isVisible: !key.isVisible } : key
      )
    );
  };

  const generateApiKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      lastUsed: 'Never',
      permissions: ['read'],
      isVisible: true,
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(keys => keys.filter(key => key.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    try {
      await updateProfile(user.uid, {
        displayName: profileData.displayName,
        company: profileData.company,
        phone: profileData.phone,
      });
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Danger Zone</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-lg">
                      {profileData.displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline">Change Avatar</Button>
                    <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed here</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      value={profileData.company}
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={profileData.timezone} onValueChange={(value) => setProfileData({...profileData, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={profileData.language} onValueChange={(value) => setProfileData({...profileData, language: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                  </div>
                  <Switch 
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Summary</Label>
                    <p className="text-sm text-gray-500">Get a weekly summary of your activity</p>
                  </div>
                  <Switch 
                    checked={notifications.weekly}
                    onCheckedChange={(checked) => setNotifications({...notifications, weekly: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Communications</Label>
                    <p className="text-sm text-gray-500">Receive product updates and tips</p>
                  </div>
                  <Switch 
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-gray-500">Important security notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.security}
                    onCheckedChange={(checked) => setNotifications({...notifications, security: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <BillingSection />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsSettings />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'new-lead', label: 'New lead created' },
                      { id: 'lead-converted', label: 'Lead converted to client' },
                      { id: 'task-assigned', label: 'Task assigned to you' },
                      { id: 'meeting-scheduled', label: 'Meeting scheduled' },
                      { id: 'workflow-completed', label: 'Workflow completed' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label htmlFor={`email-${item.id}`} className="text-sm">{item.label}</Label>
                        <Switch id={`email-${item.id}`} defaultChecked={true} />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Push Notifications</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'new-lead', label: 'New lead created' },
                      { id: 'lead-converted', label: 'Lead converted to client' },
                      { id: 'task-assigned', label: 'Task assigned to you' },
                      { id: 'meeting-scheduled', label: 'Meeting scheduled' },
                      { id: 'workflow-completed', label: 'Workflow completed' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label htmlFor={`push-${item.id}`} className="text-sm">{item.label}</Label>
                        <Switch id={`push-${item.id}`} defaultChecked={item.id === 'task-assigned'} />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">SMS Notifications</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'lead-converted', label: 'Lead converted to client' },
                      { id: 'meeting-scheduled', label: 'Meeting scheduled' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label htmlFor={`sms-${item.id}`} className="text-sm">{item.label}</Label>
                        <Switch id={`sms-${item.id}`} defaultChecked={false} />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">SMS Notifications</p>
                      <p className="text-xs text-blue-700 mt-1">
                        SMS notifications are only available on Pro and Agency plans. Standard SMS rates may apply.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password & Authentication</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-gray-500">Use an app like Google Authenticator</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-gray-500">Receive codes via text message</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Enable SMS
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login Sessions</CardTitle>
                <CardDescription>Manage your active login sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { device: 'MacBook Pro', location: 'New York, US', current: true, lastActive: 'Now' },
                    { device: 'iPhone 15', location: 'New York, US', current: false, lastActive: '2 hours ago' },
                    { device: 'Chrome Browser', location: 'Los Angeles, US', current: false, lastActive: '1 day ago' },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{session.device}</p>
                          {session.current && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{session.location} • {session.lastActive}</p>
                      </div>
                      {!session.current && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Revoke All Other Sessions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>Recent activity on your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      action: 'Login', 
                      details: 'Successful login from Chrome on macOS', 
                      time: '2 hours ago',
                      icon: User
                    },
                    { 
                      action: 'Lead Created', 
                      details: 'Created lead "Acme Corporation"', 
                      time: '1 day ago',
                      icon: UserPlus
                    },
                    { 
                      action: 'Password Changed', 
                      details: 'Your account password was updated', 
                      time: '1 week ago',
                      icon: Key
                    },
                    { 
                      action: 'API Key Generated', 
                      details: 'New API key created for development', 
                      time: '2 weeks ago',
                      icon: Key
                    },
                    { 
                      action: 'Profile Updated', 
                      details: 'Your profile information was updated', 
                      time: '3 weeks ago',
                      icon: User
                    },
                  ].map((activity, index) => {
                    const ActivityIcon = activity.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <ActivityIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activity.action}</p>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-600">{activity.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Activity Log
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-red-700">Export Account Data</p>
                    <p className="text-sm text-red-600">Download all your data before deleting your account</p>
                  </div>
                  <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                    Export Data
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-red-700">Delete Account</p>
                    <p className="text-sm text-red-600">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}