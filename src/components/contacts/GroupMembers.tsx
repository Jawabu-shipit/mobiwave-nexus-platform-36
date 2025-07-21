import React, { useState } from 'react';
import { useContactGroupMembers } from '@/hooks/useContactGroups';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { useContactGroupOperations } from '@/hooks/contacts/useContactGroupOperations';
import { useContactGroups } from '@/hooks/useContactGroups';

interface GroupMembersProps {
  groupId: string;
}

export function GroupMembers({ groupId }: GroupMembersProps) {
  const { data: groupMembers, isLoading: isLoadingMembers, refetch } = useContactGroupMembers(groupId);
  const { removeContactFromGroup, moveContactsBetweenGroups } = useContactGroupOperations();
  const { contactGroups } = useContactGroups();
  const [selected, setSelected] = useState<string[]>([]);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  const handleRemoveContact = async (contactId: string) => {
    if (!groupId) return;
    await removeContactFromGroup({ groupId, contactId });
    refetch();
  };

  const handleSelect = (contactId: string, checked: boolean) => {
    setSelected(prev => checked ? [...prev, contactId] : prev.filter(id => id !== contactId));
  };

  const handleMoveContacts = async () => {
    if (!targetGroupId || selected.length === 0) return;
    setIsMoving(true);
    try {
      await moveContactsBetweenGroups({ contactIds: selected, fromGroupId: groupId, toGroupId: targetGroupId });
      setSelected([]);
      setMoveDialogOpen(false);
      setTargetGroupId('');
      refetch();
    } catch (e) {
      // error handled in hook
    } finally {
      setIsMoving(false);
    }
  };

  if (isLoadingMembers) {
    return <p>Loading members...</p>;
  }

  if (!groupMembers || groupMembers.length === 0) {
    return <p className="text-center text-gray-500 py-4">This group has no members.</p>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-md">
      {selected.length > 0 && (
        <div className="mb-4 flex gap-2 items-center">
          <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">Move to Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Move Contacts to Another Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactGroups.filter(g => g.id !== groupId).map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleMoveContacts} disabled={!targetGroupId || isMoving} className="w-full">
                  {isMoving ? 'Moving...' : 'Move'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <span className="text-sm text-gray-500">{selected.length} selected</span>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={selected.length === groupMembers.length && groupMembers.length > 0}
                onCheckedChange={checked => {
                  if (checked) setSelected(groupMembers.map(m => m.contact_id));
                  else setSelected([]);
                }}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupMembers.map((member) => (
            <TableRow key={member.contact_id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(member.contact_id)}
                  onCheckedChange={checked => handleSelect(member.contact_id, checked as boolean)}
                />
              </TableCell>
              <TableCell>{member.contacts?.first_name || 'N/A'} {member.contacts?.last_name || ''}</TableCell>
              <TableCell>{member.contacts?.phone || 'N/A'}</TableCell>
              <TableCell>{member.contacts?.email || 'N/A'}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleRemoveContact(member.contact_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


