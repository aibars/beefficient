// DATOS DE EJEMPLO, tomados del wireframe móvil del 15/10/2026.
// No son datos reales de ningún establecimiento. Los factores EV y el %PV en MS
// son orientativos (Cocimano, BCNRM 2016) y los validan Gastón Alfaro y
// Federico Podversich.
import type { Lote, Pastoreo, Rodeo } from './tipos';

export const ESTABLECIMIENTO_EJEMPLO = { nombre: 'La Esperanza', campana: '26/27' } as const;

export const LOTES: Lote[] = [
  { id: 1, nombre: 'La Loma', hectareas: 38 },
  { id: 4, nombre: 'Monte', hectareas: 55 },
  { id: 7, nombre: 'El Bajo', hectareas: 42 },
  { id: 9, nombre: 'Verdeo', hectareas: 25 },
];

export const RODEOS: Rodeo[] = [
  { id: 'a', nombre: 'Vacas preñadas A', categoria: 'Vaca · gestación', pesoVivo: 420, cabezas: 120, factorEv: 0.92, pctPesoVivoMS: 2.0 },
  { id: 'b', nombre: 'Vacas con cría', categoria: 'Vaca · lactancia', pesoVivo: 440, cabezas: 95, factorEv: 1.18, pctPesoVivoMS: 2.5 },
  { id: 'c', nombre: 'Vaquillonas 1er servicio', categoria: 'Vaquillona', pesoVivo: 310, cabezas: 85, factorEv: 0.95, pctPesoVivoMS: 2.4 },
  { id: 'd', nombre: 'Terneros destete', categoria: 'Ternero', pesoVivo: 180, cabezas: 140, factorEv: 1.05, pctPesoVivoMS: 2.8 },
  { id: 'e', nombre: 'Novillos recría', categoria: 'Novillo', pesoVivo: 280, cabezas: 96, factorEv: 1.0, pctPesoVivoMS: 2.3 },
];

export const PASTOREOS: Pastoreo[] = [
  { id: 'p1', loteId: 4, rodeoId: 'a', cabezas: 120, entrada: '2026-03-15', salida: '2026-04-03', sincronizado: true },
  { id: 'p2', loteId: 1, rodeoId: 'd', cabezas: 140, entrada: '2026-03-20', salida: '2026-04-08', sincronizado: true },
  { id: 'p3', loteId: 9, rodeoId: 'c', cabezas: 85, entrada: '2026-03-01', salida: '2026-03-18', sincronizado: true },
  { id: 'p4', loteId: 7, rodeoId: 'e', cabezas: 96, entrada: '2026-02-10', salida: '2026-03-02', sincronizado: true },
];
