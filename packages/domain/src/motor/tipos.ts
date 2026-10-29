import type { FechaISO } from '../tipos';

export type CategoriaRodeo =
  | 'Vaca' | 'Vaquillona 1er servicio' | 'Vaquillona 2do servicio' | 'Vaquillona de reposición'
  | 'Toro' | 'Ternero/a recría' | 'Novillito' | 'Novillo';
export type DuracionServicio = 60 | 75 | 90 | 105 | 120;
export type GrupoConsumo = 'lact' | 'seca' | 'gest' | 'vaq2' | 'vaq1' | 'toro' | 'tern' | 'novt' | 'nov';
/** 'vaca' = se resuelve por mes del ciclo: lact (1–7), seca (8–9), gest (10–12). */
export type GrupoConsumoTabla1 = GrupoConsumo | 'vaca';
export type Advertencia = 'extrap' | 'fuera' | 'gan';
/** 12 valores, enero a diciembre (o mes 1 a 12 del ciclo, según el campo). */
export type PorMes<T> = readonly T[];

export interface LoteCampana { id: string; nombre: string; hectareas: number | null }

export interface RodeoCampana {
  id: string;
  nombre: string;
  categoria: CategoriaRodeo | null;
  /** kg */
  pesoVivo: number | null;
  /** g/día por mes calendario; null = 0. */
  ganancia: PorMes<number | null>;
  inicioServicio: FechaISO | null;
  duracionServicio: DuracionServicio;
  destete: FechaISO | null;
  usaCocimano: boolean;
}

export interface PastoreoCampana {
  id: string;
  loteId: string | null;
  rodeoId: string | null;
  cabezas: number | null;
  entrada: FechaISO | null;
  salida: FechaISO | null;
  categoriaTabla1Id: string | null;
  evManual: number | null;
}

export interface FilaTabla1 {
  id: string;
  nombre: string;
  /** EV por mes del ciclo (1 a 12); null = no aplica. */
  ev: PorMes<number | null>;
  /** Ajuste manual por mes calendario (Tabla 3); pisa a `ev`. */
  ajustes: PorMes<number | null>;
  grupoConsumo: GrupoConsumoTabla1;
}

export interface ConsumoGrupo { pesoVivo: number; pct: number }

export interface Supuestos {
  /** días */ gestacion: number;
  /** fracción de la duración del servicio */ fraccionServicio: number;
  /** kg */ margenExtrapolacion: number;
  diasPorMes: number;
}

export interface Campana {
  anio: number;
  /** Mes de servicio, de 1 a 12 (enero = 1; no es `Date.getMonth()`). Se redondea; fuera de 1 a 12 vale 1, como en la planilla. */
  mesServicio: number;
  /** Porcentaje, de 1 a 100 (50, no 0,5). Fuera de ese rango vale 50. */
  eficienciaCosecha: number;
  lotes: readonly LoteCampana[];
  rodeos: readonly RodeoCampana[];
  pastoreos: readonly PastoreoCampana[];
  /** Por defecto: TABLA_1. Categorías propias = filas agregadas al final. */
  tabla1?: readonly FilaTabla1[];
  consumo?: Readonly<Partial<Record<GrupoConsumo, ConsumoGrupo>>>;
  supuestos?: Partial<Supuestos>;
}

export interface IndicadoresFila {
  totales: number | null;
  raciones: number | null;
  racionesPorHa: number | null;
  carga: number | null;
}

export interface FilaCalculada {
  pastoreoId: string;
  /** Columna MES: «abril 2026» o «mar a may 2026». */
  mes: string | null;
  hectareas: number | null;
  cabezas: number | null;
  evAutomatico: number | null;
  evEsManual: boolean;
  evPorCabeza: number | null;
  fuenteEv: 'cocimano' | 'tabla1' | null;
  advertencias: readonly Advertencia[];
  /** salida − entrada; puede ser 0 o negativo, como en la planilla. */
  dias: number | null;
  ev: IndicadoresFila;
  ms: IndicadoresFila & { consumoPorCabeza: number | null; oferta: number | null };
}

export interface ResultadoMes { mes: FechaISO; promedio: number; carga: number | null; raciones: number; oferta: number }

export interface ResultadoLote {
  loteId: string;
  hectareas: number;
  diasPorMes: readonly number[];
  dias: number;
  diasLibres: number;
  ocupacion: number;
  carga: number;
  raciones: number;
  racionesPorHa: number;
  racionesPorMes: readonly number[];
  oferta: number;
  ofertaPorHa: number;
  ofertaPorMes: readonly number[];
  pastoreos: number;
  racionesPromedio: number;
  racionesPorHaPromedio: number;
}

export interface ResultadoRodeo { rodeoId: string | null; categoria: CategoriaRodeo | null; cabezasPorMes: readonly number[] }

export interface ResultadosCampana {
  unidad: 'EV' | 'MS';
  hayDatos: boolean;
  /** Primer día de cada mes con pastoreo. */
  meses: readonly FechaISO[];
  diasAnio: number;
  superficieTotal: number;
  eficienciaCosecha: number;
  porMes: readonly ResultadoMes[];
  lotes: readonly ResultadoLote[];
  rodeos: readonly ResultadoRodeo[];
  cargaAnual: number;
  racionesTotales: number;
}

export interface CalculoCampana { filas: readonly FilaCalculada[]; ev: ResultadosCampana; ms: ResultadosCampana }
