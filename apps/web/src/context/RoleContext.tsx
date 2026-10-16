'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/lib/types';
import { UNAUTHORIZED_EVENT } from '@/lib/api';
import * as authService from '@/services/auth.service';
import { LoginDialog } from '@/components/LoginDialog';

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  authenticated: boolean;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('beefficient-role') as UserRole | null;
    if (savedRole && (savedRole === 'productor' || savedRole === 'tecnico')) {
      setRoleState(savedRole);
    }
    setAuthenticated(authService.isAuthenticated());
    const onUnauthorized = () => setAuthenticated(false);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    setMounted(true);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const logout = () => {
    authService.logout();
    setAuthenticated(false);
  };

  const setRole = (newRole: UserRole) => {
    localStorage.setItem('beefficient-role', newRole);
    setRoleState(newRole);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <RoleContext.Provider value={{ role, setRole, authenticated, logout }}>
      {children}
      {!authenticated && (
        <LoginDialog onSuccess={() => setAuthenticated(true)} />
      )}
    </RoleContext.Provider>
  );
}

export { RoleContext };
