
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CompleteUser } from '@/hooks/useCompleteUserManagement';

type UserRole = 'user' | 'manager' | 'admin' | 'super_admin';

interface EditForm {
  first_name: string;
  last_name: string;
  role: UserRole;
  user_type: string;
}

export function useUserEditHandlers(user: CompleteUser, onUserUpdated: () => void) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editForm, setEditForm] = useState<EditForm>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: (user.role || 'user') as UserRole,
    user_type: user.user_type || 'demo'
  });

  const handleEdit = () => {
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: (user.role || 'user') as UserRole,
      user_type: user.user_type || 'demo'
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          role: editForm.role,
          user_type: editForm.user_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('User updated successfully');
      onUserUpdated();
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredits = () => {
    setShowCreditsDialog(true);
  };

  const handleEmail = () => {
    toast.info('Email functionality coming soon');
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast.success('User deleted successfully');
      onUserUpdated();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showEditDialog,
    setShowEditDialog,
    showCreditsDialog,
    setShowCreditsDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    isLoading,
    editForm,
    setEditForm,
    handleEdit,
    handleSaveEdit,
    handleCredits,
    handleEmail,
    handleDelete,
    handleConfirmDelete
  };
}
