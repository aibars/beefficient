'use client';

import React from 'react';
import { Dialog } from '@/components/Dialog';
import { KPIGrid } from '@/components/KPIGrid';
import { WeatherWidget } from '@/components/Weather';
import { AsyncState } from '@/components/AsyncState';
import { useAsync } from '@/hooks/useAsync';
import { getKPIs } from '@/services/kpis.service';
import type { Weather } from '@/lib/types';
import { useState, useEffect } from 'react';

const HOME_COPY = {
  greeting: '¡Buen día!',
  intro: 'Bienvenido a tu panel de control de pastoreo.',
  note: 'Actualizaciones disponibles en los últimos registros de tus rodeos.',
};

// TODO: no weather endpoint in the API yet; static placeholder until one exists.
const PLACEHOLDER_WEATHER: Weather = { city: 'Utracán, La Pampa', temp: 28, condition: 'Soleado' };

export default function Home() {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<'productor' | 'tecnico' | null>(null);
  const kpis = useAsync(() => getKPIs(), []);

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
            <h1>{HOME_COPY.greeting}</h1>
            <p>{HOME_COPY.intro}</p>
            <p className="home-note">{HOME_COPY.note}</p>
          </section>

          <section className="home-weather">
            <h2>Clima</h2>
            <WeatherWidget data={PLACEHOLDER_WEATHER} />
          </section>

          <section className="home-kpis">
            <h2>Valores & relaciones</h2>
            <AsyncState loading={kpis.loading} error={kpis.error} onRetry={kpis.retry} />
            {kpis.data && <KPIGrid kpis={kpis.data} />}
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
