// Formulador de dietas: misma lógica y coeficientes que el prototipo 29/7 (FORM_BASE).
// Valores orientativos (base NRC), a validar con Gastón Alfaro y Federico Podversich.

export type Etapa = 'recria' | 'engorde' | 'cria';
export type Clima = 'frio' | 'templado' | 'calido';

export interface Ingrediente {
  ingrediente: string;
  /** % de la materia seca de la ración. */
  porcentaje: number;
}

export interface BaseEtapa {
  label: string;
  /** Ganancia diaria de peso objetivo, kg/día. */
  gdp: number;
  /** Consumo de MS, % del peso vivo. */
  msPct: number;
  /** Mcal EM por kg de MS. */
  em: number;
  /** Proteína bruta, % de la MS. */
  pb: number;
  /** Calcio, % de la MS. */
  ca: number;
  /** Fósforo, % de la MS. */
  p: number;
  racion: Ingrediente[];
}

const racion = (...items: [string, number][]): Ingrediente[] =>
  items.map(([ingrediente, porcentaje]) => ({ ingrediente, porcentaje }));

export const FORM_BASE: Record<Etapa, BaseEtapa> = {
  recria: {
    label: 'Recría', gdp: 0.7, msPct: 2.6, em: 2.5, pb: 13, ca: 0.42, p: 0.28,
    racion: racion(['Forraje / pastura', 55], ['Silaje de maíz', 20], ['Grano de maíz', 18], ['Núcleo proteico', 7]),
  },
  engorde: {
    label: 'Engorde a corral', gdp: 1.2, msPct: 2.35, em: 2.9, pb: 12, ca: 0.55, p: 0.3,
    racion: racion(['Grano de maíz', 52], ['Silaje de maíz', 22], ['Forraje / heno', 18], ['Núcleo proteico', 8]),
  },
  cria: {
    label: 'Vaca de cría', gdp: 0, msPct: 2, em: 2.05, pb: 9, ca: 0.32, p: 0.24,
    racion: racion(['Forraje / pastura', 82], ['Silaje de maíz', 10], ['Núcleo proteico', 5], ['Grano de maíz', 3]),
  },
};

export const CLIMA: Record<Clima, { label: string; factor: number }> = {
  frio: { label: 'Frío', factor: 1.08 },
  templado: { label: 'Templado', factor: 1 },
  calido: { label: 'Cálido', factor: 0.93 },
};

export interface Requerimientos {
  /** kg MS/día. */
  consumoMS: number;
  /** Mcal EM/día. */
  energia: number;
  /** kg PB/día. */
  proteina: number;
  /** g/día. */
  calcio: number;
  /** g/día. */
  fosforo: number;
  /** kg/día. */
  gdp: number;
}

export function calcularRequerimientos(e: { etapa: Etapa; pesoVivo: number; clima: Clima }): Requerimientos {
  const b = FORM_BASE[e.etapa];
  const consumoMS = ((e.pesoVivo * b.msPct) / 100) * CLIMA[e.clima].factor;
  return {
    consumoMS,
    energia: consumoMS * b.em,
    proteina: (consumoMS * b.pb) / 100,
    // % de la MS → g: kg × % / 100 × 1000
    calcio: consumoMS * b.ca * 10,
    fosforo: consumoMS * b.p * 10,
    gdp: b.gdp,
  };
}

export function racionSugerida(etapa: Etapa, consumoMS: number): (Ingrediente & { kgMS: number })[] {
  return FORM_BASE[etapa].racion.map((i) => ({ ...i, kgMS: (consumoMS * i.porcentaje) / 100 }));
}

export function totalRodeo(r: Requerimientos, cabezas: number): Omit<Requerimientos, 'gdp'> {
  return {
    consumoMS: r.consumoMS * cabezas,
    energia: r.energia * cabezas,
    proteina: r.proteina * cabezas,
    calcio: r.calcio * cabezas,
    fosforo: r.fosforo * cabezas,
  };
}

/** Etapa productiva que el formulador propone para la categoría de un rodeo. */
export const etapaDeCategoria = (categoria: string): Etapa => (categoria.startsWith('Vaca') ? 'cria' : 'recria');
