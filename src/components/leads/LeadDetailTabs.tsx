import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/lib/firestore';
import LeadAIAssistant from './LeadAIAssistant';
import LeadIntegrations from './LeadIntegrations';
import { Brain, FileText, Activity, User, Database } from 'lucide-react';

interface LeadDetailTabsProps {
  lead: Lead;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function LeadDetailTabs({ lead, activeTab = 'overview', onTabChange }: LeadDetailTabsProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center space-x-1">
          <User className="w-4 h-4" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="details" className="flex items-center space-x-1">
          <FileText className="w-4 h-4" />
          <span>Details</span>
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center space-x-1">
          <Activity className="w-4 h-4" />
          <span>Notes</span>
        </TabsTrigger>
        <TabsTrigger value="ai-assistant" className="flex items-center space-x-1">
          <Brain className="w-4 h-4" />
          <span>AI Assistant</span>
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center space-x-1">
          <Database className="w-4 h-4" />
          <span>Integrations</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {/* Overview content will be handled by parent component */}
      </TabsContent>

      <TabsContent value="details">
        {/* Details content will be handled by parent component */}
      </TabsContent>

      <TabsContent value="notes">
        {/* Notes content will be handled by parent component */}
      </TabsContent>

      <TabsContent value="ai-assistant">
        <LeadAIAssistant lead={lead} />
      </TabsContent>

      <TabsContent value="integrations">
        <LeadIntegrations lead={lead} />
      </TabsContent>
    </Tabs>
  );
}