import { motion } from 'framer-motion';
import { 
  Database, 
  Calendar, 
  Table, 
  CalendarDays, 
  FileSpreadsheet, 
  CalendarClock,
  Check,
  X,
  Settings,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface IntegrationCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isConnected: boolean;
  features: string[];
  onClick?: () => void;
}

export default function IntegrationCard({ 
  id, 
  name, 
  description, 
  icon, 
  color, 
  isConnected, 
  features,
  onClick
}: IntegrationCardProps) {
  const navigate = useNavigate();
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database': return Database;
      case 'Calendar': return Calendar;
      case 'Table': return Table;
      case 'CalendarDays': return CalendarDays;
      case 'FileSpreadsheet': return FileSpreadsheet;
      case 'CalendarClock': return CalendarClock;
      default: return Database;
    }
  };
  
  const IconComponent = getIcon(icon);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
            >
              {isConnected ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Features:</h3>
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/settings?tab=integrations')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button 
            onClick={onClick}
            disabled={!isConnected}
          >
            Use Integration
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}