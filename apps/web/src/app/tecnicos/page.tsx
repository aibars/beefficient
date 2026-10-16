'use client';

import React from 'react';
import { Table } from '@/components/Table';
import { mockTechnicians, mockProducers } from '@/lib/mockData';

export default function TecnicosPage() {
  return (
    <div className="page-tecnicos">
      <h1>Técnicos y Asesores</h1>

      <Table
        data={mockTechnicians}
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
          {mockTechnicians.map((tech) => {
            const producers = mockProducers.filter((p) =>
              tech.producerIds.includes(p.id)
            );
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
    </div>
  );
}
