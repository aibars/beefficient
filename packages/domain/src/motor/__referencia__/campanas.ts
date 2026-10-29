// Campañas de prueba para los tests de fidelidad: armadas a mano y generadas con semilla.
import { diaDe, fechaDe } from '../fechas';
import { CATEGORIAS_RODEO, DURACIONES_SERVICIO, TABLA_1 } from '../tablas';
import type {
  Campana, CategoriaRodeo, ConsumoGrupo, FilaTabla1, GrupoConsumo, GrupoConsumoTabla1,
  LoteCampana, PastoreoCampana, RodeoCampana, Supuestos,
} from '../tipos';

const SIN_DATO: readonly null[] = Array(12).fill(null);

function rodeo(id: string, p: Partial<RodeoCampana>): RodeoCampana {
  return {
    id, nombre: id, categoria: 'Vaca', pesoVivo: null, ganancia: SIN_DATO,
    inicioServicio: null, duracionServicio: 90, destete: null, usaCocimano: true, ...p,
  };
}

function lote(id: string, hectareas: number | null): LoteCampana {
  return { id, nombre: id, hectareas };
}

let siguiente = 0;
function pastoreo(
  loteId: string | null, rodeoId: string | null, cabezas: number | null,
  entrada: string | null, salida: string | null, categoriaTabla1Id: string | null, evManual: number | null = null,
): PastoreoCampana {
  return { id: `p${++siguiente}`, loteId, rodeoId, cabezas, entrada, salida, categoriaTabla1Id, evManual };
}

/** Un pastoreo por mes, del 1 al 1, durante `meses` meses desde `desde` (aaaa-mm). */
function mensuales(loteId: string, rodeoId: string, cabezas: number, desde: string, meses: number): PastoreoCampana[] {
  const [a, m] = desde.split('-').map(Number) as [number, number];
  return Array.from({ length: meses }, (_, i) => {
    const e = fechaDe(Date.UTC(a, m - 1 + i, 1) / 86400000);
    const s = fechaDe(Date.UTC(a, m + i, 1) / 86400000);
    return pastoreo(loteId, rodeoId, cabezas, e, s, null);
  });
}

function filaPropia(id: string, grupoConsumo: GrupoConsumoTabla1, ev: (number | null)[], ajustes: (number | null)[] = [...SIN_DATO]): FilaTabla1 {
  return { id, nombre: `Categoría ${id}`, ev, ajustes, grupoConsumo };
}

const GANANCIA_VARIADA = [100, null, -300, 800, 0, 250, 500, null, 900, -100, 50, 750];

/** Campañas que cubren cada caso de «Cómo se verifica» de la spec. Nombres de lote y rodeo únicos. */
export const CAMPANAS: Record<string, Campana> = {
  // Campaña a mano de los Tasks 3, 4 y 5: toros en un mes, superpuestos en B; vacas que cruzan de marzo a abril.
  manual: {
    anio: 2026, mesServicio: 11, eficienciaCosecha: 50,
    lotes: [lote('A', 40), lote('B', 10)],
    rodeos: [
      rodeo('T', { categoria: 'Toro', pesoVivo: 800 }),
      rodeo('V', { categoria: 'Vaca', pesoVivo: 400, usaCocimano: false }),
    ],
    pastoreos: [
      pastoreo('B', 'T', 10, '2026-04-01', '2026-04-11', 'toros'),
      pastoreo('B', 'T', 10, '2026-04-06', '2026-04-16', 'toros'),
      pastoreo('A', 'V', 100, '2026-03-27', '2026-04-04', 'vacas-cria'),
    ],
  },
  // Vaca con Cocimano un ciclo completo (lactancia, seca, gestación), con servicio por defecto y destete por defecto,
  // más un rodeo con servicio con fecha y destete corrido; cruce de varios meses y cambio de año.
  cicloVaca: {
    anio: 2026, mesServicio: 11, eficienciaCosecha: 50,
    lotes: [lote('Norte', 120), lote('Sur', 80)],
    rodeos: [
      rodeo('Cría', { categoria: 'Vaca', pesoVivo: 450, ganancia: GANANCIA_VARIADA }),
      rodeo('Cría destete corrido', {
        categoria: 'Vaquillona 2do servicio', pesoVivo: 420, inicioServicio: '2025-11-10', duracionServicio: 60, destete: '2026-03-01',
      }),
    ],
    pastoreos: [
      ...mensuales('Norte', 'Cría', 200, '2026-01', 14),
      ...mensuales('Sur', 'Cría destete corrido', 150, '2025-12', 14),
      pastoreo('Norte', 'Cría', 200, '2026-11-20', '2027-02-10', null),
      pastoreo('Sur', 'Cría destete corrido', 150, '2026-01-15', '2026-07-03', 'vacas-cria'),
    ],
  },
  // Vaquillona 1er servicio antes y después de la concepción; vaquillona de reposición.
  vaquillonas: {
    anio: 2026, mesServicio: 11, eficienciaCosecha: 50,
    lotes: [lote('Bajo', 60)],
    rodeos: [
      rodeo('Vaq 1er', { categoria: 'Vaquillona 1er servicio', pesoVivo: 330, inicioServicio: '2026-11-01', duracionServicio: 75 }),
      rodeo('Repo', { categoria: 'Vaquillona de reposición', pesoVivo: 230, ganancia: Array(12).fill(400) }),
    ],
    pastoreos: [
      ...mensuales('Bajo', 'Vaq 1er', 80, '2026-08', 16),
      ...mensuales('Bajo', 'Repo', 60, '2026-03', 6),
    ],
  },
  // Pesos y ganancias fuera de la tabla: advertencias extrap, fuera y gan.
  fueraDeTabla: {
    anio: 2026, mesServicio: 11, eficienciaCosecha: 50,
    lotes: [lote('Loma', 50)],
    rodeos: [
      rodeo('Liviana', { categoria: 'Vaca', pesoVivo: 280 }),
      rodeo('Muy liviana', { categoria: 'Vaquillona de reposición', pesoVivo: 90, ganancia: Array(12).fill(1200) }),
      rodeo('Pesada', { categoria: 'Vaca', pesoVivo: 590, ganancia: Array(12).fill(-500) }),
      rodeo('Muy pesada', { categoria: 'Vaquillona 2do servicio', pesoVivo: 700 }),
    ],
    pastoreos: [
      pastoreo('Loma', 'Liviana', 30, '2026-02-10', '2026-05-20', null),
      pastoreo('Loma', 'Muy liviana', 30, '2026-02-10', '2026-03-20', null),
      pastoreo('Loma', 'Pesada', 30, '2026-06-01', '2026-09-15', null),
      pastoreo('Loma', 'Muy pesada', 30, '2026-10-01', '2027-01-15', null),
    ],
  },
  // Tabla 1 con ajustes manuales y categorías propias (filas 17 a 20); otro mes de servicio y otra eficiencia.
  tabla1Ajustada: {
    anio: 2026, mesServicio: 3, eficienciaCosecha: 65,
    lotes: [lote('Potrero 1', 25), lote('Potrero 2', 35)],
    rodeos: [
      rodeo('Novillos', { categoria: 'Novillo', pesoVivo: 380 }),
      rodeo('Terneros', { categoria: 'Ternero/a recría', pesoVivo: null }),
    ],
    tabla1: [
      ...TABLA_1.map((t) => t.id === 'toros' || t.id === 'terneros-vq'
        ? { ...t, ajustes: [null, null, null, 1.1, 1.15, null, null, null, null, null, 0.9, null] }
        : t),
      filaPropia('nov-propio', 'nov', [0.8, 0.8, 0.82, 0.84, 0.86, 0.88, 0.9, 0.92, 0.94, 0.96, 0.98, 1]),
      filaPropia('vaca-propia', 'vaca', [1, 1.05, 1.1, null, null, 1.2, 1.25, 0.9, 0.9, 0.95, 0.95, 1], [null, 0.7, ...Array(10).fill(null)]),
    ],
    pastoreos: [
      pastoreo('Potrero 1', 'Novillos', 120, '2026-03-15', '2026-06-20', 'nov-propio'),
      pastoreo('Potrero 2', 'Novillos', 120, '2026-02-01', '2026-05-01', 'vaca-propia'),
      pastoreo('Potrero 2', 'Terneros', 90, '2026-03-20', '2026-05-10', 'terneros-vq'),
      pastoreo('Potrero 1', 'Terneros', 90, '2026-10-01', '2026-12-31', 'toros'),
      pastoreo('Potrero 1', null, 40, '2026-06-01', '2026-06-30', 'vacas-cut'),
    ],
  },
  // EV a mano, fila sin salida, salida ≤ entrada, lotes superpuestos, lote sin hectáreas y ids que no existen.
  bordes: {
    anio: 2027, mesServicio: 10, eficienciaCosecha: 120,
    lotes: [lote('Uno', 30), lote('Sin ha', null), lote('Cero', 0)],
    rodeos: [
      rodeo('Toros', { categoria: 'Toro', pesoVivo: 750 }),
      rodeo('Vacas', { categoria: 'Vaca', pesoVivo: 430 }),
      rodeo('Vacas sin peso', { categoria: 'Vaca', pesoVivo: null }),
    ],
    pastoreos: [
      pastoreo('Uno', 'Toros', 5, '2026-12-20', '2027-01-10', 'toros', 1.1),
      pastoreo('Uno', 'Vacas', 50, '2027-01-05', null, null),
      pastoreo('Uno', 'Vacas', 50, '2027-02-05', '2027-02-05', null),
      pastoreo('Uno', 'Vacas', 50, '2027-03-10', '2027-03-01', 'vacas-cria'),
      pastoreo('Uno', 'Toros', 5, '2027-01-01', '2027-01-20', 'toritos-2-3'),
      pastoreo('Sin ha', 'Vacas', 40, '2027-04-01', '2027-05-01', null),
      pastoreo('Cero', 'Toros', 5, '2027-04-01', '2027-05-01', 'toros'),
      pastoreo('no-existe', 'Toros', 5, '2027-04-01', '2027-05-01', 'toros'),
      pastoreo('Uno', 'no-existe', 5, '2027-04-01', '2027-05-01', 'toros'),
      pastoreo('Uno', 'Toros', 5, '2027-04-01', '2027-05-01', 'no-existe'),
      pastoreo('Uno', 'Vacas sin peso', 70, '2027-04-01', '2027-05-01', 'vacas-cria'),
      pastoreo('Uno', 'Vacas sin peso', 70, '2027-04-01', '2027-05-01', null),
      pastoreo(null, null, null, null, null, null),
      pastoreo('Uno', 'Toros', null, '2027-06-01', '2027-06-11', 'toros'),
    ],
  },
};

/** PRNG determinístico (mulberry32). */
function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GRUPOS: readonly GrupoConsumo[] = ['lact', 'seca', 'gest', 'vaq2', 'vaq1', 'toro', 'tern', 'novt', 'nov'];
const DIA_MIN = diaDe('2023-06-01')!;
const DIA_MAX = diaDe('2028-06-30')!;

/** Campaña al azar, reproducible por semilla. Nombres de lote, rodeo y fila de Tabla 1 únicos; el orden por nombre de lotes y rodeos es el inverso del de los ids. */
export function campanaAleatoria(semilla: number): Campana {
  const azar = mulberry32(semilla);
  const entero = (min: number, max: number): number => min + Math.floor(azar() * (max - min + 1));
  const prob = (p: number): boolean => azar() < p;
  const elegir = <T>(xs: readonly T[]): T => xs[Math.floor(azar() * xs.length)]!;
  const redondo = (min: number, max: number, dec: number): number => Math.round((min + azar() * (max - min)) * 10 ** dec) / 10 ** dec;
  const fecha = (desde = DIA_MIN, hasta = DIA_MAX): string => fechaDe(entero(desde, hasta));
  const porMes = (pNull: number, min: number, max: number, dec: number): (number | null)[] =>
    Array.from({ length: 12 }, () => (prob(pNull) ? null : redondo(min, max, dec)));

  const lotes: LoteCampana[] = Array.from({ length: entero(1, 4) }, (_, i) => ({
    id: `l${i}`, nombre: `Lote ${'zyxw'[i]}`,
    hectareas: prob(0.2) ? null : prob(0.05) ? 0 : redondo(1, 300, prob(0.5) ? 0 : 1),
  }));

  const hembras: readonly CategoriaRodeo[] = CATEGORIAS_RODEO.slice(0, 4);
  const rodeos: RodeoCampana[] = Array.from({ length: entero(1, 5) }, (_, i) => ({
    id: `r${i}`, nombre: `Rodeo ${'edcba'[i]}`,
    categoria: prob(0.08) ? null : prob(0.6) ? elegir(hembras) : elegir(CATEGORIAS_RODEO),
    pesoVivo: prob(0.15) ? null : entero(80, 720),
    ganancia: prob(0.3) ? SIN_DATO : porMes(0.3, prob(0.15) ? -600 : -200, prob(0.15) ? 1500 : 800, 0),
    inicioServicio: prob(0.5) ? null : fecha(diaDe('2025-08-01')!, diaDe('2027-02-28')!),
    duracionServicio: elegir(DURACIONES_SERVICIO),
    destete: prob(0.6) ? null : fecha(),
    usaCocimano: prob(0.85),
  }));

  let tabla1: FilaTabla1[] | undefined;
  if (!prob(0.3)) {
    tabla1 = TABLA_1.map((t) => (prob(0.2) ? { ...t, ajustes: porMes(0.7, 0.4, 1.6, 3) } : t));
    const propias = prob(0.2) ? 0 : entero(1, 4);
    const gruposTabla1: readonly GrupoConsumoTabla1[] = [...GRUPOS, 'vaca'];
    for (let i = 0; i < propias; i++) {
      tabla1.push({
        id: `propia-${i}`, nombre: `Categoría propia ${i}`,
        ev: porMes(0.15, 0.4, 1.6, 3), ajustes: prob(0.4) ? porMes(0.8, 0.4, 1.6, 3) : [...SIN_DATO],
        grupoConsumo: elegir(gruposTabla1),
      });
    }
  }
  const idsTabla1 = (tabla1 ?? TABLA_1).map((t) => t.id);

  const idDe = (ids: readonly string[], pNull: number): string | null =>
    prob(pNull) ? null : prob(0.04) ? 'no-existe' : elegir(ids);

  const pastoreos: PastoreoCampana[] = Array.from({ length: entero(0, 25) }, (_, i) => {
    const entrada = prob(0.05) ? null : entero(DIA_MIN, DIA_MAX);
    const r = azar();
    const salida = entrada == null ? (prob(0.5) ? null : fecha())
      : r < 0.12 ? null
      : r < 0.2 ? fechaDe(entrada - entero(0, 10))
      : fechaDe(entrada + entero(1, prob(0.2) ? 400 : 120));
    return {
      id: `p${i}`,
      loteId: idDe(lotes.map((l) => l.id), 0.08),
      rodeoId: idDe(rodeos.map((x) => x.id), 0.1),
      cabezas: prob(0.08) ? null : prob(0.2) ? redondo(1, 400, 1) : entero(1, 400),
      entrada: entrada == null ? null : fechaDe(entrada),
      salida,
      categoriaTabla1Id: idDe(idsTabla1, 0.15),
      evManual: prob(0.1) ? redondo(0.3, 2, 3) : null,
    };
  });

  const consumo: Partial<Record<GrupoConsumo, ConsumoGrupo>> | undefined = prob(0.2)
    ? Object.fromEntries(GRUPOS.map((g) => [g, { pesoVivo: entero(150, 750), pct: redondo(1.5, 3, 2) }])) as Record<GrupoConsumo, ConsumoGrupo>
    : undefined;

  let supuestos: Partial<Supuestos> | undefined;
  if (prob(0.2)) {
    supuestos = {};
    if (prob(0.6)) supuestos.gestacion = entero(270, 295);
    if (prob(0.6)) supuestos.fraccionServicio = redondo(0.1, 0.7, 2);
    if (prob(0.6)) supuestos.margenExtrapolacion = entero(0, 100);
    if (prob(0.6)) supuestos.diasPorMes = redondo(29.5, 31, 3);
  }

  return {
    anio: elegir([2025, 2026, 2027]),
    mesServicio: entero(1, 12),
    eficienciaCosecha: prob(0.1) ? elegir([0, -5, 150]) : entero(20, 100),
    lotes, rodeos, pastoreos,
    ...(tabla1 ? { tabla1 } : {}),
    ...(consumo ? { consumo } : {}),
    ...(supuestos ? { supuestos } : {}),
  };
}
