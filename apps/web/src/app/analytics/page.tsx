'use client';

import React from 'react';
import { SectionHero } from '@/components/SectionHero';

const analyticsSections = [
  {
    id: 'valores',
    title: 'Valores & Relaciones',
    description: 'Indicadores clave de tu operación ganadera',
    icon: 'valores',
    content: (
      <div className="analytics-content">
        <p>
          Monitorea las relaciones entre consumo de materia seca, ganancia de
          peso y carga por hectárea.
        </p>
        <ul>
          <li>Carga por hectárea óptima para tu región</li>
          <li>Ganancia de peso promedio</li>
          <li>Eficiencia de conversión</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'granos',
    title: 'Tendencia de Granos',
    description: 'Seguimiento de precios de insumos',
    icon: 'mercado',
    content: (
      <div className="analytics-content">
        <p>
          Los precios de maíz, soja y sorgo impactan directamente tu costo de
          alimentación.
        </p>
        <ul>
          <li>Precios históricos de 30 días</li>
          <li>Tendencias estacionales</li>
          <li>Indicadores de compra óptima</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'invernada',
    title: 'Invernada — Entre Surcos y Corrales',
    description: 'Caso de estudio de éxito',
    icon: 'bosteo',
    content: (
      <div className="analytics-content">
        <p>
          Cómo un establecimiento en La Pampa logró 0.95 kg/día de ganancia
          usando pasturas de ciclo corto.
        </p>
        <ul>
          <li>Estrategia de rotación de lotes</li>
          <li>Mezcla de pasturas recomendada</li>
          <li>Resultados económicos</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'mercado',
    title: 'Gordos / Consumo — Mercado Agroganadero',
    description: 'Inteligencia de mercado',
    icon: 'precios',
    content: (
      <div className="analytics-content">
        <p>
          Análisis semanal de precios de hacienda gorda y patrones de consumo.
        </p>
        <ul>
          <li>Precios por categoría</li>
          <li>Oferta y demanda semanal</li>
          <li>Recomendaciones de venta</li>
        </ul>
      </div>
    ),
  },
];

export default function AnalyticsPage() {
  return (
    <div className="page-analytics">
      <h1>Inteligencia Ganadera</h1>
      <p className="page-subtitle">
        Análisis, tendencias y casos de éxito para mejorar tu operación
      </p>

      <div className="analytics-grid">
        {analyticsSections.map((section) => (
          <div key={section.id} className="analytics-section-card">
            <SectionHero
              iconId={section.icon}
              title={section.title}
              description={section.description}
            />
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
}
