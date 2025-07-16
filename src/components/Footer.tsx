
import React from 'react';
import { MessageSquare, Twitter, Facebook, Linkedin, Github, Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  // State for mobile accordion sections
  const [openSection, setOpenSection] = React.useState<string | null>(null);

  // Toggle accordion section
  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">Mobiwave</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The most reliable messaging platform for businesses of all sizes. 
              Send SMS, emails, and push notifications at scale.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:info@mobiwave.io" className="text-gray-400 hover:text-white">
                  info@mobiwave.io
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <a href="tel:+254700000000" className="text-gray-400 hover:text-white">
                  +254 700 000 000
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <span className="text-gray-400">
                  Westlands Business Park, Nairobi, Kenya
                </span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="https://twitter.com/mobiwave" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              </a>
              <a href="https://facebook.com/mobiwave" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              </a>
              <a href="https://linkedin.com/company/mobiwave" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              </a>
              <a href="https://github.com/mobiwave" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              </a>
            </div>
          </div>
          
          {/* Product Links - Desktop */}
          <div className="hidden md:block">
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><a href="https://docs.mobiwave.io" className="text-gray-400 hover:text-white">API Docs</a></li>
              <li><a href="https://status.mobiwave.io" className="text-gray-400 hover:text-white">Status</a></li>
              <li><Link to="/help" className="text-gray-400 hover:text-white">Support</Link></li>
            </ul>
          </div>
          
          {/* Company Links - Desktop */}
          <div className="hidden md:block">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><a href="https://blog.mobiwave.io" className="text-gray-400 hover:text-white">Blog</a></li>
              <li><Link to="/about#careers" className="text-gray-400 hover:text-white">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link to="/about#privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
            </ul>
          </div>
          
          {/* Mobile Accordion Sections */}
          <div className="md:hidden col-span-1 space-y-4">
            {/* Product Section */}
            <div className="border-b border-gray-800 pb-4">
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('product')}
                aria-expanded={openSection === 'product'}
              >
                <h3 className="text-lg font-semibold">Product</h3>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSection === 'product' ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              {openSection === 'product' && (
                <ul className="space-y-2 mt-4 pl-2">
                  <li><Link to="/services" className="text-gray-400 hover:text-white">Features</Link></li>
                  <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                  <li><a href="https://docs.mobiwave.io" className="text-gray-400 hover:text-white">API Docs</a></li>
                  <li><a href="https://status.mobiwave.io" className="text-gray-400 hover:text-white">Status</a></li>
                  <li><Link to="/help" className="text-gray-400 hover:text-white">Support</Link></li>
                </ul>
              )}
            </div>
            
            {/* Company Section */}
            <div className="border-b border-gray-800 pb-4">
              <button 
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleSection('company')}
                aria-expanded={openSection === 'company'}
              >
                <h3 className="text-lg font-semibold">Company</h3>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openSection === 'company' ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              {openSection === 'company' && (
                <ul className="space-y-2 mt-4 pl-2">
                  <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
                  <li><a href="https://blog.mobiwave.io" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><Link to="/about#careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                  <li><Link to="/about#privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Mobiwave. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about#terms" className="text-gray-400 hover:text-white">Terms of Service</Link>
              <Link to="/about#privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
              <Link to="/about#cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
