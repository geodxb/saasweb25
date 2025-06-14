import { useState } from 'react';
import {
  Filter,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AutomationCondition } from '@/types/automation';

interface ConditionConfigProps {
  condition: AutomationCondition;
  onSave: (condition: AutomationCondition) => void;
  onCancel: () => void;
}

export default function ConditionConfig({ condition, onSave, onCancel }: ConditionConfigProps) {
  const [field, setField] = useState(condition.field);
  const [operator, setOperator] = useState(condition.operator);
  const [value, setValue] = useState<string | number | boolean>(condition.value);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!field) {
      setError('Field is required');
      return;
    }
    
    if (operator !== 'exists' && operator !== 'not_exists' && !value && value !== false) {
      setError('Value is required');
      return;
    }
    
    onSave({
      field,
      operator,
      value
    });
  };

  const fieldOptions = [
    { value: 'lead.name', label: 'Lead Name' },
    { value: 'lead.email', label: 'Lead Email' },
    { value: 'lead.phone', label: 'Lead Phone' },
    { value: 'lead.company', label: 'Lead Company' },
    { value: 'lead.source', label: 'Lead Source' },
    { value: 'lead.status', label: 'Lead Status' },
    { value: 'lead.tags', label: 'Lead Tags' },
    { value: 'lead.value', label: 'Lead Value' },
    { value: 'lead.industry', label: 'Lead Industry' },
    { value: 'lead.createdAt', label: 'Lead Created Date' },
    { value: 'lead.lastContact', label: 'Lead Last Contact Date' }
  ];

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does Not Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'exists', label: 'Exists' },
    { value: 'not_exists', label: 'Does Not Exist' }
  ];

  const isValueRequired = operator !== 'exists' && operator !== 'not_exists';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="field">Field</Label>
        <Select value={field} onValueChange={setField}>
          <SelectTrigger id="field">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="operator">Operator</Label>
        <Select value={operator} onValueChange={setOperator}>
          <SelectTrigger id="operator">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {operatorOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isValueRequired && (
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            value={value.toString()}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
          />
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Condition
        </Button>
      </div>
    </div>
  );
}