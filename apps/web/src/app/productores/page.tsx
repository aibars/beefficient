'use client';

import React, { useState, useMemo } from 'react';
import { Table } from '@/components/Table';
import { AsyncState } from '@/components/AsyncState';
import { useAsync } from '@/hooks/useAsync';
import { getProducers } from '@/services/producers.service';
import { daysAgo } from '@/lib/utils';

export default function ProductoresPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const limit = 50;
  const result = useAsync(() => getProducers(page, limit), [page]);
  const producers = result.data?.data ?? [];
  const total = result.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const filteredProducers = useMemo(() => {
    return producers.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [producers, searchTerm]);

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

      <AsyncState loading={result.loading} error={result.error} onRetry={result.retry} />

      {result.data && !result.loading && (
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
      )}

      {result.data && (
        <>
          <div className="results-info">
            Mostrando {filteredProducers.length} de {total} productores
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button type="button" className="retry-button" disabled={page <= 1 || result.loading} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button type="button" className="retry-button" disabled={page >= totalPages || result.loading} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
