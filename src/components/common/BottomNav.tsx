import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Brain, 
  Settings,
  Menu,
  Mail,
  Globe,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import MobileNav from '../layout/MobileNav';

export default function BottomNav() {
  const location = useLocation();
  const { profile } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to hide/show bottom nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    // Get the scrollable content element
    const scrollableContent = document.querySelector('.scrollable-content');
    if (scrollableContent) {
      scrollableContent.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        scrollableContent.removeEventListener('scroll', handleScroll);
      };
    }
    
    return () => {};
  }, [lastScrollY]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: UserPlus },
    { name: 'Menu', href: '#', icon: Menu, isMenu: true },
    { name: 'Automation', href: '/automation-builder', icon: Zap },
    { name: 'Integrations', href: '/integrations-page', icon: Globe },
  ];

  const canAccessRoute = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!profile) return false;
    return requiredRoles.includes(profile.role);
  };

  return (
    <motion.div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          if (item.requiredRoles && !canAccessRoute(item.requiredRoles)) {
            return null;
          }
          
          if (item.isMenu) {
            return (
              <MobileNav key={item.name} />
            );
          }
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full',
                isActive ? 'text-amber-600' : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 w-12 h-1 bg-amber-500 rounded-t"
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}