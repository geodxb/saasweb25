import { useState } from 'react';
import LeadDetailView from './LeadDetailView';
import { Lead } from '@/lib/firestore';

interface LeadDetailModalProps {
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

export default function LeadDetailModal(props: LeadDetailModalProps) {
  // This component now just passes through to LeadDetailView
  // This maintains backward compatibility with existing code
  return <LeadDetailView {...props} />;
}