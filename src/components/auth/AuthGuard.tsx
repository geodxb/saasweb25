import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { analytics, AnalyticsEvents } from '@/lib/analytics';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string[];
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRole = [] 
}: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Track unauthorized access attempt
        analytics.track({
          name: 'unauthorized_access_attempt',
          properties: {
            path: location.pathname,
            requiredAuth: true,
          },
        });
        
        // Redirect to login with return URL
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      } else if (user && !profile) {
        // User exists but no profile, redirect to complete profile
        navigate('/complete-profile', { replace: true });
      } else if (requiredRole.length > 0 && profile && !requiredRole.includes(profile.role)) {
        // Track insufficient permissions
        analytics.track({
          name: 'insufficient_permissions',
          properties: {
            path: location.pathname,
            userRole: profile.role,
            requiredRoles: requiredRole,
          },
          userId: user?.uid,
        });
        
        // User doesn't have required role
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [user, profile, loading, requireAuth, requiredRole, navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="md" text="Loading..." />
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect to login
  }

  if (user && !profile) {
    return null; // Will redirect to complete profile
  }

  if (requiredRole.length > 0 && profile && !requiredRole.includes(profile.role)) {
    return null; // Will redirect to unauthorized
  }

  return <>{children}</>;
}