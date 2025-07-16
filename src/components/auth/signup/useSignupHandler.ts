
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { passwordRequirements } from './PasswordRequirements';

export function useSignupHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isPasswordValid = (password: string): boolean => {
    return passwordRequirements.every(req => req.test(password));
  };

  const handleSubmit = async (
    e: React.FormEvent,
    formData: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
    }
  ) => {
    e.preventDefault();
    setError('');

    const { email, password, confirmPassword, firstName, lastName } = formData;

    // Validate password strength
    if (!isPasswordValid(password)) {
      setError('Password does not meet security requirements');
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate required fields
    if (!email || !firstName || !lastName) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);

    try {
      // SECURITY FIX: Add proper email redirect configuration
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'user'
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Please check your email to confirm your account');
        navigate('/auth');
      } else if (data.user) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleSubmit,
    isPasswordValid
  };
}
