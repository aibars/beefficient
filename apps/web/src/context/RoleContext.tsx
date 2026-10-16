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
  const [authKey, setAuthKey] = useState(0);

  useEffect(() => {
    const savedRole = localStorage.getItem('beefficient-role') as UserRole | null;
    if (savedRole && (savedRole === 'productor' || savedRole === 'tecnico')) {
      setRoleState(savedRole);
    }
    setAuthenticated(authService.isAuthenticated());
    const onUnauthorized = () => {
      setAuthenticated(false);
      setAuthKey((k) => k + 1);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    setMounted(true);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const logout = () => {
    authService.logout();
    setAuthenticated(false);
    setAuthKey((k) => k + 1);
  };

  const setRole = (newRole: UserRole) => {
    localStorage.setItem('beefficient-role', newRole);
    setRoleState(newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, authenticated, logout }}>
      <React.Fragment key={authKey}>{children}</React.Fragment>
      {mounted && !authenticated && (
        <LoginDialog
          onSuccess={() => {
            setAuthenticated(true);
            setAuthKey((k) => k + 1);
          }}
        />
      )}
    </RoleContext.Provider>
  );
}

export { RoleContext };
