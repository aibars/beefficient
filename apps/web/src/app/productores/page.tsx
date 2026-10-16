'use client';

import React, { useState, useMemo } from 'react';
import { Table } from '@/components/Table';
import { mockProducers } from '@/lib/mockData';
import { daysAgo } from '@/lib/utils';

export default function ProductoresPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducers = useMemo(() => {
    return mockProducers.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="page-productores">
      <h1>Productores</h1>

      <div className="page-controls">
        <input
          type="text"
          placeholder="Buscar por nombre o región..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <Table
        data={filteredProducers}
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'region', label: 'Región' },
          {
            key: 'rodeoCount',
            label: 'Rodeos',
            render: (value) => <strong>{value}</strong>,
          },
          {
            key: 'metrics',
            label: 'Cabezas',
            render: (_, row) => row.metrics.totalHeads,
          },
          {
            key: 'metrics',
            label: 'Hectáreas',
            render: (_, row) => row.metrics.totalHa,
          },
          {
            key: 'lastActivity',
            label: 'Último movimiento',
            render: (value) => daysAgo(value as any),
          },
          {
            key: 'status',
            label: 'Estado',
            render: (value) => (
              <span
                className="status-badge"
                data-status={value}
              >
                {value === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            ),
          },
        ]}
      />

      <div className="results-info">
        Mostrando {filteredProducers.length} de {mockProducers.length} productores
      </div>
    </div>
  );
}
