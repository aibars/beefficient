'use client';

import React from 'react';
import { PriceTable } from '@/components/PriceTable';
import { AsyncState } from '@/components/AsyncState';
import { useAsync } from '@/hooks/useAsync';
import { getPrices } from '@/services/prices.service';
import { formatDate } from '@/lib/utils';

export default function PreciosPage() {
  const result = useAsync(() => getPrices(), []);
  const prices = result.data ?? [];
  return (
    <div className="page-precios">
      <h1>Precios del Día</h1>
      <p className="precios-subtitle">
        Última actualización: {formatDate(new Date())}
      </p>

      <AsyncState loading={result.loading} error={result.error} onRetry={result.retry} />

      {result.data && (<>
      <section className="precios-section">
        <h2>Ganadería</h2>
        <PriceTable
          prices={prices.filter((p) =>
            ['Ternero', 'Novillos'].includes(p.commodity)
          )}
        />
      </section>

      <section className="precios-section">
        <h2>Granos y Forrajes</h2>
        <PriceTable
          prices={prices.filter(
            (p) => !['Ternero', 'Novillos'].includes(p.commodity)
          )}
        />
      </section>
      </>)}

      <div className="precios-footer">
        <p>Datos provistos por Mercado Agroganadero y BCBA</p>
      </div>
    </div>
  );
}
