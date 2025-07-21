
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServiceCatalog {
  id: string;
  service_name: string;
  service_type: string;
  description: string;
  setup_fee: number;
  monthly_fee: number;
  transaction_fee_type: string;
  transaction_fee_amount: number;
  is_premium: boolean;
  is_active: boolean;
  provider: string;
}

interface ServiceEditDialogProps {
  service: ServiceCatalog | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceCatalog) => void;
  isLoading: boolean;
}

export function ServiceEditDialog({ service, isOpen, onClose, onSave, isLoading }: ServiceEditDialogProps) {
  const [formData, setFormData] = useState<ServiceCatalog | null>(service);

  React.useEffect(() => {
    setFormData(service);
  }, [service]);

  if (!formData) return null;

  const handleInputChange = (field: keyof ServiceCatalog, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Service: {formData.service_name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service_name">Service Name</Label>
              <Input
                id="service_name"
                value={formData.service_name}
                onChange={(e) => handleInputChange('service_name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select 
                value={formData.service_type} 
                onValueChange={(value) => handleInputChange('service_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ussd">USSD</SelectItem>
                  <SelectItem value="shortcode">Short Code</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="servicedesk">Service Desk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="setup_fee">Setup Fee</Label>
              <Input
                id="setup_fee"
                type="number"
                step="0.01"
                value={formData.setup_fee}
                onChange={(e) => handleInputChange('setup_fee', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="monthly_fee">Monthly Fee</Label>
              <Input
                id="monthly_fee"
                type="number"
                step="0.01"
                value={formData.monthly_fee}
                onChange={(e) => handleInputChange('monthly_fee', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transaction_fee_type">Transaction Fee Type</Label>
              <Select 
                value={formData.transaction_fee_type} 
                onValueChange={(value) => handleInputChange('transaction_fee_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="transaction_fee_amount">Transaction Fee Amount</Label>
              <Input
                id="transaction_fee_amount"
                type="number"
                step="0.01"
                value={formData.transaction_fee_amount}
                onChange={(e) => handleInputChange('transaction_fee_amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select 
                value={formData.provider} 
                onValueChange={(value) => handleInputChange('provider', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mspace">MSpace</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="third-party">Third Party</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) => handleInputChange('is_premium', checked)}
              />
              <Label htmlFor="is_premium">Premium Service</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
