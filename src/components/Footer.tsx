
import React from 'react';
import { MessageSquare, Twitter, Facebook, Linkedin, Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">Mobiwave</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The most reliable messaging platform for businesses of all sizes. 
              Send SMS, emails, and push notifications at scale.
            </p>
            <div className="flex space-x-4">
              <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              <Linkedin className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              <Github className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">API Docs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Status</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Mobiwave. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
