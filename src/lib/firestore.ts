import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
  setDoc,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { analytics, AnalyticsEvents } from '@/lib/analytics';

// Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  value?: string; // Added explicit value property to the interface
  source: string;
  status: 'new' | 'contacted' | 'proposal' | 'converted' | 'lost';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastContact?: Date;
  notes?: string;
  ownerId: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  industry?: string;
  website?: string;
  address?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  customFields?: Record<string, any>;
  // Integration usage metrics
  airtableImportsCount?: number;
  airtableExportsCount?: number;
  calendlyLinksGeneratedCount?: number;
}

export interface LeadAI {
  leadId: string;
  summary?: string;
  emailDraft?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
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
  joinDate: Date;
  industry: string;
  tags: string[];
  rating: number;
  notes: string;
  lastContact?: Date;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'lead_created' | 'lead_updated' | 'lead_converted' | 'client_created' | 'client_updated';
  entityId: string;
  entityType: 'lead' | 'client';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AIChat {
  id: string;
  userId: string;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'closer' | 'agent' | 'setter' | 'user';
  createdAt: Date;
  updatedAt: Date;
  photoURL?: string;
  company?: string;
  phone?: string;
  // Integration settings
  calendlyLink?: string;
  // Integration usage metrics
  airtableImportsCount?: number;
  airtableExportsCount?: number;
  calendlyLinksGeneratedCount?: number;
  googleSheetsImportsCount?: number;
  googleSheetsExportsCount?: number;
  googleCalendarEventsCount?: number;
}

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

// Helper function to convert document data
const convertLeadData = (doc: QueryDocumentSnapshot<DocumentData>): Lead => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    lastContact: data.lastContact ? convertTimestamp(data.lastContact) : undefined,
  } as Lead;
};

const convertClientData = (doc: QueryDocumentSnapshot<DocumentData>): Client => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    joinDate: convertTimestamp(data.joinDate),
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    lastContact: data.lastContact ? convertTimestamp(data.lastContact) : undefined,
  } as Client;
};

const convertActivityData = (doc: QueryDocumentSnapshot<DocumentData>): Activity => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
  } as Activity;
};

const convertChatData = (doc: QueryDocumentSnapshot<DocumentData>): AIChat => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    messages: data.messages?.map((msg: any) => ({
      ...msg,
      timestamp: convertTimestamp(msg.timestamp),
    })) || [],
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as AIChat;
};

const convertUserProfileData = (doc: QueryDocumentSnapshot<DocumentData>): UserProfile => {
  const data = doc.data();
  return {
    uid: doc.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  } as UserProfile;
};

// Mock data for offline mode
const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Inc',
    source: 'website',
    status: 'new',
    tags: ['hot', 'website'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ownerId: 'user123',
    assignedTo: 'user123',
    priority: 'high',
    industry: 'Technology',
    notes: 'Interested in our premium plan',
    value: '$5000',
  },
  {
    id: 'lead-2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 987-6543',
    company: 'Johnson Design',
    source: 'referral',
    status: 'contacted',
    tags: ['design', 'referral'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    ownerId: 'user123',
    assignedTo: 'user123',
    priority: 'medium',
    industry: 'Design',
    notes: 'Follow up next week',
    value: '$3000',
  },
  {
    id: 'lead-3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    company: 'Brown Consulting',
    source: 'google-maps',
    status: 'proposal',
    tags: ['consulting', 'enterprise'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    ownerId: 'user123',
    assignedTo: 'user123',
    priority: 'high',
    industry: 'Consulting',
    notes: 'Sent proposal on 5/15',
    value: '$10000',
  }
];

const mockClients: Client[] = [
  {
    id: 'client-1',
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
    joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    industry: 'Technology',
    tags: ['enterprise', 'high-value', 'recurring'],
    rating: 5,
    notes: 'Excellent client with consistent projects. Always pays on time and provides clear requirements.',
    ownerId: 'user123',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  }
];

// Lead operations with real-time support
export const leadOperations = {
  // Get all leads for current user with real-time updates
  subscribeToLeads(userId: string, callback: (leads: Lead[]) => void, userRole?: string): Unsubscribe {
    let q;
    
    try {
      // Admins can see all leads - use simple query without composite index
      if (userRole === 'admin') {
        q = query(
          collection(db, 'leads'),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Regular users only see their own leads - use simple query without composite index
        q = query(
          collection(db, 'leads'),
          where('ownerId', '==', userId)
        );
      }
      
      return onSnapshot(q, (snapshot) => {
        const leads = snapshot.docs.map(convertLeadData);
        // Sort manually to avoid composite index requirement
        leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        callback(leads);
      }, (error) => {
        console.error('Error in leads subscription:', error);
        // Return mock data in case of error
        console.log('Using mock lead data due to Firestore error');
        callback(mockLeads);
      });
    } catch (error) {
      console.error('Error setting up leads subscription:', error);
      // Return mock data in case of error
      console.log('Using mock lead data due to Firestore error');
      callback(mockLeads);
      return () => {}; // Return empty unsubscribe function
    }
  },

  // Get leads with pagination
  async getLeads(userId: string, userRole?: string, limitCount = 50): Promise<Lead[]> {
    try {
      let q;
      
      // Admins can see all leads - use simple query without composite index
      if (userRole === 'admin') {
        q = query(
          collection(db, 'leads'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        // Regular users only see their own leads - use simple query without composite index
        q = query(
          collection(db, 'leads'),
          where('ownerId', '==', userId),
          limit(limitCount)
        );
      }
      
      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map(convertLeadData);
      
      // Sort manually to avoid composite index requirement for non-admin users
      if (userRole !== 'admin') {
        leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      return leads;
    } catch (error) {
      console.error('Error fetching leads:', error);
      console.log('Using mock lead data due to Firestore error');
      // Return mock data in case of error
      return mockLeads;
    }
  },

  // Get leads by status
  async getLeadsByStatus(userId: string, status: Lead['status'], userRole?: string): Promise<Lead[]> {
    try {
      let q;
      
      // Admins can see all leads
      if (userRole === 'admin') {
        q = query(
          collection(db, 'leads'),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Regular users only see their own leads - use simple query without composite index
        q = query(
          collection(db, 'leads'),
          where('ownerId', '==', userId),
          where('status', '==', status)
        );
      }
      
      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map(convertLeadData);
      
      // Sort manually for non-admin users
      if (userRole !== 'admin') {
        leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      return leads;
    } catch (error) {
      console.error('Error fetching leads by status:', error);
      // Return filtered mock data
      return mockLeads.filter(lead => lead.status === status);
    }
  },

  // Get single lead by ID
  async getLead(leadId: string, userId: string, userRole?: string): Promise<Lead | null> {
    try {
      const docRef = doc(db, 'leads', leadId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const leadData = convertLeadData(docSnap as QueryDocumentSnapshot<DocumentData>);
      
      // Check if user has permission to view this lead
      if (userRole === 'admin' || leadData.ownerId === userId || leadData.assignedTo === userId) {
        return leadData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching lead:', error);
      // Return mock lead if ID matches
      const mockLead = mockLeads.find(lead => lead.id === leadId);
      return mockLead || null;
    }
  },

  // Create new lead
  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Add timestamps
      const dataWithTimestamps = {
        ...leadData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Create document in Firestore
      const docRef = await addDoc(collection(db, 'leads'), dataWithTimestamps);
      
      // Log activity
      await activityOperations.logActivity({
        userId: leadData.ownerId,
        type: 'lead_created',
        entityId: docRef.id,
        entityType: 'lead',
        description: `Created lead: ${leadData.name}`,
        metadata: { leadName: leadData.name, company: leadData.company },
      });

      // Track in analytics
      analytics.track({
        name: AnalyticsEvents.LEAD_CREATED,
        properties: { 
          leadSource: leadData.source,
        },
        userId: leadData.ownerId,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating lead:', error);
      // Generate a mock ID for offline mode
      const mockId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Created mock lead with ID: ${mockId}`);
      return mockId;
    }
  },

  // Update lead
  async updateLead(leadId: string, updates: Partial<Lead>, userId: string, userRole?: string): Promise<void> {
    try {
      // Get the lead to check permissions
      const lead = await this.getLead(leadId, userId, userRole);
      
      if (!lead) {
        throw new Error('Lead not found or unauthorized');
      }
      
      // Check if user has permission to update this lead
      if (userRole !== 'admin' && lead.ownerId !== userId && lead.assignedTo !== userId) {
        throw new Error('Unauthorized to update this lead');
      }
      
      // Add timestamp
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      // Update document in Firestore
      const docRef = doc(db, 'leads', leadId);
      await updateDoc(docRef, updatesWithTimestamp);
      
      // Log activity
      await activityOperations.logActivity({
        userId,
        type: 'lead_updated',
        entityId: leadId,
        entityType: 'lead',
        description: `Updated lead: ${lead.name}`,
        metadata: { updates },
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      console.log('Simulating lead update in offline mode');
      // In offline mode, we just log the update but don't throw an error
    }
  },

  // Delete lead
  async deleteLead(leadId: string, userId: string, userRole?: string): Promise<void> {
    try {
      // Get the lead to check permissions
      const lead = await this.getLead(leadId, userId, userRole);
      
      if (!lead) {
        throw new Error('Lead not found or unauthorized');
      }
      
      // Check if user has permission to delete this lead
      if (userRole !== 'admin' && lead.ownerId !== userId) {
        throw new Error('Unauthorized to delete this lead');
      }
      
      // Delete document from Firestore
      const docRef = doc(db, 'leads', leadId);
      await deleteDoc(docRef);
      
      // Log activity
      await activityOperations.logActivity({
        userId,
        type: 'lead_updated',
        entityId: leadId,
        entityType: 'lead',
        description: `Deleted lead: ${lead.name}`,
        metadata: { leadName: lead.name },
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      console.log('Simulating lead deletion in offline mode');
      // In offline mode, we just log the deletion but don't throw an error
    }
  },

  // Convert lead to client
  async convertToClient(leadId: string, userId: string, userRole?: string): Promise<string> {
    try {
      // Get the lead to check permissions
      const lead = await this.getLead(leadId, userId, userRole);
      
      if (!lead) {
        throw new Error('Lead not found or unauthorized');
      }
      
      // Check if user has permission to convert this lead
      if (userRole !== 'admin' && userRole !== 'closer' && userRole !== 'agent' && lead.ownerId !== userId) {
        throw new Error('Unauthorized to convert this lead');
      }

      // Create client from lead data
      const clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
        name: lead.company || lead.name,
        contact: lead.name,
        email: lead.email,
        phone: lead.phone ?? null,
        company: lead.company || lead.name,
        website: lead.customFields?.website ?? null,
        address: lead.address ?? null,
        status: 'active',
        projects: 0,
        revenue: '$0',
        joinDate: new Date(),
        industry: lead.industry || 'Other',
        tags: lead.tags,
        rating: 5,
        notes: lead.notes || '',
        ownerId: lead.ownerId,
      };

      const clientId = await clientOperations.createClient(clientData);

      // Update lead status to converted
      await this.updateLead(leadId, { status: 'converted' }, userId, userRole);

      // Log activity
      await activityOperations.logActivity({
        userId,
        type: 'lead_converted',
        entityId: leadId,
        entityType: 'lead',
        description: `Converted lead to client: ${lead.name}`,
        metadata: { leadName: lead.name, clientId },
      });

      // Track in analytics
      analytics.track({
        name: AnalyticsEvents.LEAD_CONVERTED,
        properties: { 
          leadSource: lead.source,
          daysToConversion: Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        },
        userId,
      });

      return clientId;
    } catch (error) {
      console.error('Error converting lead:', error);
      // Generate a mock client ID for offline mode
      const mockClientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Created mock client with ID: ${mockClientId}`);
      return mockClientId;
    }
  },

  // Add note to lead
  async addNote(leadId: string, note: string, userId: string, userRole?: string): Promise<void> {
    try {
      // Get the lead to check permissions
      const lead = await this.getLead(leadId, userId, userRole);
      
      if (!lead) {
        throw new Error('Lead not found or unauthorized');
      }
      
      // Check if user has permission to add notes to this lead
      if (userRole !== 'admin' && lead.ownerId !== userId && lead.assignedTo !== userId) {
        throw new Error('Unauthorized to add notes to this lead');
      }

      const existingNotes = lead.notes || '';
      const timestamp = new Date().toLocaleString();
      const newNote = `${timestamp}: ${note}`;
      const updatedNotes = existingNotes ? `${existingNotes}\n\n${newNote}` : newNote;

      await this.updateLead(leadId, { 
        notes: updatedNotes,
        lastContact: new Date()
      }, userId, userRole);
    } catch (error) {
      console.error('Error adding note:', error);
      console.log('Simulating note addition in offline mode');
      // In offline mode, we just log the note addition but don't throw an error
    }
  },
  
  // Batch import leads
  async importLeads(leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const leadIds: string[] = [];
      
      leads.forEach(leadData => {
        const newLeadRef = doc(collection(db, 'leads'));
        leadIds.push(newLeadRef.id);
        
        batch.set(newLeadRef, {
          ...leadData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
      return leadIds;
    } catch (error) {
      console.error('Error importing leads:', error);
      // Generate mock IDs for offline mode
      const mockIds = leads.map(() => `lead-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
      console.log(`Created ${mockIds.length} mock leads in offline mode`);
      return mockIds;
    }
  }
};

// Client operations with real-time support
export const clientOperations = {
  // Subscribe to clients with real-time updates
  subscribeToClients(userId: string, callback: (clients: Client[]) => void, userRole?: string): Unsubscribe {
    let q;
    
    try {
      // Admins can see all clients
      if (userRole === 'admin') {
        q = query(
          collection(db, 'clients'),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'closer' || userRole === 'agent') {
        // Closers and agents can see all clients
        q = query(
          collection(db, 'clients'),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Regular users only see their own clients - use simple query
        q = query(
          collection(db, 'clients'),
          where('ownerId', '==', userId)
        );
      }
      
      return onSnapshot(q, (snapshot) => {
        const clients = snapshot.docs.map(convertClientData);
        // Sort manually for non-admin/closer/agent users
        if (userRole !== 'admin' && userRole !== 'closer' && userRole !== 'agent') {
          clients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        callback(clients);
      }, (error) => {
        console.error('Error in clients subscription:', error);
        // Return mock data in case of error
        console.log('Using mock client data due to Firestore error');
        callback(mockClients);
      });
    } catch (error) {
      console.error('Error setting up clients subscription:', error);
      // Return mock data in case of error
      console.log('Using mock client data due to Firestore error');
      callback(mockClients);
      return () => {}; // Return empty unsubscribe function
    }
  },

  // Get all clients for current user
  async getClients(userId: string, userRole?: string): Promise<Client[]> {
    try {
      let q;
      
      // Admins can see all clients
      if (userRole === 'admin') {
        q = query(
          collection(db, 'clients'),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'closer' || userRole === 'agent') {
        // Closers and agents can see all clients
        q = query(
          collection(db, 'clients'),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Regular users only see their own clients - use simple query
        q = query(
          collection(db, 'clients'),
          where('ownerId', '==', userId)
        );
      }
      
      const snapshot = await getDocs(q);
      const clients = snapshot.docs.map(convertClientData);
      
      // Sort manually for non-admin/closer/agent users
      if (userRole !== 'admin' && userRole !== 'closer' && userRole !== 'agent') {
        clients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Return mock data in case of error
      return mockClients;
    }
  },

  // Create new client
  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Add timestamps
      const dataWithTimestamps = {
        ...clientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Create document in Firestore
      const docRef = await addDoc(collection(db, 'clients'), dataWithTimestamps);
      
      // Log activity
      await activityOperations.logActivity({
        userId: clientData.ownerId,
        type: 'client_created',
        entityId: docRef.id,
        entityType: 'client',
        description: `Created client: ${clientData.name}`,
        metadata: { clientName: clientData.name, company: clientData.company },
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating client:', error);
      // Generate a mock ID for offline mode
      const mockId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Created mock client with ID: ${mockId}`);
      return mockId;
    }
  },

  // Update client
  async updateClient(clientId: string, updates: Partial<Client>, userId: string, userRole?: string): Promise<void> {
    try {
      // Get the client to check permissions
      const clientRef = doc(db, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);
      
      if (!clientSnap.exists()) {
        throw new Error('Client not found');
      }
      
      const clientData = convertClientData(clientSnap as QueryDocumentSnapshot<DocumentData>);
      
      // Check if user has permission to update this client
      if (userRole !== 'admin' && userRole !== 'closer' && userRole !== 'agent' && clientData.ownerId !== userId) {
        throw new Error('Unauthorized to update this client');
      }
      
      // Add timestamp
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      // Update document in Firestore
      await updateDoc(clientRef, updatesWithTimestamp);
      
      // Log activity
      await activityOperations.logActivity({
        userId,
        type: 'client_updated',
        entityId: clientId,
        entityType: 'client',
        description: `Updated client: ${clientData.name}`,
        metadata: { updates },
      });
    } catch (error) {
      console.error('Error updating client:', error);
      console.log('Simulating client update in offline mode');
      // In offline mode, we just log the update but don't throw an error
    }
  },

  // Delete client
  async deleteClient(clientId: string, userId: string, userRole?: string): Promise<void> {
    try {
      // Get the client to check permissions
      const clientRef = doc(db, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);
      
      if (!clientSnap.exists()) {
        throw new Error('Client not found');
      }
      
      const clientData = convertClientData(clientSnap as QueryDocumentSnapshot<DocumentData>);
      
      // Check if user has permission to delete this client
      if (userRole !== 'admin' && clientData.ownerId !== userId) {
        throw new Error('Unauthorized to delete this client');
      }
      
      // Delete document from Firestore
      await deleteDoc(clientRef);
    } catch (error) {
      console.error('Error deleting client:', error);
      console.log('Simulating client deletion in offline mode');
      // In offline mode, we just log the deletion but don't throw an error
    }
  }
};

// Activity operations
export const activityOperations = {
  // Log activity
  async logActivity(activityData: Omit<Activity, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Add timestamp
      const dataWithTimestamp = {
        ...activityData,
        createdAt: serverTimestamp(),
      };
      
      // Create document in Firestore
      const docRef = await addDoc(collection(db, 'activities'), dataWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Generate a mock ID for offline mode
      return `activity-${Date.now()}`;
    }
  },

  // Get user activities
  async getUserActivities(userId: string, limitCount = 20): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(convertActivityData);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      // Return empty array in case of error
      return [];
    }
  }
};

// AI Chat operations
export const aiChatOperations = {
  // Subscribe to user chats
  subscribeToChats(userId: string, callback: (chats: AIChat[]) => void): Unsubscribe {
    try {
      const q = query(
        collection(db, 'aiChats'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(convertChatData);
        callback(chats);
      }, (error) => {
        console.error('Error in chats subscription:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up chats subscription:', error);
      callback([]);
      return () => {}; // Return empty unsubscribe function
    }
  },

  // Create new chat
  async createChat(userId: string, title: string): Promise<string> {
    try {
      const chatData = {
        userId,
        title,
        messages: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'aiChats'), chatData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      // Generate a mock ID for offline mode
      return `chat-${Date.now()}`;
    }
  },

  // Update chat with new message
  async addMessage(chatId: string, message: { role: 'user' | 'assistant'; content: string }): Promise<void> {
    try {
      const chatRef = doc(db, 'aiChats', chatId);
      
      const messageWithId = {
        ...message,
        id: Date.now().toString(),
        timestamp: serverTimestamp(),
      };
      
      await updateDoc(chatRef, {
        messages: arrayUnion(messageWithId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding message:', error);
      console.log('Simulating message addition in offline mode');
      // In offline mode, we just log the message addition but don't throw an error
    }
  }
};

// User profile operations
export const userProfileOperations = {
  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return convertUserProfileData(docSnap as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Create a fallback profile for offline mode
      if (auth.currentUser && auth.currentUser.uid === uid) {
        console.log('Creating fallback user profile for offline mode');
        return {
          uid,
          email: auth.currentUser.email || 'user@example.com',
          displayName: auth.currentUser.displayName || 'User',
          role: 'admin', // Give admin role by default in offline mode
          createdAt: new Date(),
          updatedAt: new Date(),
          photoURL: auth.currentUser.photoURL || undefined,
        };
      }
      
      return null;
    }
  },

  // Create user profile
  async createUserProfile(uid: string, profile: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      
      const profileWithTimestamps = {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Initialize integration usage counters
        airtableImportsCount: 0,
        airtableExportsCount: 0,
        calendlyLinksGeneratedCount: 0,
        googleSheetsImportsCount: 0,
        googleSheetsExportsCount: 0,
        googleCalendarEventsCount: 0
      };
      
      await setDoc(docRef, profileWithTimestamps);
    } catch (error) {
      console.error('Error creating user profile:', error);
      console.log('Simulating user profile creation in offline mode');
      // In offline mode, we just log the profile creation but don't throw an error
    }
  },

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, updatesWithTimestamp);
    } catch (error) {
      console.error('Error updating user profile:', error);
      console.log('Simulating user profile update in offline mode');
      // In offline mode, we just log the profile update but don't throw an error
    }
  },

  // Save or update Calendly link
  async saveCalendlyLink(uid: string, calendlyLink: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      
      await updateDoc(docRef, {
        calendlyLink,
        updatedAt: serverTimestamp(),
      });
      
      console.log(`Saved Calendly link for user ${uid}`);
    } catch (error) {
      console.error('Error saving Calendly link:', error);
      console.log('Simulating Calendly link save in offline mode');
    }
  },

  // Get user's Calendly link
  async getCalendlyLink(uid: string): Promise<string | null> {
    try {
      const profile = await this.getUserProfile(uid);
      return profile?.calendlyLink || null;
    } catch (error) {
      console.error('Error getting Calendly link:', error);
      return null;
    }
  },

  // Increment integration usage counter
  async incrementIntegrationCounter(uid: string, counterName: 'airtableImportsCount' | 'airtableExportsCount' | 'calendlyLinksGeneratedCount' | 'googleSheetsImportsCount' | 'googleSheetsExportsCount' | 'googleCalendarEventsCount'): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      
      await updateDoc(docRef, {
        [counterName]: increment(1),
        updatedAt: serverTimestamp(),
      });
      
      console.log(`Incremented ${counterName} for user ${uid}`);
    } catch (error) {
      console.error(`Error incrementing ${counterName}:`, error);
      console.log(`Simulating ${counterName} increment in offline mode`);
    }
  }
};

// Lead AI operations
export const leadAIOperations = {
  // Get AI data for a lead
  async getLeadAI(leadId: string): Promise<LeadAI | null> {
    try {
      const docRef = doc(db, 'leadsAI', leadId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      return {
        leadId,
        summary: data.summary,
        emailDraft: data.emailDraft,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
    } catch (error) {
      console.error('Error fetching lead AI data:', error);
      return null;
    }
  },
  
  // Save AI data for a lead
  async saveLeadAI(leadId: string, data: { summary?: string; emailDraft?: string }): Promise<void> {
    try {
      const docRef = doc(db, 'leadsAI', leadId);
      const now = serverTimestamp();
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(docRef, {
          ...data,
          updatedAt: now,
        });
      } else {
        // Create new document
        await setDoc(docRef, {
          ...data,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (error) {
      console.error('Error saving lead AI data:', error);
      console.log('Simulating lead AI data save in offline mode');
      // In offline mode, we just log the save but don't throw an error
    }
  },
  
  // Generate AI content
  async generateAIContent(leadId: string, leadData: Lead, type: 'summary' | 'email'): Promise<string> {
    try {
      // Call our Firebase function
      const response = await fetch('/api/generateLeadAI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          leadData,
          type,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.result) {
        throw new Error(data.error || 'Failed to generate content');
      }
      
      // Save to Firestore
      await this.saveLeadAI(leadId, {
        [type === 'summary' ? 'summary' : 'emailDraft']: data.result,
      });
      
      return data.result;
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      
      // Generate mock content for offline mode
      let mockContent = '';
      
      if (type === 'summary') {
        mockContent = `## Lead Summary for ${leadData.name}\n\n` +
          `${leadData.name} from ${leadData.company || 'Unknown Company'} is a ${leadData.priority} priority lead in the ${leadData.industry || 'Unknown'} industry.\n\n` +
          `**Key Points:**\n` +
          `- Current status: ${leadData.status}\n` +
          `- Source: ${leadData.source}\n\n` +
          `**Recommended Next Steps:**\n` +
          `1. Schedule an initial discovery call\n` +
          `2. Prepare a tailored proposal based on their industry needs\n` +
          `3. Follow up within 3 business days\n\n` +
          `This lead shows good potential for conversion based on their profile and engagement so far.`;
      } else {
        mockContent = `Subject: Helping ${leadData.company || 'your business'} achieve better results\n\n` +
          `Hi ${leadData.name.split(' ')[0]},\n\n` +
          `I noticed that ${leadData.company || 'your business'} has been making waves in the ${leadData.industry || 'industry'} recently. I'm reaching out because we've helped similar companies increase their efficiency and growth through our specialized solutions.\n\n` +
          `Based on what I've seen, I believe we could help you with:\n\n` +
          `- Streamlining your lead generation process\n` +
          `- Improving conversion rates\n` +
          `- Automating follow-up sequences\n\n` +
          `Would you be open to a quick 15-minute call this week to discuss how we might be able to help?\n\n` +
          `Best regards,\n` +
          `[Your Name]\n` +
          `[Your Company]`;
      }
      
      // Save the mock content
      await this.saveLeadAI(leadId, {
        [type === 'summary' ? 'summary' : 'emailDraft']: mockContent,
      });
      
      return mockContent;
    }
  },
};

// Helper function to get current user ID
export const getCurrentUserId = (): string => {
  const user = auth.currentUser;
  return user?.uid || '';
};