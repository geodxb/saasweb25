import { stripeUtils, Subscription } from './stripe';
import { getCurrentUserProfile } from './auth';

export interface UsageLimits {
  leads: {
    limit: number;
    used: number;
    remaining: number;
  };
  ai: {
    limit: number;
    used: number;
    remaining: number;
  };
  outreach: {
    enabled: boolean;
  };
  storage: {
    limit: number; // in GB
    used: number;
    remaining: number;
  };
}

export interface PlanFeatures {
  leadsLimit: number; // -1 for unlimited
  aiLimit: number; // -1 for unlimited
  outreachEnabled: boolean;
  storageLimit: number; // in GB
  supportLevel: 'email' | 'priority' | 'dedicated';
  advancedWorkflows: boolean;
  teamSupport: boolean;
  whiteLabel: boolean;
}

// Plan configurations
const PLAN_FEATURES: Record<string, PlanFeatures> = {
  'free-plan': {
    leadsLimit: 100, // Changed from 20 to 100
    aiLimit: 10,
    outreachEnabled: false,
    storageLimit: 1,
    supportLevel: 'email',
    advancedWorkflows: true, // Changed from false to true
    teamSupport: false,
    whiteLabel: false,
  },
  'pro-plan': {
    leadsLimit: 300,
    aiLimit: -1, // unlimited
    outreachEnabled: false,
    storageLimit: 10,
    supportLevel: 'priority',
    advancedWorkflows: true,
    teamSupport: false,
    whiteLabel: false,
  },
  'agency-plan': {
    leadsLimit: 2000,
    aiLimit: -1, // unlimited
    outreachEnabled: true,
    storageLimit: 50,
    supportLevel: 'dedicated',
    advancedWorkflows: true,
    teamSupport: true,
    whiteLabel: true,
  },
};

export class PlanEnforcement {
  private subscription: Subscription | null;
  private features: PlanFeatures;

  constructor(subscription: Subscription | null) {
    this.subscription = subscription;
    this.features = this.getPlanFeatures();
  }

  private getPlanFeatures(): PlanFeatures {
    if (!this.subscription || !stripeUtils.hasActiveSubscription(this.subscription)) {
      return PLAN_FEATURES['free-plan'];
    }

    return PLAN_FEATURES[this.subscription.productId] || PLAN_FEATURES['free-plan'];
  }

  // Check if user can perform an action
  canCreateLead(currentUsage: number): { allowed: boolean; reason?: string } {
    if (this.features.leadsLimit === -1) {
      return { allowed: true };
    }

    if (currentUsage >= this.features.leadsLimit) {
      return {
        allowed: false,
        reason: `You've reached your monthly limit of ${this.features.leadsLimit} leads. Upgrade your plan to create more leads.`,
      };
    }

    return { allowed: true };
  }

  canUseAI(currentUsage: number): { allowed: boolean; reason?: string } {
    if (this.features.aiLimit === -1) {
      return { allowed: true };
    }

    if (currentUsage >= this.features.aiLimit) {
      return {
        allowed: false,
        reason: `You've reached your monthly limit of ${this.features.aiLimit} AI prompts. Upgrade to Pro or Agency plan for unlimited AI usage.`,
      };
    }

    return { allowed: true };
  }

  canUseOutreach(): { allowed: boolean; reason?: string } {
    if (!this.features.outreachEnabled) {
      return {
        allowed: false,
        reason: 'Outreach automation is only available on the Agency plan. Upgrade to access this feature.',
      };
    }

    return { allowed: true };
  }

  canUseAdvancedWorkflows(): { allowed: boolean; reason?: string } {
    if (!this.features.advancedWorkflows) {
      return {
        allowed: false,
        reason: 'Advanced workflows are available on Pro and Agency plans. Upgrade to access this feature.',
      };
    }

    return { allowed: true };
  }

  canUseTeamFeatures(): { allowed: boolean; reason?: string } {
    if (!this.features.teamSupport) {
      return {
        allowed: false,
        reason: 'Team features are only available on the Agency plan. Upgrade to collaborate with your team.',
      };
    }

    return { allowed: true };
  }

  canUseWhiteLabel(): { allowed: boolean; reason?: string } {
    if (!this.features.whiteLabel) {
      return {
        allowed: false,
        reason: 'White-label options are only available on the Agency plan.',
      };
    }

    return { allowed: true };
  }

  // Get usage limits and current status
  getUsageLimits(currentUsage: { leads: number; ai: number; storage: number }): UsageLimits {
    return {
      leads: {
        limit: this.features.leadsLimit,
        used: currentUsage.leads,
        remaining: this.features.leadsLimit === -1 ? -1 : Math.max(0, this.features.leadsLimit - currentUsage.leads),
      },
      ai: {
        limit: this.features.aiLimit,
        used: currentUsage.ai,
        remaining: this.features.aiLimit === -1 ? -1 : Math.max(0, this.features.aiLimit - currentUsage.ai),
      },
      outreach: {
        enabled: this.features.outreachEnabled,
      },
      storage: {
        limit: this.features.storageLimit,
        used: currentUsage.storage,
        remaining: Math.max(0, this.features.storageLimit - currentUsage.storage),
      },
    };
  }

  // Get plan features
  getFeatures(): PlanFeatures {
    return this.features;
  }

  // Check if user needs to upgrade for a specific feature
  getUpgradeMessage(feature: string): string {
    switch (feature) {
      case 'leads':
        return 'Upgrade to Pro plan for 300 leads/month or Agency plan for 2000 leads/month.';
      case 'ai':
        return 'Upgrade to Pro or Agency plan for unlimited AI prompts.';
      case 'outreach':
        return 'Upgrade to Agency plan to access outreach automation features.';
      case 'workflows':
        return 'Upgrade to Pro or Agency plan for advanced workflow capabilities.';
      case 'team':
        return 'Upgrade to Agency plan for team collaboration features.';
      case 'storage':
        return 'Upgrade your plan for more storage space.';
      default:
        return 'Upgrade your plan to access this feature.';
    }
  }

  // Get recommended plan for a feature
  getRecommendedPlan(feature: string): string {
    switch (feature) {
      case 'outreach':
      case 'team':
      case 'whitelabel':
        return 'agency-plan';
      case 'ai':
      case 'workflows':
        return 'pro-plan';
      default:
        return 'pro-plan';
    }
  }
}

// Utility functions for plan enforcement
export const planEnforcementUtils = {
  // Create enforcement instance for current user
  async createEnforcement(subscription: Subscription | null): Promise<PlanEnforcement> {
    return new PlanEnforcement(subscription);
  },

  // Check if action is allowed and show appropriate message
  async checkAndEnforce(
    subscription: Subscription | null,
    action: string,
    currentUsage?: any
  ): Promise<{ allowed: boolean; message?: string }> {
    const enforcement = new PlanEnforcement(subscription);

    switch (action) {
      case 'create_lead':
        return enforcement.canCreateLead(currentUsage?.leads || 0);
      case 'use_ai':
        return enforcement.canUseAI(currentUsage?.ai || 0);
      case 'use_outreach':
        return enforcement.canUseOutreach();
      case 'use_advanced_workflows':
        return enforcement.canUseAdvancedWorkflows();
      case 'use_team_features':
        return enforcement.canUseTeamFeatures();
      case 'use_white_label':
        return enforcement.canUseWhiteLabel();
      default:
        return { allowed: true };
    }
  },

  // Format usage display
  formatUsage(used: number, limit: number): string {
    if (limit === -1) {
      return `${used.toLocaleString()} (unlimited)`;
    }
    return `${used.toLocaleString()} / ${limit.toLocaleString()}`;
  },

  // Calculate usage percentage
  getUsagePercentage(used: number, limit: number): number {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  },

  // Get usage color based on percentage
  getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  },

  // Check if user is approaching limits
  isApproachingLimit(used: number, limit: number, threshold: number = 0.8): boolean {
    if (limit === -1) return false; // Unlimited
    return used / limit >= threshold;
  },

  // Get warning message for approaching limits
  getWarningMessage(used: number, limit: number, feature: string): string | null {
    if (limit === -1) return null; // Unlimited
    
    const percentage = (used / limit) * 100;
    
    if (percentage >= 90) {
      return `You're at ${Math.round(percentage)}% of your ${feature} limit. Consider upgrading your plan.`;
    }
    
    if (percentage >= 75) {
      return `You've used ${Math.round(percentage)}% of your ${feature} limit this month.`;
    }
    
    return null;
  },
};