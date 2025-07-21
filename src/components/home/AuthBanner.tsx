
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export const AuthBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <span className="text-sm font-medium">
          Access your Mobiwave messaging platform
        </span>
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-blue-600"
          >
            <Link to="/auth" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Link to="/auth" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
