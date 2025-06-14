import { useState, useEffect } from 'react';
import { authService, AuthState } from '@/lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getCurrentState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    signOut: authService.signOut.bind(authService),
    updateProfile: authService.updateUserProfile.bind(authService),
    canViewAllLeads: authService.canViewAllLeads(authState.profile),
    canEditLead: (leadOwnerId: string) => authService.canEditLead(authState.profile, leadOwnerId),
    canDeleteLead: (leadOwnerId: string) => authService.canDeleteLead(authState.profile, leadOwnerId),
    canConvertLead: authService.canConvertLead(authState.profile),
    canCreateLead: authService.canCreateLead(authState.profile),
    canViewClients: authService.canViewClients(authState.profile),
  };
}