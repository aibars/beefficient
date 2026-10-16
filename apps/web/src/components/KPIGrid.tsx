import React from 'react';
import { KPI } from '@/lib/types';
import { KPICard } from './KPICard';

interface KPIGridProps {
  kpis: KPI[];
}

export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className="kpi-grid">
      {kpis.map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
