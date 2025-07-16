
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

interface UserCreditsDialogProps {
  user: CompleteUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreditsUpdated: () => void;
}

export function UserCreditsDialog({ user, open, onOpenChange, onCreditsUpdated }: UserCreditsDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [operationType, setOperationType] = useState<'add' | 'subtract' | 'set'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const amountNum = parseFloat(amount);
      const currentCredits = user.credits_remaining || 0;
      let newCredits;
      
      switch (operationType) {
        case 'add':
          newCredits = currentCredits + amountNum;
          break;
        case 'subtract':
          newCredits = Math.max(0, currentCredits - amountNum);
          break;
        case 'set':
          newCredits = amountNum;
          break;
      }
      
      toast({
        title: "Credits Updated",
        description: `Credits ${operationType === 'add' ? 'added' : operationType === 'subtract' ? 'deducted' : 'set'} successfully. New balance: $${newCredits.toFixed(2)}`,
      });
      
      onCreditsUpdated();
      onOpenChange(false);
      setAmount('');
      setReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update credits.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOperationIcon = () => {
    switch (operationType) {
      case 'add': return <Plus className="w-4 h-4" />;
      case 'subtract': return <Minus className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Manage Credits
          </DialogTitle>
          <DialogDescription>
            Manage credits for {user.first_name} {user.last_name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Balance</p>
            <p className="text-2xl font-bold text-green-600">
              ${(user.credits_remaining || 0).toFixed(2)}
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="operation">Operation</Label>
            <Select value={operationType} onValueChange={(value: any) => setOperationType(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {getOperationIcon()}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Credits</SelectItem>
                <SelectItem value="subtract">Deduct Credits</SelectItem>
                <SelectItem value="set">Set Balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for credit adjustment..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !amount}>
            {isLoading ? 'Processing...' : `${operationType === 'add' ? 'Add' : operationType === 'subtract' ? 'Deduct' : 'Set'} Credits`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
