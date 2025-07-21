
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';

export const Header = () => {
  const { isAuthenticated, userRole } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile) {
      if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isMobile]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 z-10">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Mobiwave</span>
        </Link>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden z-10 p-2 focus:outline-none" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-900" />
          ) : (
            <Menu className="w-6 h-6 text-gray-900" />
          )}
        </button>

        {/* Desktop Navigation */}
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

        {/* Mobile Navigation Overlay */}
        {isMobile && (
          <div 
            className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8 p-4">
              <Link 
                to="/services" 
                className="text-xl font-medium text-gray-900 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/pricing" 
                className="text-xl font-medium text-gray-900 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-xl font-medium text-gray-900 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-xl font-medium text-gray-900 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col items-center space-y-4 pt-4 w-full max-w-xs">
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    </Button>
                    {userRole === 'admin' && (
                      <Button asChild variant="default" className="w-full">
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Portal</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild variant="default" className="w-full">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
