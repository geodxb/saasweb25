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
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

// Types for Stripe integration
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one_time';
  features: string[];
  stripePriceId: string;
  stripeProductId: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  stripePaymentIntentId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions to convert Firestore data
const convertProductData = (doc: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Product;
};

const convertSubscriptionData = (doc: QueryDocumentSnapshot<DocumentData>): Subscription => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    currentPeriodStart: data.currentPeriodStart?.toDate() || new Date(),
    currentPeriodEnd: data.currentPeriodEnd?.toDate() || new Date(),
    trialEnd: data.trialEnd?.toDate(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Subscription;
};

const convertPaymentIntentData = (doc: QueryDocumentSnapshot<DocumentData>): PaymentIntent => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as PaymentIntent;
};

// Product operations
export const productOperations = {
  // Get all active products
  async getProducts(): Promise<Product[]> {
    try {
      // For demo purposes, return mock products
      const mockProducts: Product[] = [
        {
          id: 'free-plan',
          name: 'Free Plan',
          description: '20 leads per month, 10 AI prompts',
          price: 0,
          currency: 'USD',
          interval: 'month',
          features: [
            '20 leads per month',
            '10 AI prompts',
            'Basic lead management',
            'Email support',
            '1GB storage',
          ],
          stripePriceId: 'price_free_plan',
          stripeProductId: 'prod_free_plan',
          isActive: true,
          metadata: {
            leadsLimit: 20,
            aiLimit: 10,
            outreachEnabled: false,
            supportLevel: 'email',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pro-plan',
          name: 'Pro Plan',
          description: '300 leads per month, unlimited AI prompts',
          price: 29,
          currency: 'USD',
          interval: 'month',
          features: [
            '300 leads per month',
            'Unlimited AI prompts',
            'Advanced lead management',
            'Priority support',
            '10GB storage',
            'Lead scraping',
            'Basic workflows',
          ],
          stripePriceId: 'price_pro_plan',
          stripeProductId: 'prod_pro_plan',
          isActive: true,
          metadata: {
            leadsLimit: 300,
            aiLimit: -1, // -1 for unlimited
            outreachEnabled: false,
            supportLevel: 'priority',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'agency-plan',
          name: 'Agency Plan',
          description: '2000 leads per month, outreach automation, team support',
          price: 79,
          currency: 'USD',
          interval: 'month',
          features: [
            '2000 leads per month',
            'Unlimited AI prompts',
            'Outreach automation',
            'Team support',
            '50GB storage',
            'Advanced workflows',
            'Custom integrations',
            'White-label options',
            'Dedicated support',
          ],
          stripePriceId: 'price_agency_plan',
          stripeProductId: 'prod_agency_plan',
          isActive: true,
          metadata: {
            leadsLimit: 2000,
            aiLimit: -1,
            outreachEnabled: true,
            supportLevel: 'dedicated',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return mockProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  },

  // Subscribe to products with real-time updates
  subscribeToProducts(callback: (products: Product[]) => void): Unsubscribe {
    // For demo purposes, return mock data immediately
    this.getProducts().then(callback);
    
    // Return a no-op unsubscribe function
    return () => {};
  },

  // Get single product by ID
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      return products.find(p => p.id === productId) || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  },

  // Create new product (admin only)
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  },

  // Update product (admin only)
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }
};

// Subscription operations
export const subscriptionOperations = {
  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      // For demo purposes, return mock subscription
      const mockSubscription: Subscription = {
        id: 'sub-demo-123',
        userId,
        productId: 'free-plan',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return mockSubscription;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw new Error('Failed to fetch subscription');
    }
  },

  // Subscribe to user's subscription with real-time updates
  subscribeToUserSubscription(userId: string, callback: (subscription: Subscription | null) => void): Unsubscribe {
    // For demo purposes, return mock data immediately
    this.getUserSubscription(userId).then(callback);
    
    // Return a no-op unsubscribe function
    return () => {};
  },

  // Get all user subscriptions (including canceled)
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const subscription = await this.getUserSubscription(userId);
      return subscription ? [subscription] : [];
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw new Error('Failed to fetch subscriptions');
    }
  },

  // Create new subscription (called by webhook or backend)
  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'subscriptions'), {
        ...subscriptionData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  },

  // Update subscription (called by webhook or backend)
  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<void> {
    try {
      const docRef = doc(db, 'subscriptions', subscriptionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  },

  // Cancel subscription (frontend action - requires backend processing)
  async requestCancellation(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      // This would typically call a Cloud Function or API endpoint
      // For now, we'll just update the local record
      const docRef = doc(db, 'subscriptions', subscriptionId);
      await updateDoc(docRef, {
        cancelAtPeriodEnd,
        updatedAt: Timestamp.now(),
      });
      
      // In a real implementation, you would call your backend:
      // const response = await fetch('/api/cancel-subscription', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ subscriptionId, cancelAtPeriodEnd })
      // });
      
      console.log('Subscription cancellation requested - backend processing required');
    } catch (error) {
      console.error('Error requesting subscription cancellation:', error);
      throw new Error('Failed to request cancellation');
    }
  }
};

// Payment operations
export const paymentOperations = {
  // Create checkout session (requires backend)
  async createCheckoutSession(productId: string, userId: string): Promise<{ url: string }> {
    try {
      // This would typically call a Cloud Function or API endpoint
      // For demo purposes, we'll simulate the process
      
      console.log('Creating checkout session for:', { productId, userId });
      
      // In a real implementation, you would call your backend:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productId, userId })
      // });
      // const data = await response.json();
      // return { url: data.url };
      
      // For demo, return a placeholder URL
      return { 
        url: `${window.location.origin}/success?session_id=demo_session_${Date.now()}` 
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  },

  // Create payment intent for one-time payments
  async createPaymentIntent(productId: string, userId: string): Promise<PaymentIntent> {
    try {
      const product = await productOperations.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const paymentIntentData: Omit<PaymentIntent, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        productId,
        amount: product.price * 100, // Convert to cents
        currency: product.currency,
        status: 'requires_payment_method',
        metadata: {
          productName: product.name,
        },
      };

      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'paymentIntents'), {
        ...paymentIntentData,
        createdAt: now,
        updatedAt: now,
      });

      // In a real implementation, you would also create the Stripe PaymentIntent:
      // const stripePaymentIntent = await stripe.paymentIntents.create({
      //   amount: paymentIntentData.amount,
      //   currency: paymentIntentData.currency,
      //   metadata: { firestoreId: docRef.id, userId, productId }
      // });
      
      // await updateDoc(docRef, {
      //   stripePaymentIntentId: stripePaymentIntent.id
      // });

      return {
        id: docRef.id,
        ...paymentIntentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  },

  // Get user's payment intents
  async getUserPaymentIntents(userId: string): Promise<PaymentIntent[]> {
    try {
      const q = query(
        collection(db, 'paymentIntents'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertPaymentIntentData);
    } catch (error) {
      console.error('Error fetching payment intents:', error);
      throw new Error('Failed to fetch payment intents');
    }
  }
};

// Utility functions
export const stripeUtils = {
  // Format price for display
  formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  },

  // Check if user has active subscription
  hasActiveSubscription(subscription: Subscription | null): boolean {
    if (!subscription) return false;
    return ['active', 'trialing'].includes(subscription.status) && 
           new Date() < subscription.currentPeriodEnd;
  },

  // Get subscription status display text
  getSubscriptionStatusText(subscription: Subscription | null): string {
    if (!subscription) return 'No active subscription';
    
    switch (subscription.status) {
      case 'active':
        return subscription.cancelAtPeriodEnd 
          ? `Cancels on ${subscription.currentPeriodEnd.toLocaleDateString()}`
          : `Renews on ${subscription.currentPeriodEnd.toLocaleDateString()}`;
      case 'trialing':
        return `Trial ends on ${subscription.trialEnd?.toLocaleDateString() || 'Unknown'}`;
      case 'past_due':
        return 'Payment past due';
      case 'canceled':
        return 'Canceled';
      case 'unpaid':
        return 'Unpaid';
      case 'incomplete':
        return 'Incomplete';
      default:
        return 'Unknown status';
    }
  },

  // Calculate days until subscription ends
  getDaysUntilEnd(subscription: Subscription | null): number {
    if (!subscription) return 0;
    const endDate = subscription.trialEnd || subscription.currentPeriodEnd;
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Check if user can access feature based on plan
  canAccessFeature(subscription: Subscription | null, feature: string): boolean {
    if (!subscription) return false;
    
    // Get product metadata to check feature access
    // This would typically be fetched from the product data
    const planFeatures = {
      'free-plan': {
        outreach: false,
        advancedWorkflows: false,
        teamSupport: false,
      },
      'pro-plan': {
        outreach: false,
        advancedWorkflows: true,
        teamSupport: false,
      },
      'agency-plan': {
        outreach: true,
        advancedWorkflows: true,
        teamSupport: true,
      },
    };

    const features = planFeatures[subscription.productId as keyof typeof planFeatures];
    return features?.[feature as keyof typeof features] || false;
  },

  // Check usage limits
  checkUsageLimit(subscription: Subscription | null, usageType: 'leads' | 'ai', currentUsage: number): { allowed: boolean; limit: number; remaining: number } {
    if (!subscription) {
      return { allowed: false, limit: 0, remaining: 0 };
    }

    const planLimits = {
      'free-plan': { leads: 20, ai: 10 },
      'pro-plan': { leads: 300, ai: -1 },
      'agency-plan': { leads: 2000, ai: -1 },
    };

    const limits = planLimits[subscription.productId as keyof typeof planLimits];
    const limit = limits?.[usageType] || 0;
    
    if (limit === -1) {
      // Unlimited
      return { allowed: true, limit: -1, remaining: -1 };
    }

    const remaining = Math.max(0, limit - currentUsage);
    return {
      allowed: currentUsage < limit,
      limit,
      remaining,
    };
  }
};