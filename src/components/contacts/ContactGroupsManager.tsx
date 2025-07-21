import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Users, Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useContactGroups } from '@/hooks/useContactGroups';
import { GroupMembers } from './GroupMembers';
import { Badge } from "@/components/ui/badge";

export function ContactGroupsManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const {
    contactGroups,
    isLoading: isLoadingGroups,
    createContactGroup,
    updateContactGroup,
    deleteContactGroup
  } = useContactGroups();

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    try {
      await createContactGroup({
        name: newGroup.name.trim(),
        description: newGroup.description.trim() || undefined,
        contact_count: 0
      });
      setNewGroup({ name: '', description: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Create group error:', error);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !newGroup.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    try {
      await updateContactGroup({
        id: editingGroup.id,
        updates: {
          name: newGroup.name.trim(),
          description: newGroup.description.trim() || undefined
        }
      });
      setNewGroup({ name: '', description: '' });
      setEditingGroup(null);
    } catch (error) {
      console.error('Update group error:', error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteContactGroup(groupId);
    } catch (error) {
      console.error('Delete group error:', error);
    }
  };

  const startEditing = (group) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description || ''
    });
  };

  const resetForm = () => {
    setNewGroup({ name: '', description: '' });
    setEditingGroup(null);
    setIsCreateDialogOpen(false);
  };

  if (isLoadingGroups) {
    return <p>Loading groups...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Contact Groups
          </span>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Contact Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label htmlFor="group-description">Description (Optional)</Label>
                  <Textarea
                    id="group-description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup}>
                    Create Group
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contactGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No contact groups yet</p>
            <p className="text-sm">Create your first group to organize contacts</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {contactGroups.map((group) => (
              <AccordionItem value={group.id} key={group.id}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{group.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{group.contact_count} members</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); startEditing(group); }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <GroupMembers groupId={group.id} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Contact Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-group-name">Group Name</Label>
                <Input
                  id="edit-group-name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Label htmlFor="edit-group-description">Description (Optional)</Label>
                <Textarea
                  id="edit-group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateGroup}>
                  Update Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}