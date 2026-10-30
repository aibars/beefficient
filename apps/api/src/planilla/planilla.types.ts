import type {
  Campana,
  LoteCampana,
  PastoreoCampana,
  RodeoCampana,
} from '@beefficient/domain';

export interface PotreroDto {
  id: string;
  nombre: string;
  hectareas: number;
}
export interface LoteDto extends LoteCampana {
  potreroId: string | null;
}
export interface CampanaResumenDto {
  id: string;
  anio: number;
  mesServicio: number;
  eficienciaCosecha: number;
}
export interface CampanaCompletaDto extends Campana {
  id: string;
}
export type RodeoDto = RodeoCampana;
export type PastoreoDto = PastoreoCampana;
