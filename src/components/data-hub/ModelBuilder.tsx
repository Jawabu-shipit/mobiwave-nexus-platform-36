import React, { useState } from 'react';
import { useDataModels, DataModelField } from '@/hooks/useDataModels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function ModelBuilder() {
  const { createDataModel, isCreatingModel } = useDataModels();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<DataModelField[]>([
    { id: uuidv4(), name: '', type: 'text' }
  ]);

  const addField = () => {
    setFields([...fields, { id: uuidv4(), name: '', type: 'text' }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const updateField = (id: string, updatedField: Partial<DataModelField>) => {
    setFields(
      fields.map((field) => (field.id === id ? { ...field, ...updatedField } : field))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || fields.some(f => !f.name.trim())) {
      alert('Please provide a name for the model and for all fields.');
      return;
    }

    createDataModel({
        name,
        description,
        fields,
        user_id: ''
    });

    // Reset form
    setName('');
    setDescription('');
    setFields([{ id: uuidv4(), name: '', type: 'text' }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Data Model</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="modelName">Model Name *</Label>
            <Input
              id="modelName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Students, Loyalty Members"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelDescription">Description</Label>
            <Input
              id="modelDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this model"
            />
          </div>

          <div className="space-y-4">
            <Label>Fields *</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                <Input
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  placeholder={`Field ${index + 1} Name`}
                  required
                  className="flex-grow"
                />
                <Select
                  value={field.type}
                  onValueChange={(value: DataModelField['type']) => updateField(field.id, { type: value })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(field.id)}
                  disabled={fields.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isCreatingModel}>
            {isCreatingModel ? 'Creating...' : 'Create Model'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}