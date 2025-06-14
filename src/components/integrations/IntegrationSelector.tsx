import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Calendar, 
  Table, 
  CalendarDays, 
  FileSpreadsheet, 
  CalendarClock,
  Check,
  ArrowRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { integrationTypes } from '@/lib/integrations';
import { useNavigate } from 'react-router-dom';

interface IntegrationSelectorProps {
  type: 'spreadsheets' | 'calendar';
  onSelect: (integrationId: string) => void;
  currentIntegration?: string;
}

export default function IntegrationSelector({ type, onSelect, currentIntegration }: IntegrationSelectorProps) {
  const navigate = useNavigate();
  const integrations = integrationTypes[type];
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database': return Database;
      case 'Calendar': return Calendar;
      case 'Table': return Table;
      case 'CalendarDays': return CalendarDays;
      case 'FileSpreadsheet': return FileSpreadsheet;
      case 'CalendarClock': return CalendarClock;
      default: return Info;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select {type === 'spreadsheets' ? 'Spreadsheet' : 'Calendar'} Integration</CardTitle>
        <CardDescription>
          Choose which service you want to connect to
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const IconComponent = getIcon(integration.icon);
            const isSelected = currentIntegration === integration.id;
            
            return (
              <motion.div
                key={integration.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer h-full transition-all ${
                    isSelected ? 'border-2 border-blue-500 shadow-md' : 'hover:shadow-md'
                  }`}
                  onClick={() => onSelect(integration.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${integration.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Check className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-medium mb-2">{integration.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Features:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {integration.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="w-3 h-3 text-green-600 mr-1 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button 
                      variant={isSelected ? "default" : "outline"} 
                      className="w-full"
                      onClick={() => onSelect(integration.id)}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                      {!isSelected && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}