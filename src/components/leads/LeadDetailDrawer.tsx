import { useState } from 'react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X, Edit, Trash2, UserPlus } from 'lucide-react';
import { Lead } from '@/lib/firestore';
import LeadDetailTabs from './LeadDetailTabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LeadDetailDrawerProps {
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

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export default function LeadDetailDrawer({
  lead,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onConvert,
  onAddNote,
  onUpdateTags,
  isLoading = false,
}: LeadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!lead) return null;

  const handleDelete = async () => {
    try {
      await onDelete(lead.id);
      onClose();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleConvert = async () => {
    try {
      await onConvert(lead.id);
      onClose();
    } catch (error) {
      console.error('Error converting lead:', error);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-base">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DrawerTitle className="text-xl">{lead.name}</DrawerTitle>
                <div className="text-sm text-gray-600">
                  {lead.company && `${lead.company} • `}
                  {lead.industry}
                </div>
              </div>
            </div>
            <Badge className={statusColors[lead.status]}>
              {lead.status.toUpperCase()}
            </Badge>
          </div>
        </DrawerHeader>
        
        <div className="p-4 overflow-y-auto">
          <LeadDetailTabs 
            lead={lead} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>
        
        <DrawerFooter className="border-t">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button onClick={() => {}} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                onClick={handleConvert} 
                disabled={isLoading || lead.status === 'converted'}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Convert
              </Button>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the lead
                    and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete Lead
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}