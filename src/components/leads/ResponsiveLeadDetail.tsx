import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import LeadDetailView from './LeadDetailView';
import LeadDetailDrawer from './LeadDetailDrawer';
import { Lead } from '@/lib/firestore';

interface ResponsiveLeadDetailProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  onDelete: (leadId: string) => Promise<void>;
  onConvert: (leadId: string) => Promise<void>;
  onAddNote: (leadId: string, note: string) => Promise<void>;
  onUpdateTags: (leadId: string, tags: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function ResponsiveLeadDetail(props: ResponsiveLeadDetailProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Use state to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  // Render the appropriate component based on screen size
  return isMobile ? (
    <LeadDetailDrawer {...props} />
  ) : (
    <LeadDetailView {...props} />
  );
}