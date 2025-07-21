
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, ArrowRight, Zap } from 'lucide-react';

interface ConditionalRule {
  id: string;
  sourceFieldId: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  action: 'show' | 'hide' | 'jump_to' | 'set_value';
  targetFieldId: string;
  actionValue?: string;
}

interface ValidationRule {
  id: string;
  fieldId: string;
  type: 'required' | 'min_length' | 'max_length' | 'email' | 'phone' | 'custom_regex';
  value?: string;
  message: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface ConditionalLogicBuilderProps {
  fields: FormField[];
  onRulesChange: (rules: ConditionalRule[]) => void;
  onValidationChange: (validation: ValidationRule[]) => void;
}

export function ConditionalLogicBuilder({ fields, onRulesChange, onValidationChange }: ConditionalLogicBuilderProps) {
  const [conditionalRules, setConditionalRules] = useState<ConditionalRule[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [newRule, setNewRule] = useState<Partial<ConditionalRule>>({
    condition: 'equals',
    action: 'show'
  });
  const [newValidation, setNewValidation] = useState<Partial<ValidationRule>>({
    type: 'required'
  });

  const addConditionalRule = () => {
    if (newRule.sourceFieldId && newRule.targetFieldId && newRule.value) {
      const rule: ConditionalRule = {
        id: Date.now().toString(),
        sourceFieldId: newRule.sourceFieldId!,
        condition: newRule.condition as ConditionalRule['condition'],
        value: newRule.value,
        action: newRule.action as ConditionalRule['action'],
        targetFieldId: newRule.targetFieldId!,
        actionValue: newRule.actionValue
      };
      
      const updatedRules = [...conditionalRules, rule];
      setConditionalRules(updatedRules);
      onRulesChange(updatedRules);
      
      setNewRule({ condition: 'equals', action: 'show' });
    }
  };

  const addValidationRule = () => {
    if (newValidation.fieldId && newValidation.message) {
      const validation: ValidationRule = {
        id: Date.now().toString(),
        fieldId: newValidation.fieldId!,
        type: newValidation.type as ValidationRule['type'],
        value: newValidation.value,
        message: newValidation.message
      };
      
      const updatedValidation = [...validationRules, validation];
      setValidationRules(updatedValidation);
      onValidationChange(updatedValidation);
      
      setNewValidation({ type: 'required' });
    }
  };

  const removeConditionalRule = (ruleId: string) => {
    const updatedRules = conditionalRules.filter(rule => rule.id !== ruleId);
    setConditionalRules(updatedRules);
    onRulesChange(updatedRules);
  };

  const removeValidationRule = (ruleId: string) => {
    const updatedValidation = validationRules.filter(rule => rule.id !== ruleId);
    setValidationRules(updatedValidation);
    onValidationChange(updatedValidation);
  };

  const getFieldLabel = (fieldId: string) => {
    return fields.find(f => f.id === fieldId)?.label || 'Unknown Field';
  };

  const conditionOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' }
  ];

  const actionOptions = [
    { value: 'show', label: 'Show Field' },
    { value: 'hide', label: 'Hide Field' },
    { value: 'jump_to', label: 'Jump to Field' },
    { value: 'set_value', label: 'Set Value' }
  ];

  const validationTypes = [
    { value: 'required', label: 'Required Field' },
    { value: 'min_length', label: 'Minimum Length' },
    { value: 'max_length', label: 'Maximum Length' },
    { value: 'email', label: 'Valid Email' },
    { value: 'phone', label: 'Valid Phone' },
    { value: 'custom_regex', label: 'Custom Pattern' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Advanced Form Logic</h3>
        <p className="text-gray-600 text-sm">
          Add conditional logic and validation rules to create dynamic, intelligent forms.
        </p>
      </div>

      {/* Conditional Logic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Conditional Logic Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div>
              <Label>If Field</Label>
              <Select value={newRule.sourceFieldId} onValueChange={(value) => setNewRule({...newRule, sourceFieldId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Condition</Label>
              <Select value={newRule.condition} onValueChange={(value) => setNewRule({...newRule, condition: value as ConditionalRule['condition']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Value</Label>
              <Input
                value={newRule.value || ''}
                onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                placeholder="Enter value"
              />
            </div>

            <div>
              <Label>Then</Label>
              <Select value={newRule.action} onValueChange={(value) => setNewRule({...newRule, action: value as ConditionalRule['action']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Field</Label>
              <Select value={newRule.targetFieldId} onValueChange={(value) => setNewRule({...newRule, targetFieldId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={addConditionalRule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>

          {conditionalRules.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Active Conditional Rules</h4>
              {conditionalRules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline">{getFieldLabel(rule.sourceFieldId)}</Badge>
                  <span className="text-sm text-gray-600">{rule.condition.replace('_', ' ')}</span>
                  <Badge variant="secondary">"{rule.value}"</Badge>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{rule.action.replace('_', ' ')}</span>
                  <Badge variant="outline">{getFieldLabel(rule.targetFieldId)}</Badge>
                  <Button size="sm" variant="outline" onClick={() => removeConditionalRule(rule.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <Label>Field</Label>
              <Select value={newValidation.fieldId} onValueChange={(value) => setNewValidation({...newValidation, fieldId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Validation Type</Label>
              <Select value={newValidation.type} onValueChange={(value) => setNewValidation({...newValidation, type: value as ValidationRule['type']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {validationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {['min_length', 'max_length', 'custom_regex'].includes(newValidation.type || '') && (
              <div>
                <Label>Value</Label>
                <Input
                  value={newValidation.value || ''}
                  onChange={(e) => setNewValidation({...newValidation, value: e.target.value})}
                  placeholder={newValidation.type === 'custom_regex' ? 'Enter regex pattern' : 'Enter value'}
                />
              </div>
            )}

            <div>
              <Label>Error Message</Label>
              <Input
                value={newValidation.message || ''}
                onChange={(e) => setNewValidation({...newValidation, message: e.target.value})}
                placeholder="Enter error message"
              />
            </div>

            <Button onClick={addValidationRule}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>

          {validationRules.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Active Validation Rules</h4>
              {validationRules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline">{getFieldLabel(rule.fieldId)}</Badge>
                  <Badge variant="secondary">{rule.type.replace('_', ' ')}</Badge>
                  {rule.value && <span className="text-sm text-gray-600">({rule.value})</span>}
                  <span className="text-sm text-gray-600 flex-1">"{rule.message}"</span>
                  <Button size="sm" variant="outline" onClick={() => removeValidationRule(rule.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
