import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings, 
  Search,
  Brain,
  Shield,
  BarChart3,
  UserCog,
  Database,
  Activity,
  Globe,
  Mail,
  CreditCard,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { APP_INFO } from '@/lib/config';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { profile } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: UserPlus },
    { name: 'Lead Scraper', href: '/lead-scraper', icon: Search },
    { name: 'Email Outreach', href: '/email-outreach', icon: Mail },
    { name: 'Clients', href: '/clients', icon: Users, requiredRoles: ['admin', 'closer', 'agent'] },
    { name: 'Automation Builder', href: '/automation-builder', icon: Zap },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Brain },
    { name: 'Integrations', href: '/integrations-page', icon: Globe },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: UserCog },
    { name: 'Lead Management', href: '/admin/leads', icon: Database },
    { name: 'System Logs', href: '/admin/logs', icon: Activity },
  ];

  const canAccessRoute = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!profile) return false;
    return requiredRoles.includes(profile.role);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center justify-center"
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={closeMenu}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white shadow-xl z-50 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
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
                  <Button variant="ghost" size="sm" onClick={closeMenu} aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* User Info */}
                {profile && (
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                  </div>
                )}

                {/* Admin Panel Toggle */}
                {profile?.role === 'admin' && (
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        {isAdminRoute ? 'Admin Panel' : 'User Panel'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {/* Admin Navigation */}
                  {profile?.role === 'admin' && (
                    <>
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          {isAdminRoute ? 'Admin Panel' : 'Quick Access'}
                        </h3>
                        {(isAdminRoute ? adminNavigation : adminNavigation.slice(0, 1)).map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={cn(
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 mb-1',
                                isActive
                                  ? 'bg-red-50 text-red-700'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              )}
                              onClick={closeMenu}
                            >
                              <item.icon
                                className={cn(
                                  'mr-3 h-5 w-5 transition-colors',
                                  isActive ? 'text-red-700' : 'text-gray-400 group-hover:text-gray-500'
                                )}
                              />
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                      
                      {!isAdminRoute && <div className="border-t border-gray-200 my-4"></div>}
                    </>
                  )}

                  {/* Regular Navigation */}
                  {!isAdminRoute && (
                    <>
                      {profile?.role === 'admin' && (
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          User Panel
                        </h3>
                      )}
                      {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        
                        if (!canAccessRoute(item.requiredRoles)) {
                          return null;
                        }

                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                              'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 mb-1',
                              isActive
                                ? 'bg-amber-50 text-amber-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                            onClick={closeMenu}
                          >
                            <item.icon
                              className={cn(
                                'mr-3 h-5 w-5 transition-colors',
                                isActive ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-500'
                              )}
                            />
                            {item.name}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {APP_INFO.name} v{APP_INFO.version}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Powered by Google Maps
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}