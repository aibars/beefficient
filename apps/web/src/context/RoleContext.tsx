'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/lib/types';

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('beefficient-role') as UserRole | null;
    if (savedRole && (savedRole === 'productor' || savedRole === 'tecnico')) {
      setRoleState(savedRole);
    }
    setMounted(true);
  }, []);

  const setRole = (newRole: UserRole) => {
    localStorage.setItem('beefficient-role', newRole);
    setRoleState(newRole);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export { RoleContext };
