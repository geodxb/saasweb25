// Analytics and tracking utilities
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

export interface UserProperties {
  plan: string;
  role: string;
  company?: string;
  signupDate: Date;
}

class Analytics {
  private isInitialized = false;

  // Initialize analytics (Google Analytics, PostHog, etc.)
  init() {
    if (this.isInitialized) return;

    // Initialize Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: 'ClientFlow',
        page_location: window.location.href,
      });
    }

    // Initialize PostHog (if using)
    // posthog.init('YOUR_API_KEY', { api_host: 'https://app.posthog.com' });

    this.isInitialized = true;
  }

  // Track events
  track(event: AnalyticsEvent) {
    if (!this.isInitialized) this.init();

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.name, {
        ...event.properties,
        user_id: event.userId,
      });
    }

    // PostHog
    // posthog.capture(event.name, event.properties);

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }

  // Identify user
  identify(userId: string, properties: UserProperties) {
    if (!this.isInitialized) this.init();

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
        custom_map: {
          plan: properties.plan,
          role: properties.role,
        },
      });
    }

    // PostHog
    // posthog.identify(userId, properties);
  }

  // Track page views
  page(path: string, title?: string) {
    if (!this.isInitialized) this.init();

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        page_title: title,
      });
    }

    // PostHog
    // posthog.capture('$pageview', { $current_url: path });
  }

  // Track conversion events
  conversion(event: string, value?: number, currency?: string) {
    this.track({
      name: 'conversion',
      properties: {
        event_name: event,
        value,
        currency: currency || 'USD',
      },
    });
  }
}

export const analytics = new Analytics();

// Predefined events for consistency
export const AnalyticsEvents = {
  // Authentication
  SIGN_UP: 'sign_up',
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',

  // Subscription
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',

  // Features
  LEAD_CREATED: 'lead_created',
  LEAD_CONVERTED: 'lead_converted',
  LEAD_CAPTURED: 'lead_captured',
  AI_PROMPT_USED: 'ai_prompt_used',
  OUTREACH_CAMPAIGN_CREATED: 'outreach_campaign_created',
  WORKFLOW_CREATED: 'workflow_created',

  // Engagement
  DASHBOARD_VIEWED: 'dashboard_viewed',
  FEATURE_DISCOVERED: 'feature_discovered',
  HELP_ACCESSED: 'help_accessed',
  FEEDBACK_SUBMITTED: 'feedback_submitted',

  // Growth
  REFERRAL_CREATED: 'referral_created',
  REFERRAL_CONVERTED: 'referral_converted',
  SOCIAL_SHARE: 'social_share',
  
  // Experiments
  EXPERIMENT_VIEWED: 'experiment_viewed',
  EXPERIMENT_CONVERTED: 'experiment_converted',
  
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  FEATURE_BLOCKED: 'feature_blocked',
} as const;

// Helper functions for common tracking scenarios
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track({ name, properties });
};

export const trackConversion = (event: string, value?: number) => {
  analytics.conversion(event, value);
};

export const trackError = (error: Error, context?: string) => {
  analytics.track({
    name: AnalyticsEvents.ERROR_OCCURRED,
    properties: {
      error_message: error.message,
      error_stack: error.stack,
      context,
    },
  });
};

export const trackFeatureUsage = (feature: string, plan: string) => {
  analytics.track({
    name: AnalyticsEvents.FEATURE_DISCOVERED,
    properties: {
      feature,
      plan,
    },
  });
};

// Declare global gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}