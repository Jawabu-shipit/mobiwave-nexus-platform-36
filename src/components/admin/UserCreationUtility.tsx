
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function UserCreationUtility() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'user' | 'manager' | 'admin' | 'super_admin'>('user');
  const [isCreating, setIsCreating] = useState(false);

  const createUser = async () => {
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setIsCreating(true);
    try {
      // Create the user using Supabase Admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: role
        },
        email_confirm: true // Auto-confirm email
      });

      if (error) {
        console.error('User creation error:', error);
        toast.error(`Failed to create user: ${error.message}`);
        return;
      }

      toast.success(`User created successfully: ${email}`);
      
      // Clear form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('user');
      
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const createPredefinedUsers = async () => {
    const users = [
      {
        email: 'malingib9@gmail.com',
        password: 'b1216170',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin' as const
      },
      {
        email: 'grahamjanji@gmail.com',
        password: 'g1216170',
        firstName: 'Graham',
        lastName: 'User',
        role: 'user' as const
      }
    ];

    setIsCreating(true);
    
    for (const user of users) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role
          },
          email_confirm: true
        });

        if (error) {
          console.error(`Error creating ${user.email}:`, error);
          toast.error(`Failed to create ${user.email}: ${error.message}`);
        } else {
          toast.success(`Created ${user.role}: ${user.email}`);
        }
      } catch (error: any) {
        console.error(`Unexpected error creating ${user.email}:`, error);
        toast.error(`Failed to create ${user.email}`);
      }
    }
    
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick User Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={createPredefinedUsers}
            disabled={isCreating}
            className="w-full mb-4"
          >
            {isCreating ? 'Creating Users...' : 'Create Predefined Users'}
          </Button>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Super Admin: malingib9@gmail.com (password: b1216170)</p>
            <p>• User: grahamjanji@gmail.com (password: g1216170)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual User Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: 'user' | 'manager' | 'admin' | 'super_admin') => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={createUser}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Create User'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
