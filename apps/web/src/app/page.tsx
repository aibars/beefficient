'use client';

import React from 'react';
import { Dialog } from '@/components/Dialog';
import { KPIGrid } from '@/components/KPIGrid';
import { WeatherWidget } from '@/components/Weather';
import { mockHomeData } from '@/lib/mockData';
import { useState, useEffect } from 'react';

export default function Home() {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<'productor' | 'tecnico' | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem('beefficient-role') as 'productor' | 'tecnico' | null;
    if (savedRole) {
      setRole(savedRole);
    } else {
      setShowRoleDialog(true);
    }
  }, []);

  const handleRoleSelect = (newRole: 'productor' | 'tecnico') => {
    localStorage.setItem('beefficient-role', newRole);
    setRole(newRole);
    setShowRoleDialog(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Dialog
        open={showRoleDialog && !role}
        title="Selecciona tu rol"
        onClose={() => setShowRoleDialog(false)}
      >
        <div className="role-selection">
          <button
            className="role-button"
            onClick={() => handleRoleSelect('productor')}
          >
            Soy productor
          </button>
          <button
            className="role-button"
            onClick={() => handleRoleSelect('tecnico')}
          >
            Soy técnico
          </button>
        </div>
      </Dialog>

      {role && (
        <div className="home-page">
          <section className="home-hero">
            <h1>{mockHomeData.greeting}</h1>
            <p>{mockHomeData.intro}</p>
            <p className="home-note">{mockHomeData.note}</p>
          </section>

          <section className="home-weather">
            <h2>Clima</h2>
            <WeatherWidget data={mockHomeData.weather} />
          </section>

          <section className="home-kpis">
            <h2>Valores & relaciones</h2>
            <KPIGrid kpis={mockHomeData.kpis} />
          </section>

          <section className="home-links">
            <h2>Explora</h2>
            <div className="link-grid">
              {role === 'tecnico' && (
                <a href="/productores" className="link-card">
                  <h3>Mis productores</h3>
                  <p>Gestiona tu cartera de clientes</p>
                </a>
              )}
              <a href="/precios" className="link-card">
                <h3>Precios del día</h3>
                <p>Cotizaciones en tiempo real</p>
              </a>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
