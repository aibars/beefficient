/** Fecha calendario en formato ISO `aaaa-mm-dd`, sin hora ni zona. */
export type FechaISO = string;

export interface Lote {
  id: number;
  nombre: string;
  hectareas: number;
}

export interface Rodeo {
  id: string;
  nombre: string;
  categoria: string;
  /** Peso vivo promedio, en kg. */
  pesoVivo: number;
  cabezas: number;
  /** Factor EV de la categoría a 400 kg (tabla de Cocimano). */
  factorEv: number;
  /** Consumo de materia seca, en % del peso vivo. */
  pctPesoVivoMS: number;
}

export interface Pastoreo {
  id: string;
  loteId: number;
  rodeoId: string;
  cabezas: number;
  entrada: FechaISO;
  salida: FechaISO;
  sincronizado: boolean;
}
