import React from 'react';
import { KPI } from '@/lib/types';
import { getStatusColor, formatPercentage } from '@/lib/utils';

interface KPICardProps {
  kpi: KPI;
}

export function KPICard({ kpi }: KPICardProps) {
  const statusColor = getStatusColor(kpi.status);

  return (
    <div className="kpi-card" style={{ borderColor: statusColor }}>
      <div className="kpi-header">
        <h3 className="kpi-label">{kpi.label}</h3>
        {kpi.delta !== undefined && (
          <span className="kpi-delta" style={{ color: statusColor }}>
            {formatPercentage(kpi.delta)}
          </span>
        )}
      </div>
      <div className="kpi-value">
        <span className="kpi-number">{kpi.value}</span>
        <span className="kpi-unit">{kpi.unit}</span>
      </div>
      {kpi.status && (
        <div className="kpi-status" style={{ backgroundColor: statusColor }}>
          {kpi.status === 'good' && '✓ Óptimo'}
          {kpi.status === 'warning' && '⚠ Advertencia'}
          {kpi.status === 'alert' && '✕ Alerta'}
        </div>
      )}
    </div>
  );
}
