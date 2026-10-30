/**
 * DATOS DE EJEMPLO para desarrollo: no son datos reales.
 *
 * Datos puros: solo `import type` del dominio, porque la seed corre con ts-node
 * (CommonJS) y no puede cargar el paquete ESM `@beefficient/domain` en runtime.
 * Los ids son UUID fijos para que la seed sea idempotente.
 */
import type { PotreroDto, LoteDto, CampanaCompletaDto } from '../planilla.types';

const P = '7a1e0000-0000-4000-8000-';

export const USUARIO_EJEMPLO = {
  id: `${P}000000000001`,
  email: 'dev@beefficient.local',
  password: 'Beefficient2026',
};
export const EMPRESA_EJEMPLO_ID = `${P}000000000002`;
export const ESTABLECIMIENTO_EJEMPLO_ID = `${P}000000000003`;
export const CAMPO_EJEMPLO = { nombre: 'La Esperanza', provincia: 'La Pampa' };

export const POTREROS_EJEMPLO: PotreroDto[] = [
  { id: `${P}000000000101`, nombre: 'Potrero Norte', hectareas: 120 },
  { id: `${P}000000000102`, nombre: 'Potrero Sur', hectareas: 90 },
];

export const LOTES_EJEMPLO: LoteDto[] = [
  { id: `${P}000000000201`, nombre: 'Lote 1', hectareas: 60, potreroId: POTREROS_EJEMPLO[0].id },
  { id: `${P}000000000202`, nombre: 'Lote 2', hectareas: 60, potreroId: POTREROS_EJEMPLO[0].id },
  { id: `${P}000000000203`, nombre: 'Lote 3', hectareas: 45, potreroId: null },
];

const SIN_GANANCIA = Array(12).fill(null) as (number | null)[];
const R = (n: number) => `${P}00000000040${n}`;
const PA = (n: number) => `${P}0000000005${String(n).padStart(2, '0')}`;

export const CAMPANA_EJEMPLO_ID = `${P}000000000301`;

export const CAMPANA_EJEMPLO: CampanaCompletaDto = {
  id: CAMPANA_EJEMPLO_ID,
  anio: 2026,
  mesServicio: 11,
  eficienciaCosecha: 50,
  lotes: LOTES_EJEMPLO.map(({ id, nombre, hectareas }) => ({ id, nombre, hectareas })),
  rodeos: [
    {
      id: R(1), nombre: 'Vacas de cría', categoria: 'Vaca', pesoVivo: 450,
      ganancia: Array(12).fill(200) as number[],
      inicioServicio: '2025-11-15', duracionServicio: 90, destete: '2026-06-15', usaCocimano: true,
    },
    {
      id: R(2), nombre: 'Vaquillonas 1er servicio', categoria: 'Vaquillona 1er servicio', pesoVivo: 620,
      ganancia: SIN_GANANCIA, inicioServicio: '2025-11-20', duracionServicio: 75, destete: null, usaCocimano: true,
    },
    {
      id: R(3), nombre: 'Toros', categoria: 'Toro', pesoVivo: null,
      ganancia: SIN_GANANCIA, inicioServicio: null, duracionServicio: 90, destete: null, usaCocimano: false,
    },
    {
      id: R(4), nombre: 'Novillitos', categoria: 'Novillito', pesoVivo: null,
      ganancia: SIN_GANANCIA, inicioServicio: null, duracionServicio: 90, destete: null, usaCocimano: false,
    },
  ],
  pastoreos: [
    // Vacas con Cocimano (varios meses)
    { id: PA(1), loteId: LOTES_EJEMPLO[0].id, rodeoId: R(1), cabezas: 80, entrada: '2026-01-05', salida: '2026-03-20', categoriaTabla1Id: null, evManual: null },
    { id: PA(2), loteId: LOTES_EJEMPLO[1].id, rodeoId: R(1), cabezas: 80, entrada: '2026-04-01', salida: '2026-06-10', categoriaTabla1Id: null, evManual: null },
    { id: PA(3), loteId: LOTES_EJEMPLO[0].id, rodeoId: R(1), cabezas: 80, entrada: '2026-09-15', salida: '2026-12-10', categoriaTabla1Id: null, evManual: null },
    // Vaquillonas con peso fuera de la tabla de Cocimano (advertencia)
    { id: PA(4), loteId: LOTES_EJEMPLO[1].id, rodeoId: R(2), cabezas: 35, entrada: '2026-07-01', salida: '2026-08-31', categoriaTabla1Id: null, evManual: null },
    // Toros por Tabla 1
    { id: PA(5), loteId: LOTES_EJEMPLO[2].id, rodeoId: R(3), cabezas: 6, entrada: '2025-12-20', salida: '2026-02-10', categoriaTabla1Id: 'toros', evManual: null },
    { id: PA(6), loteId: LOTES_EJEMPLO[2].id, rodeoId: R(3), cabezas: 6, entrada: '2026-10-05', salida: '2026-11-25', categoriaTabla1Id: 'toros', evManual: null },
    // Novillitos por Tabla 1
    { id: PA(7), loteId: LOTES_EJEMPLO[2].id, rodeoId: R(4), cabezas: 50, entrada: '2026-04-10', salida: '2026-07-20', categoriaTabla1Id: 'nov-1-2', evManual: null },
    // EV manual
    { id: PA(8), loteId: LOTES_EJEMPLO[1].id, rodeoId: R(4), cabezas: 40, entrada: '2026-09-01', salida: '2026-10-15', categoriaTabla1Id: null, evManual: 0.8 },
    // Cruza de año
    { id: PA(9), loteId: LOTES_EJEMPLO[0].id, rodeoId: R(4), cabezas: 30, entrada: '2026-12-15', salida: '2027-01-20', categoriaTabla1Id: 'nov-1-2', evManual: null },
  ],
};
