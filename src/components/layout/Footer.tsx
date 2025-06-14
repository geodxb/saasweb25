import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Shield, FileText, HelpCircle, Users, Zap, MapPin } from 'lucide-react';
import { APP_INFO } from '@/lib/config';

export default function Footer({ className = "" }) {
  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="Locafy Logo" 
                  className="h-auto w-[100px]" /* Set to exactly 100px width */
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGMEI0MjkiLz48L3N2Zz4=';
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Find and collect local business leads from Google Maps with powerful AI-driven tools and automation.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Product</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/leads" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  Leads Management
                </Link>
              </li>
              <li>
                <Link to="/google-maps-scraper" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  Google Maps Scraper
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Support</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/email-support" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  Email Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">Legal</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Security
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="text-gray-600 hover:text-gray-900 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  GDPR Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Locafy Systems. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <span className="text-xs text-gray-500">Made with ❤️ for local businesses</span>
          </div>
        </div>
      </div>
    </footer>
  );
}