'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';

interface NavProps {
  onRoleSelect?: (role: 'productor' | 'tecnico') => void;
}

export function Nav({ onRoleSelect }: NavProps) {
  const { role, setRole } = useRole();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleRoleChange = (newRole: 'productor' | 'tecnico') => {
    setRole(newRole);
    setShowRoleMenu(false);
    if (onRoleSelect) onRoleSelect(newRole);
  };

  return (
    <nav className="nav">
      <div className="nav-brand">
        <Link href="/">
          <span className="beef">BEEF</span>
          <span className="icient">ICIENT</span>
        </Link>
      </div>

      <div className="nav-center">
        <Link href="/" className={role ? 'nav-link' : 'nav-link disabled'}>
          Inicio
        </Link>
        {role === 'productor' && (
          <>
            <Link href="/precios" className="nav-link">
              Precios
            </Link>
          </>
        )}
        {role === 'tecnico' && (
          <>
            <Link href="/productores" className="nav-link">
              Productores
            </Link>
            <Link href="/precios" className="nav-link">
              Precios
            </Link>
          </>
        )}
      </div>

      <div className="nav-end">
        <span className="nav-role-label">
          {role ? (role === 'productor' ? 'Productor' : 'Técnico') : 'Sin rol'}
        </span>
        <button
          className="nav-role-button"
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          aria-label="Cambiar rol"
        >
          ⚙️
        </button>

        {showRoleMenu && (
          <div className="nav-role-menu">
            <button onClick={() => handleRoleChange('productor')}>
              Productor
            </button>
            <button onClick={() => handleRoleChange('tecnico')}>
              Técnico
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
