import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUserId } from './firestore';

export interface EmailEvent {
  id: string;
  emailId: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  type: 'open' | 'click' | 'reply';
  timestamp: Date;
  metadata?: {
    linkUrl?: string;
    linkId?: string;
    replyContent?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface EmailAnalytics {
  id: string;
  userId: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  subject: string;
  sentAt: Date;
  opens: number;
  lastOpenAt?: Date;
  clicks: number;
  lastClickAt?: Date;
  replies: number;
  lastReplyAt?: Date;
  lastActionAt?: Date;
  lastActionType?: 'open' | 'click' | 'reply';
}

// Email analytics operations
export const emailAnalyticsOperations = {
  // Create a new email tracking record
  async createEmailTracking(data: {
    userId: string;
    leadId: string;
    leadName: string;
    leadEmail: string;
    subject: string;
  }): Promise<string> {
    try {
      const emailAnalytics = {
        ...data,
        opens: 0,
        clicks: 0,
        replies: 0,
        sentAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'emailLogs'), emailAnalytics);
      return docRef.id;
    } catch (error) {
      console.error('Error creating email tracking:', error);
      // Generate a mock ID for offline mode
      return `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  },

  // Track an email open event
  async trackEmailOpen(emailId: string, metadata?: { userAgent?: string; ipAddress?: string }): Promise<void> {
    try {
      // Update the email analytics record
      const emailRef = doc(db, 'emailLogs', emailId);
      await updateDoc(emailRef, {
        opens: increment(1),
        lastOpenAt: serverTimestamp(),
        lastActionAt: serverTimestamp(),
        lastActionType: 'open'
      });
      
      // Log the event
      await addDoc(collection(db, 'emailLogs', emailId, 'events'), {
        emailId,
        type: 'open',
        timestamp: serverTimestamp(),
        metadata
      });
    } catch (error) {
      console.error('Error tracking email open:', error);
    }
  },

  // Track a link click event
  async trackLinkClick(emailId: string, linkId: string, linkUrl: string): Promise<void> {
    try {
      // Update the email analytics record
      const emailRef = doc(db, 'emailLogs', emailId);
      await updateDoc(emailRef, {
        clicks: increment(1),
        lastClickAt: serverTimestamp(),
        lastActionAt: serverTimestamp(),
        lastActionType: 'click'
      });
      
      // Log the event
      await addDoc(collection(db, 'emailLogs', emailId, 'events'), {
        emailId,
        type: 'click',
        timestamp: serverTimestamp(),
        metadata: {
          linkId,
          linkUrl
        }
      });
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  },

  // Track a reply event
  async trackReply(emailId: string, replyContent: string): Promise<void> {
    try {
      // Update the email analytics record
      const emailRef = doc(db, 'emailLogs', emailId);
      await updateDoc(emailRef, {
        replies: increment(1),
        lastReplyAt: serverTimestamp(),
        lastActionAt: serverTimestamp(),
        lastActionType: 'reply'
      });
      
      // Log the event
      await addDoc(collection(db, 'emailLogs', emailId, 'events'), {
        emailId,
        type: 'reply',
        timestamp: serverTimestamp(),
        metadata: {
          replyContent
        }
      });
    } catch (error) {
      console.error('Error tracking reply:', error);
    }
  },

  // Get email analytics for a user
  async getEmailAnalytics(userId: string, maxResults = 50): Promise<EmailAnalytics[]> {
    try {
      const q = query(
        collection(db, 'emailLogs'),
        where('userId', '==', userId),
        orderBy('sentAt', 'desc'),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          leadId: data.leadId,
          leadName: data.leadName,
          leadEmail: data.leadEmail,
          subject: data.subject,
          sentAt: data.sentAt?.toDate() || new Date(),
          opens: data.opens || 0,
          lastOpenAt: data.lastOpenAt?.toDate(),
          clicks: data.clicks || 0,
          lastClickAt: data.lastClickAt?.toDate(),
          replies: data.replies || 0,
          lastReplyAt: data.lastReplyAt?.toDate(),
          lastActionAt: data.lastActionAt?.toDate(),
          lastActionType: data.lastActionType,
        };
      });
    } catch (error) {
      console.error('Error getting email analytics:', error);
      
      // Return mock data for demo purposes
      return [
        {
          id: 'email-1',
          userId,
          leadId: 'lead-1',
          leadName: 'John Smith',
          leadEmail: 'john@example.com',
          subject: 'Follow up on our conversation',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          opens: 3,
          lastOpenAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          clicks: 1,
          lastClickAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          replies: 1,
          lastReplyAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          lastActionAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          lastActionType: 'reply',
        },
        {
          id: 'email-2',
          userId,
          leadId: 'lead-2',
          leadName: 'Sarah Johnson',
          leadEmail: 'sarah@example.com',
          subject: 'Proposal for your review',
          sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          opens: 2,
          lastOpenAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          clicks: 0,
          lastClickAt: undefined,
          replies: 0,
          lastReplyAt: undefined,
          lastActionAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          lastActionType: 'open',
        },
        {
          id: 'email-3',
          userId,
          leadId: 'lead-3',
          leadName: 'Michael Brown',
          leadEmail: 'michael@example.com',
          subject: 'Introduction to our services',
          sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          opens: 1,
          lastOpenAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          clicks: 1,
          lastClickAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          replies: 0,
          lastReplyAt: undefined,
          lastActionAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          lastActionType: 'click',
        },
      ];
    }
  },

  // Get email events for a specific email
  async getEmailEvents(emailId: string): Promise<EmailEvent[]> {
    try {
      const q = query(
        collection(db, 'emailLogs', emailId, 'events'),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          emailId,
          leadId: data.leadId,
          leadName: data.leadName || '',
          leadEmail: data.leadEmail || '',
          type: data.type,
          timestamp: data.timestamp?.toDate() || new Date(),
          metadata: data.metadata,
        };
      });
    } catch (error) {
      console.error('Error getting email events:', error);
      return [];
    }
  },

  // Generate a tracking pixel URL
  generateTrackingPixelUrl(emailId: string): string {
    // In a real implementation, this would be a URL to your tracking endpoint
    // For demo purposes, we'll use a placeholder URL
    return `https://locafyr.app/track/pixel/${emailId}?t=${Date.now()}`;
  },

  // Process links in email body to add tracking
  processEmailLinks(emailBody: string, emailId: string): string {
    // Simple regex to find links in the email body
    const linkRegex = /(https?:\/\/[^\s<]+)/g;
    
    // Replace each link with a tracking link
    return emailBody.replace(linkRegex, (match) => {
      const linkId = Math.random().toString(36).substring(2, 9);
      // In a real implementation, this would be a URL to your tracking endpoint
      // For demo purposes, we'll use a placeholder URL that redirects to the original URL
      return `https://locafyr.app/track/link/${emailId}/${linkId}?url=${encodeURIComponent(match)}`;
    });
  },

  // Add tracking pixel to email body
  addTrackingPixelToEmail(emailBody: string, emailId: string): string {
    const trackingPixelUrl = this.generateTrackingPixelUrl(emailId);
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />`;
    
    // Add the tracking pixel at the end of the email
    // Check if the email body contains HTML
    if (emailBody.includes('</html>')) {
      // Insert before closing </body> tag
      return emailBody.replace('</body>', `${trackingPixel}</body>`);
    } else if (emailBody.includes('<body')) {
      // Append to the end of the body
      return emailBody + trackingPixel;
    } else {
      // Just append to the end of the plain text email
      return emailBody + '\n\n' + trackingPixel;
    }
  },

  // Get summary statistics
  async getEmailStats(userId: string): Promise<{
    total: number;
    opened: number;
    clicked: number;
    replied: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  }> {
    try {
      const analytics = await this.getEmailAnalytics(userId, 100);
      
      const total = analytics.length;
      const opened = analytics.filter(a => a.opens > 0).length;
      const clicked = analytics.filter(a => a.clicks > 0).length;
      const replied = analytics.filter(a => a.replies > 0).length;
      
      return {
        total,
        opened,
        clicked,
        replied,
        openRate: total > 0 ? (opened / total) * 100 : 0,
        clickRate: total > 0 ? (clicked / total) * 100 : 0,
        replyRate: total > 0 ? (replied / total) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      
      // Return mock data for demo purposes
      return {
        total: 10,
        opened: 7,
        clicked: 4,
        replied: 2,
        openRate: 70,
        clickRate: 40,
        replyRate: 20,
      };
    }
  },

  // Create a server endpoint for tracking email opens and clicks
  // This would be implemented as a serverless function or API endpoint
  // For demo purposes, we'll simulate this with a mock implementation
  setupTrackingEndpoints() {
    // In a real implementation, this would set up API routes for:
    // 1. /track/pixel/:emailId - for tracking email opens
    // 2. /track/link/:emailId/:linkId - for tracking link clicks
    
    // For demo purposes, we'll create a mock implementation that simulates tracking
    // This would be replaced with actual API endpoints in a production environment
    
    // Mock tracking pixel endpoint
    window.mockTrackEmailOpen = async (emailId: string) => {
      await this.trackEmailOpen(emailId, {
        userAgent: navigator.userAgent,
        ipAddress: '127.0.0.1' // Mock IP address
      });
      console.log(`Email ${emailId} opened`);
    };
    
    // Mock tracking link endpoint
    window.mockTrackLinkClick = async (emailId: string, linkId: string, linkUrl: string) => {
      await this.trackLinkClick(emailId, linkId, linkUrl);
      console.log(`Link ${linkId} in email ${emailId} clicked`);
      // Redirect to the original URL
      window.open(linkUrl, '_blank');
    };
  }
}

// Setup tracking endpoints for demo purposes
emailAnalyticsOperations.setupTrackingEndpoints();

// Add to global window for demo purposes
declare global {
  interface Window {
    mockTrackEmailOpen: (emailId: string) => Promise<void>;
    mockTrackLinkClick: (emailId: string, linkId: string, linkUrl: string) => Promise<void>;
  }
}