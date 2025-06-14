import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Plus,
  FileText,
  MessageSquare,
  Star,
  MapPin,
  Globe,
  Edit,
  Archive,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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

interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone?: string;
  company: string;
  website?: string;
  address?: string;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  projects: number;
  revenue: string;
  joinDate: string;
  industry: string;
  tags: string[];
  rating: number;
  notes: string;
  lastContact?: string;
  invoices: Array<{
    id: string;
    number: string;
    amount: string;
    status: 'paid' | 'pending' | 'overdue';
    date: string;
  }>;
  proposals: Array<{
    id: string;
    title: string;
    amount: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    date: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
  }>;
}

const clients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    contact: 'John Smith',
    email: 'john@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    website: 'https://acme.com',
    address: '123 Business St, New York, NY 10001',
    status: 'active',
    projects: 3,
    revenue: '$45,000',
    joinDate: 'Jan 2024',
    industry: 'Technology',
    tags: ['enterprise', 'high-value', 'recurring'],
    rating: 5,
    notes: 'Excellent client with consistent projects. Always pays on time and provides clear requirements.',
    lastContact: '2 days ago',
    invoices: [
      { id: 'INV-001', number: 'INV-2024-001', amount: '$15,000', status: 'paid', date: '2024-01-15' },
      { id: 'INV-002', number: 'INV-2024-002', amount: '$12,000', status: 'pending', date: '2024-01-20' },
    ],
    proposals: [
      { id: 'PROP-001', title: 'Website Redesign Phase 2', amount: '$18,000', status: 'accepted', date: '2024-01-10' },
    ],
    documents: [
      { id: 'DOC-001', name: 'Contract_Acme_2024.pdf', type: 'PDF', size: '2.4 MB', date: '2024-01-05' },
      { id: 'DOC-002', name: 'Brand_Guidelines.pdf', type: 'PDF', size: '5.1 MB', date: '2024-01-08' },
    ],
  },
  {
    id: '2',
    name: 'Design Co',
    contact: 'Jane Doe',
    email: 'jane@designco.com',
    phone: '+1 (555) 987-6543',
    company: 'Design Co',
    website: 'https://designco.com',
    address: '456 Creative Ave, Los Angeles, CA 90210',
    status: 'active',
    projects: 1,
    revenue: '$12,500',
    joinDate: 'Mar 2024',
    industry: 'Design',
    tags: ['creative', 'startup'],
    rating: 4,
    notes: 'Creative agency with unique design requirements. Good communication and collaborative approach.',
    lastContact: '1 week ago',
    invoices: [
      { id: 'INV-003', number: 'INV-2024-003', amount: '$12,500', status: 'paid', date: '2024-03-15' },
    ],
    proposals: [
      { id: 'PROP-002', title: 'Brand Identity Package', amount: '$8,500', status: 'sent', date: '2024-03-20' },
    ],
    documents: [
      { id: 'DOC-003', name: 'Project_Brief.docx', type: 'DOCX', size: '1.2 MB', date: '2024-03-10' },
    ],
  },
  {
    id: '3',
    name: 'StartupXYZ',
    contact: 'Bob Wilson',
    email: 'bob@startupxyz.com',
    phone: '+1 (555) 456-7890',
    company: 'StartupXYZ',
    status: 'inactive',
    projects: 2,
    revenue: '$28,000',
    joinDate: 'Dec 2023',
    industry: 'Startup',
    tags: ['startup', 'tech'],
    rating: 3,
    notes: 'Fast-growing startup. Sometimes delayed payments but good long-term potential.',
    lastContact: '3 weeks ago',
    invoices: [
      { id: 'INV-004', number: 'INV-2023-004', amount: '$15,000', status: 'overdue', date: '2023-12-15' },
      { id: 'INV-005', number: 'INV-2024-005', amount: '$13,000', status: 'paid', date: '2024-01-10' },
    ],
    proposals: [],
    documents: [
      { id: 'DOC-004', name: 'NDA_StartupXYZ.pdf', type: 'PDF', size: '800 KB', date: '2023-12-01' },
    ],
  },
];

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-red-100 text-red-800',
};

const invoiceStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
};

const proposalStatusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const tagColors: Record<string, string> = {
  enterprise: 'bg-purple-100 text-purple-800',
  'high-value': 'bg-green-100 text-green-800',
  recurring: 'bg-blue-100 text-blue-800',
  creative: 'bg-pink-100 text-pink-800',
  startup: 'bg-orange-100 text-orange-800',
  tech: 'bg-indigo-100 text-indigo-800',
};

interface ClientDetailModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

function ClientDetailModal({ client, isOpen, onClose }: ClientDetailModalProps) {
  const [notes, setNotes] = useState(client.notes);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {client.contact.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{client.company}</div>
              <div className="text-sm text-gray-600">{client.contact}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{client.website}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{client.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[client.status]}>
                      {client.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Industry:</span>
                    <span className="text-sm font-medium">{client.industry}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Projects:</span>
                    <span className="text-sm font-medium">{client.projects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="text-sm font-medium text-green-600">{client.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Client Since:</span>
                    <span className="text-sm font-medium">{client.joinDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex space-x-1">
                      {renderStars(client.rating)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={tagColors[tag] || 'bg-gray-100 text-gray-800'}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.number}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge className={invoiceStatusColors[invoice.status]}>
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                {client.proposals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.proposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell className="font-medium">{proposal.title}</TableCell>
                          <TableCell>{proposal.amount}</TableCell>
                          <TableCell>
                            <Badge className={proposalStatusColors[proposal.status]}>
                              {proposal.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{proposal.date}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No proposals yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="font-medium">{document.name}</div>
                          <div className="text-sm text-gray-500">
                            {document.type} • {document.size} • {document.date}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this client..."
                    className="min-h-32"
                  />
                </div>
                <Button>Save Notes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client profile with their contact information and details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" placeholder="Acme Corporation" />
            </div>
            <div>
              <Label htmlFor="contact">Contact Person</Label>
              <Input id="contact" placeholder="John Smith" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@acme.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 123-4567" />
            </div>
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://acme.com" />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="123 Business St, New York, NY 10001" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Initial Notes</Label>
            <Textarea id="notes" placeholder="Add any initial notes about this client..." />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onClose}>Add Client</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const industries = Array.from(new Set(clients.map(client => client.industry)));

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships and projects</p>
        </div>
        <Button onClick={() => setIsAddClientOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedClient(client)}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {client.contact.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{client.company}</CardTitle>
                    <p className="text-sm text-gray-600">{client.contact}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Client
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[client.status]}>
                    {client.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500">{client.industry}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    {client.projects} projects
                  </div>
                  <div className="flex items-center text-green-600 font-medium">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {client.revenue}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {client.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Client since {client.joinDate}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {client.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {client.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{client.tags.length - 2}
                    </Badge>
                  )}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />
    </div>
  );
}