import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Settings, 
  Search,
  Mail,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { APP_INFO } from '@/lib/config';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { analytics, AnalyticsEvents } from '@/lib/analytics';

export default function TopNav() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: UserPlus },
    { name: 'Lead Scraper', href: '/lead-scraper', icon: Search },
    { name: 'Email Outreach', href: '/email-outreach', icon: Mail },
    { name: 'Clients', href: '/clients', icon: Users, requiredRoles: ['admin', 'closer', 'agent'] },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
    { name: 'User Management', href: '/admin/users', icon: Users },
  ];

  const canAccessRoute = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!profile) return false;
    return requiredRoles.includes(profile.role);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      analytics.track({
        name: AnalyticsEvents.SIGN_OUT,
        userId: user?.uid,
      });
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const getUserInitials = () => {
    if (profile?.displayName) {
      return profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-[#0f0f12] border-b border-[#1f1f24] px-4 py-2.5">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center mr-6">
            <Zap className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold text-white">Locafyr</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navigation
              .filter(item => canAccessRoute(item.requiredRoles))
              .map((item) => {
                const isActive = location.pathname === item.href || 
                                location.pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-gray-400 hover:text-white hover:bg-[#1f1f24]'
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}

            {/* Admin Links (if admin) */}
            {profile?.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1f1f24]">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-accent" />
                      <span>Admin</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a1a1f] border-[#2a2a30]">
                  {adminNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} onClick={() => navigate(item.href)} className="text-gray-300 hover:text-white focus:text-white focus:bg-[#2a2a30]">
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* User Menu */}
        <div className="hidden md:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#1a1a1f] border-[#2a2a30]" align="end" forceMount>
              <div className="flex items-center space-x-2 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {profile?.displayName || user?.email}
                  </p>
                  <p className="text-xs leading-none text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-[#2a2a30]" />
              <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')} className="text-gray-300 hover:text-white focus:text-white focus:bg-[#2a2a30]">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-gray-300 hover:text-white focus:text-white focus:bg-[#2a2a30]">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2a2a30]" />
              <DropdownMenuItem onClick={handleSignOut} className="text-accent hover:text-accent focus:text-accent focus:bg-[#2a2a30]">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 py-2 border-t border-[#1f1f24]">
          <div className="space-y-1 px-2">
            {navigation
              .filter(item => canAccessRoute(item.requiredRoles))
              .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-gray-400 hover:bg-[#1f1f24] hover:text-white'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}

            {/* Admin Links (if admin) */}
            {profile?.role === 'admin' && (
              <>
                <div className="pt-2 pb-1 px-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </p>
                </div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium',
                      location.pathname === item.href
                        ? 'bg-accent/20 text-accent'
                        : 'text-gray-400 hover:bg-[#1f1f24] hover:text-white'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-accent" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
              </>
            )}

            {/* User Info & Sign Out */}
            <div className="pt-4 pb-3 border-t border-[#1f1f24]">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {profile?.displayName || 'User'}
                  </div>
                  <div className="text-sm font-medium text-gray-400">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-accent hover:text-accent hover:bg-[#1f1f24]"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}