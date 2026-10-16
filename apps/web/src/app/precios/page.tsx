'use client';

import React from 'react';
import { PriceTable } from '@/components/PriceTable';
import { mockPrices } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

export default function PreciosPage() {
  return (
    <div className="page-precios">
      <h1>Precios del Día</h1>
      <p className="precios-subtitle">
        Última actualización: {formatDate(new Date())}
      </p>

      <section className="precios-section">
        <h2>Ganadería</h2>
        <PriceTable
          prices={mockPrices.filter((p) =>
            ['Ternero', 'Novillos'].includes(p.commodity)
          )}
        />
      </section>

      <section className="precios-section">
        <h2>Granos y Forrajes</h2>
        <PriceTable
          prices={mockPrices.filter(
            (p) => !['Ternero', 'Novillos'].includes(p.commodity)
          )}
        />
      </section>

      <div className="precios-footer">
        <p>Datos provistos por Mercado Agroganadero y BCBA</p>
      </div>
    </div>
  );
}
