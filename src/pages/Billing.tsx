import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  ArrowLeft,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import GoBackButton from '@/components/common/GoBackButton';
import StripeIntegration from '@/components/billing/StripeIntegration';
import PayPalIntegration from '@/components/billing/PayPalIntegration';

export default function Billing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stripe');
  const [isLoading, setIsLoading] = useState(true);
  const [billingSettings, setBillingSettings] = useState({
    autoBilling: true,
    defaultAmount: '50',
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSaveSettings = () => {
    toast.success('Billing settings saved successfully');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600 mt-1">Manage your payment integrations and transactions</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stripe" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Stripe</span>
            </TabsTrigger>
            <TabsTrigger value="paypal" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>PayPal</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stripe" className="space-y-6 pt-6">
            <StripeIntegration />
          </TabsContent>
          
          <TabsContent value="paypal" className="space-y-6 pt-6">
            <PayPalIntegration />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Billing Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Billing Settings</span>
            </CardTitle>
            <CardDescription>Configure your default billing preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-billing for Leads</Label>
                <p className="text-sm text-gray-500">Automatically charge clients when leads are delivered</p>
              </div>
              <Switch 
                checked={billingSettings.autoBilling}
                onCheckedChange={(checked) => setBillingSettings({...billingSettings, autoBilling: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultAmount">Default Charge Amount</Label>
              <Select 
                value={billingSettings.defaultAmount} 
                onValueChange={(value) => setBillingSettings({...billingSettings, defaultAmount: value})}
              >
                <SelectTrigger id="defaultAmount">
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">$25.00</SelectItem>
                  <SelectItem value="50">$50.00</SelectItem>
                  <SelectItem value="75">$75.00</SelectItem>
                  <SelectItem value="100">$100.00</SelectItem>
                  <SelectItem value="custom">Custom Amount</SelectItem>
                </SelectContent>
              </Select>
              {billingSettings.defaultAmount === 'custom' && (
                <div className="mt-2">
                  <Input 
                    type="number" 
                    placeholder="Enter custom amount" 
                    className="w-full"
                  />
                </div>
              )}
            </div>
            
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}