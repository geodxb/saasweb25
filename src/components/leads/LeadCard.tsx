import { motion } from 'framer-motion';
import {
  User,
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
import { Card, CardContent } from '@/components/ui/card';
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

interface LeadCardProps {
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

const tagColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-800',
  warm: 'bg-yellow-100 text-yellow-800',
  cold: 'bg-blue-100 text-blue-800',
  enterprise: 'bg-purple-100 text-purple-800',
  startup: 'bg-green-100 text-green-800',
  design: 'bg-pink-100 text-pink-800',
  local: 'bg-gray-100 text-gray-800',
  'google-maps': 'bg-blue-100 text-blue-800',
  linkedin: 'bg-indigo-100 text-indigo-800',
};

export default function LeadCard({ 
  lead, 
  onClick, 
  onEdit, 
  onDelete, 
  onConvert, 
  isLoading,
  canEdit = true,
  canDelete = true,
  canConvert = true
}: LeadCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="cursor-pointer"
      onClick={() => onClick(lead)}
    >
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-sm">{lead.name}</h4>
                {lead.company && (
                  <p className="text-xs text-gray-500">{lead.company}</p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <MoreHorizontal className="w-3 h-3" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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

          <div className="space-y-2 mb-3">
            <div className="flex items-center text-xs text-gray-600">
              <Mail className="w-3 h-3 mr-1" />
              {lead.email}
            </div>
            {lead.phone && (
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="w-3 h-3 mr-1" />
                {lead.phone}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {lead.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}
              >
                {tag}
              </Badge>
            ))}
            {lead.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{lead.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Source: {lead.source}</span>
            {lead.lastContact && (
              <span>{lead.lastContact.toLocaleDateString()}</span>
            )}
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex space-x-2 pt-2 mt-2 border-t">
            <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
              e.stopPropagation();
              if (lead.phone) {
                window.location.href = `tel:${lead.phone}`;
              } else {
                toast.error('No phone number available');
              }
            }}>
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
            <LeadOutreachButton 
              lead={lead}
              size="sm"
              variant="outline"
              className="flex-1"
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}