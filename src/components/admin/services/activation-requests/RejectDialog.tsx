
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectReason: string;
  onRejectReasonChange: (reason: string) => void;
  onConfirmReject: () => void;
  isRejecting: boolean;
}

export function RejectDialog({
  open,
  onOpenChange,
  rejectReason,
  onRejectReasonChange,
  onConfirmReject,
  isRejecting
}: RejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Service Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Provide a reason for rejecting this request..."
              value={rejectReason}
              onChange={(e) => onRejectReasonChange(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
