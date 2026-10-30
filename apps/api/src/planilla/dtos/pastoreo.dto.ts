import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SoloFecha } from './fecha';

const CABEZAS = { message: 'Cabezas tiene que ser un número entero mayor que 0.' };
const CABEZAS_MAX = { message: 'Cabezas no puede ser mayor que 2.147.483.647.' };
const CATEGORIA = { message: 'La categoría de la Tabla 1 no es válida.' };
const EV_DECIMALES = { message: 'El EV manual tiene que ser un número con hasta 3 decimales.' };
const EV = { message: 'El EV manual tiene que estar entre 0,001 y 999,999.' };

export class CreatePastoreoDto {
  @IsOptional()
  @IsUUID(undefined, { message: 'El lote no es válido.' })
  loteId?: string | null;

  @IsOptional()
  @IsUUID(undefined, { message: 'El rodeo no es válido.' })
  rodeoId?: string | null;

  @IsOptional()
  @IsInt(CABEZAS)
  @Min(1, CABEZAS)
  @Max(2147483647, CABEZAS_MAX)
  cabezas?: number | null;

  @IsOptional()
  @SoloFecha('La fecha de entrada no es válida (aaaa-mm-dd).')
  entrada?: string | null;

  @IsOptional()
  @SoloFecha('La fecha de salida no es válida (aaaa-mm-dd).')
  salida?: string | null;

  @IsOptional()
  @IsString(CATEGORIA)
  @MaxLength(60, CATEGORIA)
  categoriaTabla1Id?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 }, EV_DECIMALES)
  @Min(0.001, EV)
  @Max(999.999, EV)
  evManual?: number | null;
}

export class UpdatePastoreoDto extends CreatePastoreoDto {}
