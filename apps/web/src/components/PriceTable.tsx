import React from 'react';
import { Price } from '@/lib/types';
import { formatPrice, formatPercentage } from '@/lib/utils';

interface PriceTableProps {
  prices: Price[];
}

export function PriceTable({ prices }: PriceTableProps) {
  return (
    <div className="table-container">
      <table className="table price-table">
        <thead>
          <tr>
            <th>Commodity</th>
            <th>Precio</th>
            <th>Cambio</th>
            <th>Fuente</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((p) => (
            <tr key={p.id}>
              <td className="price-commodity">{p.commodity}</td>
              <td className="price-value">{formatPrice(p.value, p.currency)}</td>
              <td
                className="price-change"
                data-positive={p.change > 0}
              >
                {formatPercentage(p.change)}
              </td>
              <td className="price-source">{p.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
