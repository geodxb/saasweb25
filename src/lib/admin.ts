import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
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
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firestore';
import { UserProfile } from './auth';

// Extended user interface for admin operations
export interface AdminUser extends UserProfile {
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLoginAt?: Date;
  totalLeads: number;
  totalRevenue: number;
  currentPlan?: string;
  subscriptionStatus?: string;
  leadsThisMonth: number;
  revenueThisMonth: number;
  suspensionReason?: string;
  suspendedAt?: Date;
  suspendedBy?: string;
}

export interface SystemMetrics {
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

export interface RevenueData {
  month: string;
  revenue: number;
  users: number;
  leads: number;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: 'user' | 'lead' | 'client' | 'subscription' | 'system';
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Helper functions to convert Firestore data
const convertAdminUserData = (doc: QueryDocumentSnapshot<DocumentData>): AdminUser => {
  const data = doc.data();
  return {
    uid: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    lastLoginAt: data.lastLoginAt?.toDate(),
    suspendedAt: data.suspendedAt?.toDate(),
  } as AdminUser;
};

const convertActivityLogData = (doc: QueryDocumentSnapshot<DocumentData>): ActivityLog => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    timestamp: data.timestamp?.toDate() || new Date(),
  } as ActivityLog;
};

const convertSystemAlertData = (doc: QueryDocumentSnapshot<DocumentData>): SystemAlert => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    timestamp: data.timestamp?.toDate() || new Date(),
    resolvedAt: data.resolvedAt?.toDate(),
  } as SystemAlert;
};

// Admin operations
export const adminOperations = {
  // User Management
  async getAllUsers(limitCount = 1000): Promise<AdminUser[]> {
    try {
      // For demo purposes, return mock data
      const mockUsers: AdminUser[] = [
        {
          uid: 'user-1',
          email: 'john@example.com',
          displayName: 'John Smith',
          role: 'user',
          status: 'active',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          totalLeads: 45,
          totalRevenue: 15000,
          currentPlan: 'Professional Plan',
          subscriptionStatus: 'active',
          leadsThisMonth: 12,
          revenueThisMonth: 5000,
          company: 'Tech Solutions Inc',
          phone: '+1 (555) 123-4567',
        },
        {
          uid: 'user-2',
          email: 'sarah@startup.com',
          displayName: 'Sarah Johnson',
          role: 'agent',
          status: 'active',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalLeads: 23,
          totalRevenue: 8500,
          currentPlan: 'Starter Plan',
          subscriptionStatus: 'active',
          leadsThisMonth: 8,
          revenueThisMonth: 2500,
          company: 'Startup XYZ',
          phone: '+1 (555) 987-6543',
        },
        {
          uid: 'user-3',
          email: 'mike@freelance.com',
          displayName: 'Mike Chen',
          role: 'user',
          status: 'inactive',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          totalLeads: 67,
          totalRevenue: 22000,
          currentPlan: 'Free Plan',
          subscriptionStatus: 'canceled',
          leadsThisMonth: 0,
          revenueThisMonth: 0,
          company: 'Freelance Design',
        },
        {
          uid: 'user-4',
          email: 'admin@clientflow.com',
          displayName: 'Admin User',
          role: 'admin',
          status: 'active',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          lastLoginAt: new Date(Date.now() - 30 * 60 * 1000),
          totalLeads: 0,
          totalRevenue: 0,
          currentPlan: 'Enterprise Plan',
          subscriptionStatus: 'active',
          leadsThisMonth: 0,
          revenueThisMonth: 0,
          company: 'ClientFlow',
        },
      ];

      return mockUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  },

  async getUserById(userId: string): Promise<AdminUser | null> {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.uid === userId) || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  },

  async updateUserRole(userId: string, newRole: 'admin' | 'closer' | 'agent' | 'setter' | 'user'): Promise<void> {
    try {
      console.log('Updating user role:', { userId, newRole });
      // In a real implementation, this would update Firestore
      // const userRef = doc(db, 'users', userId);
      // await updateDoc(userRef, {
      //   role: newRole,
      //   updatedAt: Timestamp.now(),
      // });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  },

  async suspendUser(userId: string, reason: string, suspendedBy?: string): Promise<void> {
    try {
      console.log('Suspending user:', { userId, reason, suspendedBy });
      // In a real implementation, this would update Firestore
      // const userRef = doc(db, 'users', userId);
      // await updateDoc(userRef, {
      //   status: 'suspended',
      //   suspensionReason: reason,
      //   suspendedAt: Timestamp.now(),
      //   suspendedBy: suspendedBy || 'system',
      //   updatedAt: Timestamp.now(),
      // });
    } catch (error) {
      console.error('Error suspending user:', error);
      throw new Error('Failed to suspend user');
    }
  },

  async activateUser(userId: string): Promise<void> {
    try {
      console.log('Activating user:', { userId });
      // In a real implementation, this would update Firestore
      // const userRef = doc(db, 'users', userId);
      // await updateDoc(userRef, {
      //   status: 'active',
      //   suspensionReason: null,
      //   suspendedAt: null,
      //   suspendedBy: null,
      //   updatedAt: Timestamp.now(),
      // });
    } catch (error) {
      console.error('Error activating user:', error);
      throw new Error('Failed to activate user');
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      console.log('Deleting user:', { userId });
      // In a real implementation, this would:
      // 1. Delete user from Firestore
      // 2. Delete user from Firebase Auth
      // 3. Cancel any active subscriptions
      // 4. Archive user data for compliance
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  },

  // System Metrics
  async getSystemMetrics(timeRange: string = '30d'): Promise<SystemMetrics> {
    try {
      // For demo purposes, return mock metrics
      const mockMetrics: SystemMetrics = {
        totalUsers: 1247,
        activeUsers: 892,
        totalRevenue: 125000,
        monthlyRevenue: 18500,
        totalLeads: 5432,
        monthlyLeads: 234,
        conversionRate: 23.5,
        churnRate: 4.2,
        averageRevenuePerUser: 140.25,
        systemHealth: 'healthy',
      };

      return mockMetrics;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw new Error('Failed to fetch system metrics');
    }
  },

  async getRevenueData(timeRange: string = '30d'): Promise<RevenueData[]> {
    try {
      // For demo purposes, return mock revenue data
      const mockRevenueData: RevenueData[] = [
        { month: 'Jan 2024', revenue: 15000, users: 120, leads: 450 },
        { month: 'Feb 2024', revenue: 16500, users: 135, leads: 520 },
        { month: 'Mar 2024', revenue: 18200, users: 148, leads: 580 },
        { month: 'Apr 2024', revenue: 17800, users: 142, leads: 510 },
        { month: 'May 2024', revenue: 19500, users: 156, leads: 620 },
        { month: 'Jun 2024', revenue: 21000, users: 168, leads: 680 },
      ];

      return mockRevenueData;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw new Error('Failed to fetch revenue data');
    }
  },

  // System Alerts
  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      // For demo purposes, return mock alerts
      const mockAlerts: SystemAlert[] = [
        {
          id: 'alert-1',
          type: 'info',
          title: 'System Maintenance Scheduled',
          message: 'Scheduled maintenance window on Sunday 2AM-4AM UTC',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          resolved: false,
        },
        {
          id: 'alert-2',
          type: 'warning',
          title: 'High API Usage',
          message: 'API usage is approaching monthly limits for several users',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          resolved: false,
        },
        {
          id: 'alert-3',
          type: 'error',
          title: 'Payment Processing Issue',
          message: 'Stripe webhook delivery failed for 3 consecutive attempts',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          resolved: true,
          resolvedBy: 'admin@clientflow.com',
          resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      ];

      return mockAlerts;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw new Error('Failed to fetch system alerts');
    }
  },

  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    try {
      console.log('Resolving alert:', { alertId, resolvedBy });
      // In a real implementation, this would update Firestore
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error('Failed to resolve alert');
    }
  },

  // Activity Logs
  async getActivityLogs(limitCount = 100): Promise<ActivityLog[]> {
    try {
      // For demo purposes, return mock activity logs
      const mockLogs: ActivityLog[] = [
        {
          id: 'log-1',
          userId: 'user-1',
          userEmail: 'john@example.com',
          action: 'User logged in',
          entityType: 'user',
          entityId: 'user-1',
          details: { loginMethod: 'email' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
          id: 'log-2',
          userId: 'user-2',
          userEmail: 'sarah@startup.com',
          action: 'Lead created',
          entityType: 'lead',
          entityId: 'lead-123',
          details: { leadName: 'New Prospect', source: 'Website' },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: 'log-3',
          userId: 'user-1',
          userEmail: 'john@example.com',
          action: 'Subscription upgraded',
          entityType: 'subscription',
          entityId: 'sub-456',
          details: { fromPlan: 'Starter', toPlan: 'Professional' },
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ];

      return mockLogs;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw new Error('Failed to fetch activity logs');
    }
  },

  async logActivity(activityData: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const id = `log-${Date.now()}`;
      console.log('Logging activity:', { id, ...activityData });
      // In a real implementation, this would save to Firestore
      return id;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw new Error('Failed to log activity');
    }
  },

  // Data Export
  async exportSystemData(timeRange: string = '30d'): Promise<void> {
    try {
      console.log('Exporting system data for range:', timeRange);
      
      // In a real implementation, this would:
      // 1. Generate comprehensive reports
      // 2. Create CSV/Excel files
      // 3. Send download link via email
      // 4. Store in secure location
      
      // For demo, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error exporting system data:', error);
      throw new Error('Failed to export system data');
    }
  },

  // Lead Management (Admin view)
  async getAllLeads(limitCount = 1000): Promise<any[]> {
    try {
      // Return mock leads data for admin view
      const mockLeads = [
        {
          id: 'lead-1',
          name: 'Sarah Johnson',
          email: 'sarah@techstart.com',
          company: 'TechStart Inc',
          value: '$15,000',
          status: 'new',
          ownerId: 'user-1',
          ownerName: 'John Smith',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          source: 'Website',
        },
        {
          id: 'lead-2',
          name: 'Mike Chen',
          email: 'mike@designstudio.com',
          company: 'Design Studio',
          value: '$8,500',
          status: 'contacted',
          ownerId: 'user-2',
          ownerName: 'Sarah Johnson',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          source: 'Referral',
        },
      ];

      return mockLeads;
    } catch (error) {
      console.error('Error fetching all leads:', error);
      throw new Error('Failed to fetch leads');
    }
  },

  // Billing Management (Admin view)
  async getBillingOverview(): Promise<any> {
    try {
      // Return mock billing data
      const mockBillingData = {
        totalRevenue: 125000,
        monthlyRecurringRevenue: 18500,
        failedPayments: 3,
        upcomingRenewals: 45,
        churnRate: 4.2,
        averageRevenuePerUser: 140.25,
      };

      return mockBillingData;
    } catch (error) {
      console.error('Error fetching billing overview:', error);
      throw new Error('Failed to fetch billing overview');
    }
  },
};