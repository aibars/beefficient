// Tablas de referencia de la planilla de pastoreo del CREA Utracán (Cocimano, Lange y Menvielle, 1975; Bavera 2006; BCNRM 2016).
import type { CategoriaRodeo, ConsumoGrupo, DuracionServicio, FilaTabla1, GrupoConsumo, Supuestos } from './tipos';

const _ = null;

/** Tabla 1: EV por mes del ciclo (1 a 12); null = no aplica. */
export const TABLA_1: readonly FilaTabla1[] = [
  { id: 'vacas-cria', nombre: 'Vacas de cría', ev: [1.043,1.064,1.16,1.214,1.34,1.394,1.46,0.8,0.82,0.852,0.922,0.99], ajustes: Array(12).fill(null), grupoConsumo: 'vaca' },
  { id: 'vacas-cut', nombre: 'Vacas CUT', ev: [1.052,1.067,1.178,1.232,1.358,1.412,1.466,0.8,0.824,0.86,0.936,1.006], ajustes: Array(12).fill(null), grupoConsumo: 'vaca' },
  { id: 'vaca-2-servicio', nombre: 'Vaca 2º servicio', ev: [1.3,1.35,0.9,0.9,1,1,1,0.9,0.9,0.95,0.95,1], ajustes: Array(12).fill(null), grupoConsumo: 'vaca' },
  { id: 'vaq-1-serv-2-3', nombre: 'Vaq 1º Serv. 2 a 3 años', ev: [0.74,0.76,0.78,0.81,0.83,0.85,0.89,0.99,1,1.05,1.1,1.15], ajustes: Array(12).fill(null), grupoConsumo: 'vaq2' },
  { id: 'vaq-repos-1-2', nombre: 'Vaq Repos. 1 a 2 años', ev: [0.63,0.64,0.65,0.66,0.67,0.68,0.69,0.7,0.71,0.71,0.72,0.75], ajustes: Array(12).fill(null), grupoConsumo: 'vaq1' },
  { id: 'terneras-vc', nombre: 'Terneras Vc', ev: [_,_,_,_,_,_,_,0.58,0.6,0.61,0.62,0.63], ajustes: Array(12).fill(null), grupoConsumo: 'tern' },
  { id: 'terneros-vc', nombre: 'Terneros Vc', ev: [_,_,_,_,_,_,_,0.6,0.61,0.62,0.63,0.65], ajustes: Array(12).fill(null), grupoConsumo: 'tern' },
  { id: 'terneras-vq', nombre: 'Terneras Vq', ev: [_,0.52,0.53,0.54,0.554,0.56,0.57,0.58,0.6,0.61,0.62,0.63], ajustes: Array(12).fill(null), grupoConsumo: 'tern' },
  { id: 'terneros-vq', nombre: 'Terneros Vq', ev: [_,0.54,0.55,0.56,0.57,0.59,0.6,0.6,0.61,0.62,0.63,0.64], ajustes: Array(12).fill(null), grupoConsumo: 'tern' },
  { id: 'toros', nombre: 'Toros', ev: [1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3,1.3], ajustes: Array(12).fill(null), grupoConsumo: 'toro' },
  { id: 'toritos-2-3', nombre: 'Toritos 2 a 3 años', ev: [1.04,1.08,1.12,1.16,1.2,1.2,1.2,1.2,1.2,1.2,1.2,1.1], ajustes: Array(12).fill(null), grupoConsumo: 'toro' },
  { id: 'toritos-1-2', nombre: 'Toritos 1 a 2 años', ev: [0.65,0.68,0.71,0.75,0.78,0.81,0.84,0.87,0.9,0.94,0.97,1], ajustes: Array(12).fill(null), grupoConsumo: 'novt' },
  { id: 'vacas-invernada', nombre: 'Vacas de invernada', ev: [1,1,1,1,1,1,1,1,1,1,1,1], ajustes: Array(12).fill(null), grupoConsumo: 'vaca' },
  { id: 'vaq-2-3-invernada', nombre: 'Vaq 2 a 3 de invernada', ev: [1,1,1,1,1,1,1,1,1,1,1,1], ajustes: Array(12).fill(null), grupoConsumo: 'vaq2' },
  { id: 'vaq-1-2-invernada', nombre: 'Vaq 1 a 2 de invernada', ev: [0.63,0.64,0.65,0.66,0.66,0.67,0.68,0.69,0.7,0.7,0.72,0.75], ajustes: Array(12).fill(null), grupoConsumo: 'vaq1' },
  { id: 'nov-1-2', nombre: 'Nov 1 a 2', ev: [0.65,0.66,0.67,0.68,0.68,0.69,0.7,0.71,0.72,0.73,0.75,0.77], ajustes: Array(12).fill(null), grupoConsumo: 'novt' },
];

/** Cocimano: `COCIMANO[peso][índice de ganancia][columna]`; columnas: lactancia 1-2, 3-4, 5-6, 7-8, seca/vaquillona, gestación 6º a 9º. */
export const COCIMANO: Readonly<Record<300 | 350 | 400 | 450 | 500 | 550, readonly (readonly number[])[]>> = {
  300: [
    [0.88,1.06,1.24,1.3,0.61,0.65,0.69,0.79,0.85],
    [0.9,1.08,1.26,1.32,0.63,0.67,0.71,0.81,0.87],
    [0.93,1.11,1.29,1.35,0.66,0.7,0.74,0.84,0.9],
    [1.03,1.21,1.39,1.45,0.76,0.8,0.84,0.94,1],
    [1.15,1.33,1.51,1.57,0.88,0.92,0.96,1.06,1.12],
    [1.29,1.47,1.65,1.71,1.02,1.06,1.1,1.2,1.26],
  ],
  350: [
    [0.91,1.09,1.27,1.33,0.64,0.68,0.72,0.82,0.88],
    [0.93,1.11,1.29,1.35,0.66,0.7,0.74,0.84,0.9],
    [0.96,1.14,1.32,1.38,0.69,0.73,0.77,0.87,0.93],
    [1.08,1.26,1.44,1.5,0.81,0.85,0.89,0.99,1.05],
    [1.21,1.39,1.57,1.63,0.94,0.98,1.02,1.12,1.18],
    [1.36,1.54,1.72,1.78,1.09,1.13,1.17,1.27,1.33],
  ],
  400: [
    [0.94,1.12,1.3,1.36,0.67,0.71,0.75,0.85,0.91],
    [0.97,1.15,1.33,1.39,0.7,0.74,0.78,0.88,0.94],
    [1,1.18,1.36,1.42,0.73,0.77,0.81,0.91,0.97],
    [1.13,1.31,1.49,1.55,0.86,0.9,0.94,1.04,1.1],
    [1.28,1.46,1.64,1.7,1.01,1.05,1.09,1.19,1.25],
    [1.45,1.63,1.81,1.87,1.18,1.22,1.26,1.36,1.42],
  ],
  450: [
    [1,1.18,1.36,1.42,0.73,0.77,0.81,0.91,0.97],
    [1.03,1.21,1.39,1.45,0.76,0.8,0.84,0.94,1],
    [1.07,1.25,1.43,1.49,0.8,0.84,0.88,0.98,1.04],
    [1.21,1.39,1.57,1.63,0.94,0.98,1.02,1.12,1.18],
    [1.37,1.55,1.73,1.79,1.1,1.14,1.18,1.28,1.34],
    [1.55,1.73,1.91,1.87,1.28,1.32,1.36,1.46,1.52], // 1,87 como la planilla; probable error de tipeo por 1,97. Lo validan Gastón y Federico (BFC-58).
  ],
  500: [
    [1.05,1.23,1.4,1.47,0.78,0.82,0.84,0.96,1.01],
    [1.09,1.27,1.44,1.51,0.82,0.86,0.88,1,1.06],
    [1.13,1.31,1.48,1.55,0.86,0.9,0.92,1.04,1.1],
    [1.29,1.47,1.64,1.71,1.02,1.06,1.08,1.2,1.26],
    [1.47,1.64,1.81,1.88,1.19,1.23,1.26,1.38,1.44],
    [1.67,1.84,2.01,2.07,1.38,1.42,1.45,1.58,1.64],
  ],
  550: [
    [1.13,1.3,1.47,1.55,0.86,0.9,0.92,1.04,1.09],
    [1.17,1.35,1.52,1.59,0.9,0.94,0.96,1.08,1.13],
    [1.22,1.39,1.56,1.63,0.94,0.98,1,1.12,1.18],
    [1.39,1.56,1.73,1.8,1.11,1.15,1.18,1.3,1.36],
    [1.58,1.76,1.93,1.99,1.3,1.34,1.37,1.49,1.55],
    [1.8,1.98,2.15,2.21,1.52,1.56,1.59,1.71,1.77],
  ],
};

export const COCIMANO_GANANCIAS = [-200, -100, 0, 250, 500, 750] as const;
export const COCIMANO_PESOS = [300, 350, 400, 450, 500, 550] as const;

/** Vaquillonas livianas, por ganancia de -200, -100, 0, 250, 500, 750, 1000, 1250 g/día. */
export const COCIMANO_VAQ: Readonly<Record<150 | 200 | 250, readonly number[]>> = {
  150: [0.46, 0.48, 0.5, 0.56, 0.63, 0.71, 0.8, 0.9],
  200: [0.5, 0.52, 0.54, 0.62, 0.71, 0.8, 0.91, 1.03],
  250: [0.56, 0.58, 0.6, 0.69, 0.8, 0.91, 1.04, 1.18],
};
export const COCIMANO_VAQ_PESOS = [150, 200, 250] as const;

/** Consumo de MS: peso vivo (kg) y %PV por grupo; referencia orientativa, pastura de buena calidad. */
export const CONSUMO_POR_DEFECTO: Readonly<Record<GrupoConsumo, Readonly<ConsumoGrupo>>> = {
  lact: { pesoVivo: 450, pct: 2.7 },
  seca: { pesoVivo: 450, pct: 2 },
  gest: { pesoVivo: 450, pct: 2.2 },
  vaq2: { pesoVivo: 350, pct: 2.5 },
  vaq1: { pesoVivo: 250, pct: 2.6 },
  toro: { pesoVivo: 700, pct: 1.8 },
  tern: { pesoVivo: 200, pct: 2.8 },
  novt: { pesoVivo: 300, pct: 2.6 },
  nov: { pesoVivo: 400, pct: 2.4 },
};

export const SUPUESTOS_POR_DEFECTO: Readonly<Supuestos> = { gestacion: 283, fraccionServicio: 0.4, margenExtrapolacion: 50, diasPorMes: 30.4375 };

export const CATEGORIAS_RODEO: readonly CategoriaRodeo[] = ['Vaca', 'Vaquillona 1er servicio', 'Vaquillona 2do servicio', 'Vaquillona de reposición', 'Toro', 'Ternero/a recría', 'Novillito', 'Novillo'];

export const DURACIONES_SERVICIO: readonly DuracionServicio[] = [60, 75, 90, 105, 120];

export const EFICIENCIA_COSECHA_POR_DEFECTO = 50;
