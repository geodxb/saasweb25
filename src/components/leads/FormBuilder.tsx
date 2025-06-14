import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Type,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  List,
  FileText,
  Hash,
  GripVertical,
  X,
  Plus,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'textarea', label: 'Text Area', icon: FileText },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'number', label: 'Number', icon: Hash },
];

interface SortableFieldProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: (id: string) => void;
}

function SortableField({ field, onUpdate, onDelete }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState(field);

  const handleSave = () => {
    onUpdate(editField);
    setIsEditing(false);
  };

  const FieldIcon = fieldTypes.find(ft => ft.type === field.type)?.icon || Type;

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <FieldIcon className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-sm">{field.label}</span>
              {field.required && <span className="text-red-500 text-xs">*</span>}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(field.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor={`label-${field.id}`}>Label</Label>
                <Input
                  id={`label-${field.id}`}
                  value={editField.label}
                  onChange={(e) => setEditField({ ...editField, label: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                <Input
                  id={`placeholder-${field.id}`}
                  value={editField.placeholder || ''}
                  onChange={(e) => setEditField({ ...editField, placeholder: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editField.required}
                  onCheckedChange={(checked) => setEditField({ ...editField, required: checked })}
                />
                <Label>Required field</Label>
              </div>
              {editField.type === 'select' && (
                <div>
                  <Label>Options (one per line)</Label>
                  <Textarea
                    value={editField.options?.join('\n') || ''}
                    onChange={(e) => setEditField({ 
                      ...editField, 
                      options: e.target.value.split('\n').filter(o => o.trim()) 
                    })}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                  />
                </div>
              )}
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {field.placeholder && <p>Placeholder: {field.placeholder}</p>}
              {field.type === 'select' && field.options && (
                <p>Options: {field.options.join(', ')}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface FormBuilderProps {
  onSave: (fields: FormField[]) => void;
  initialFields?: FormField[];
}

export default function FormBuilder({ onSave, initialFields = [] }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [formName, setFormName] = useState('New Lead Form');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `${fieldTypes.find(ft => ft.type === type)?.label || 'Field'}`,
      placeholder: '',
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
    };
    setFields([...fields, newField]);
  };

  const updateField = (updatedField: FormField) => {
    setFields(fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onSave(fields);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Field Types Palette */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Field Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {fieldTypes.map((fieldType) => (
                <motion.div
                  key={fieldType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => addField(fieldType.type as FormField['type'])}
                  >
                    <fieldType.icon className="w-4 h-4 mr-2" />
                    {fieldType.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Builder */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{formName}</h3>
          <div className="flex space-x-2">
            <Button variant="outline">Preview</Button>
            <Button onClick={handleSave}>
              <Plus className="w-4 h-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>

        <Card className="min-h-96">
          <CardContent className="p-6">
            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No fields added yet</p>
                <p>Drag field types from the left panel to start building your form</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      onUpdate={updateField}
                      onDelete={deleteField}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}