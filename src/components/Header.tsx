
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';

export const Header = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Mobiwave</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
            Services
          </Link>
          <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
            Contact
          </Link>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                {userRole === 'admin' && (
                  <Button asChild variant="default" size="sm">
                    <Link to="/admin">Admin Portal</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
