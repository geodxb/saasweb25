import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  MessageSquare,
  Eye,
  Loader2,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Lead } from '@/lib/firestore';
import LeadOutreachButton from './LeadOutreachButton';

interface LeadListItemProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onConvert?: (leadId: string) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canConvert?: boolean;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export default function LeadListItem({ 
  lead, 
  onClick, 
  onEdit, 
  onDelete, 
  onConvert, 
  isLoading,
  canEdit = true,
  canDelete = true,
  canConvert = true
}: LeadListItemProps) {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
      className="p-4 border-b border-gray-200 cursor-pointer"
      onClick={() => onClick(lead)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              {lead.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{lead.name}</div>
            {lead.company && (
              <div className="text-sm text-gray-500">{lead.company}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge className={statusColors[lead.status]}>
            {lead.status.toUpperCase()}
          </Badge>
          
          <LeadOutreachButton 
            lead={lead}
            size="sm"
            variant="outline"
            onSuccess={() => {
              // Refresh lead data after successful outreach
              if (onEdit) {
                onEdit({
                  ...lead,
                  status: 'contacted',
                  lastContact: new Date()
                });
              }
            }}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="w-4 h-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onClick(lead);
              }}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(lead);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Lead
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canConvert && onConvert && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onConvert(lead.id);
                  }}
                  disabled={lead.status === 'converted'}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convert to Client
                </DropdownMenuItem>
              )}
              {canDelete && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(lead.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Lead
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-1 text-gray-400" />
          {lead.email}
        </div>
        {lead.phone && (
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-1 text-gray-400" />
            {lead.phone}
          </div>
        )}
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
          {lead.createdAt.toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}