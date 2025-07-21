
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    avatar_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          avatar_url: ''
        });
      }
    } catch (error) {
      console.error('Profile load failed:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save profile');
        return;
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile save failed:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-600">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">
              {profile.first_name && profile.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : profile.email
              }
            </h3>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                value={profile.first_name}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                className="pl-10"
                placeholder="First name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile.last_name}
              onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
              placeholder="Last name"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={saveProfile} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
