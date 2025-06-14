import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscriptionOperations } from '@/lib/stripe';
import { PlanEnforcement, planEnforcementUtils } from '@/lib/planEnforcement';

interface UsageData {
  leads: number;
  ai: number;
  storage: number;
}

export function usePlanEnforcement() {
  const { user } = useAuth();
  const [enforcement, setEnforcement] = useState<PlanEnforcement | null>(null);
  const [usage, setUsage] = useState<UsageData>({ leads: 0, ai: 0, storage: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPlanEnforcement();
    }
  }, [user]);

  const loadPlanEnforcement = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Get user's subscription
      const subscription = await subscriptionOperations.getUserSubscription(user.uid);
      
      // Create enforcement instance
      const planEnforcement = new PlanEnforcement(subscription);
      setEnforcement(planEnforcement);

      // Load current usage (this would come from your analytics/usage tracking)
      // For demo purposes, we'll use mock data
      const mockUsage = {
        leads: 47, // Current leads created this month
        ai: 23,   // AI prompts used this month
        storage: 2.4, // GB used
      };
      setUsage(mockUsage);
    } catch (error) {
      console.error('Error loading plan enforcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can perform an action
  const canPerformAction = (action: string) => {
    if (!enforcement) return { allowed: false, reason: 'Loading...' };

    switch (action) {
      case 'create_lead':
        return enforcement.canCreateLead(usage.leads);
      case 'use_ai':
        return enforcement.canUseAI(usage.ai);
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
  };

  // Get usage limits
  const getUsageLimits = () => {
    if (!enforcement) return null;
    return enforcement.getUsageLimits(usage);
  };

  // Get plan features
  const getPlanFeatures = () => {
    if (!enforcement) return null;
    return enforcement.getFeatures();
  };

  // Get upgrade message for a feature
  const getUpgradeMessage = (feature: string) => {
    if (!enforcement) return '';
    return enforcement.getUpgradeMessage(feature);
  };

  // Get recommended plan for a feature
  const getRecommendedPlan = (feature: string) => {
    if (!enforcement) return 'pro-plan';
    return enforcement.getRecommendedPlan(feature);
  };

  // Check if approaching limits
  const getUsageWarnings = () => {
    const warnings: string[] = [];
    
    if (!enforcement) return warnings;

    const limits = enforcement.getUsageLimits(usage);

    // Check leads warning
    const leadsWarning = planEnforcementUtils.getWarningMessage(
      limits.leads.used,
      limits.leads.limit,
      'leads'
    );
    if (leadsWarning) warnings.push(leadsWarning);

    // Check AI warning
    const aiWarning = planEnforcementUtils.getWarningMessage(
      limits.ai.used,
      limits.ai.limit,
      'AI prompts'
    );
    if (aiWarning) warnings.push(aiWarning);

    // Check storage warning
    const storageWarning = planEnforcementUtils.getWarningMessage(
      limits.storage.used,
      limits.storage.limit,
      'storage'
    );
    if (storageWarning) warnings.push(storageWarning);

    return warnings;
  };

  // Update usage (call this when user performs actions)
  const updateUsage = (type: keyof UsageData, increment: number = 1) => {
    setUsage(prev => ({
      ...prev,
      [type]: prev[type] + increment,
    }));
  };

  return {
    enforcement,
    usage,
    isLoading,
    canPerformAction,
    getUsageLimits,
    getPlanFeatures,
    getUpgradeMessage,
    getRecommendedPlan,
    getUsageWarnings,
    updateUsage,
    refresh: loadPlanEnforcement,
  };
}