import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings, 
  Search,
  Shield,
  BarChart3,
  UserCog,
  Database,
  Activity,
  Globe,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { usePlanEnforcement } from '@/hooks/usePlanEnforcement';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import { APP_INFO } from '@/lib/config';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: UserPlus },
  { name: 'Lead Scraper', href: '/lead-scraper', icon: Search },
  { name: 'Email Outreach', href: '/email-outreach', icon: Mail },
  { name: 'Clients', href: '/clients', icon: Users, requiredRoles: ['admin', 'closer', 'agent'] },
  { name: 'Integrations', href: '/integrations-page', icon: Globe },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'User Management', href: '/admin/users', icon: UserCog },
  { name: 'Lead Management', href: '/admin/leads', icon: Database },
  { name: 'System Logs', href: '/admin/logs', icon: Activity },
];

export default function Sidebar({ className = "" }) {
  const location = useLocation();
  const { profile, user } = useAuth();
  const { canPerformAction } = usePlanEnforcement();

  const canAccessRoute = (requiredRoles?: string[], requiredFeature?: string) => {
    // Check role-based access
    if (requiredRoles && requiredRoles.length > 0) {
      if (!profile) return false;
      if (!requiredRoles.includes(profile.role)) return false;
    }
    
    // Check plan-based feature access
    if (requiredFeature) {
      const permission = canPerformAction(requiredFeature);
      return permission.allowed;
    }
    
    return true;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'closer':
        return 'bg-purple-100 text-purple-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'setter':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleNavClick = (itemName: string) => {
    if (user) {
      analytics.track({
        name: AnalyticsEvents.FEATURE_DISCOVERED,
        properties: { feature: itemName },
        userId: user.uid,
      });
    }
  };

  return (
    <div className={`w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex ${className}`}>
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex items-center justify-center w-full"
        >
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
        </motion.div>
      </div>

      {/* User Info */}
      {profile && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile.email}</p>
            </div>
            <Badge className={`${getRoleColor(profile.role)}`} variant="secondary">
              {profile.role.toUpperCase()}
            </Badge>
          </div>
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
          <p className="text-xs text-gray-500 mt-1">
            {isAdminRoute ? 'System administration' : 'Regular user interface'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Admin Navigation (only for admins and when in admin routes) */}
        {profile?.role === 'admin' && (
          <>
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {isAdminRoute ? 'Admin Panel' : 'Quick Access'}
              </h3>
              {(isAdminRoute ? adminNavigation : adminNavigation.slice(0, 1)).map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                      onClick={() => handleNavClick(item.name)}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 transition-colors',
                          isActive ? 'text-red-700' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="activeAdminTab"
                          className="absolute right-0 w-0.5 h-6 bg-red-700 rounded-l"
                        />
                      )}
                    </Link>
                  </motion.div>
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
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              
              if (!canAccessRoute(item.requiredRoles, item.requiredFeature)) {
                return null;
              }

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    onClick={() => handleNavClick(item.name)}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
                        isActive ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute right-0 w-0.5 h-6 bg-amber-500 rounded-l"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {APP_INFO.name} v{APP_INFO.version}
          </p>
          <div className="flex justify-center space-x-2 mt-1">
            <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-600">Terms</Link>
            <span className="text-xs text-gray-400">•</span>
            <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-600">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}