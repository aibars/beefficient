'use client';

import React from 'react';
import { Table } from '@/components/Table';
import { AsyncState } from '@/components/AsyncState';
import { useAsync } from '@/hooks/useAsync';
import { getProducersForTechnician, getTechnicians } from '@/services/technicians.service';
import type { Producer, Technician } from '@/lib/types';

async function loadTechnicians(): Promise<{
  technicians: Technician[];
  producersByTech: Record<string, Producer[]>;
}> {
  const technicians = await getTechnicians();
  const lists = await Promise.all(
    technicians.map((t) => getProducersForTechnician(t.id)),
  );
  const producersByTech: Record<string, Producer[]> = {};
  technicians.forEach((t, i) => {
    producersByTech[t.id] = lists[i];
  });
  return { technicians, producersByTech };
}

export default function TecnicosPage() {
  const result = useAsync(loadTechnicians, []);
  const technicians = result.data?.technicians ?? [];
  return (
    <div className="page-tecnicos">
      <h1>Técnicos y Asesores</h1>

      <AsyncState loading={result.loading} error={result.error} onRetry={result.retry} />

      {result.data && (<>
      <Table
        data={technicians}
        columns={[
          { key: 'name', label: 'Nombre' },
          {
            key: 'specialization',
            label: 'Especialidad',
          },
          {
            key: 'producerIds',
            label: 'Productores',
            render: (value) => (value as string[]).length,
          },
          {
            key: 'contact',
            label: 'Contacto',
            render: (value) => (
              <a href={`mailto:${value}`} className="link">
                {value}
              </a>
            ),
          },
        ]}
      />

      <div className="technician-details">
        <h2>Cartera de Productores por Técnico</h2>
        <div className="tech-detail-grid">
          {technicians.map((tech) => {
            const producers = result.data?.producersByTech[tech.id] ?? [];
            return (
              <div key={tech.id} className="tech-card">
                <h3>{tech.name}</h3>
                <p className="tech-spec">{tech.specialization}</p>
                <div className="producer-list">
                  {producers.map((p) => (
                    <div key={p.id} className="producer-item">
                      {p.name} — {p.region}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>)}
    </div>
  );
}
