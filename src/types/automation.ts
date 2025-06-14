export interface AutomationTrigger {
  type: 'new_lead' | 'lead_updated' | 'lead_converted' | 'form_submitted' | 'payment_received' | 'email_opened' | 'email_clicked' | 'scheduled_trigger';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: string | number | boolean;
}

export interface AutomationAction {
  type: 'send_email' | 'create_task' | 'update_lead' | 'google_sheets' | 'calendly' | 'webhook' | 'ai_generate' | 'make_workflow' | 'n8n_workflow';
  config: Record<string, any>;
}

export interface AutomationStats {
  runs: number;
  successful: number;
  failed: number;
  lastRun?: Date;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  status: 'success' | 'failed' | 'running';
  startTime: Date;
  endTime?: Date;
  trigger: {
    type: string;
    data: Record<string, any>;
  };
  actions: {
    type: string;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
    executionTime?: number;
  }[];
  error?: string;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  stats: AutomationStats;
}