import { IsArray, IsInt, IsNumber, IsObject, IsOptional, Max, Min, ValidateIf } from 'class-validator';
import type { ConsumoGrupo, FilaTabla1, GrupoConsumo, Supuestos } from '@beefficient/domain';

const ANIO = { message: 'El año tiene que ser un número entero entre 2000 y 2100.' };
const MES = { message: 'El mes de servicio tiene que estar entre 1 y 12.' };
const EFICIENCIA_DECIMALES = {
  message: 'La eficiencia de cosecha tiene que ser un número con hasta 2 decimales.',
};
const EFICIENCIA = { message: 'La eficiencia de cosecha tiene que estar entre 1 y 100.' };

export class CreateCampanaDto {
  @IsInt(ANIO)
  @Min(2000, ANIO)
  @Max(2100, ANIO)
  anio: number;

  @IsOptional()
  @IsInt(MES)
  @Min(1, MES)
  @Max(12, MES)
  mesServicio?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, EFICIENCIA_DECIMALES)
  @Min(1, EFICIENCIA)
  @Max(100, EFICIENCIA)
  eficienciaCosecha?: number;
}

export class UpdateCampanaDto {
  @ValidateIf((_, v) => v !== undefined)
  @IsInt(MES)
  @Min(1, MES)
  @Max(12, MES)
  mesServicio?: number;

  @ValidateIf((_, v) => v !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 }, EFICIENCIA_DECIMALES)
  @Min(1, EFICIENCIA)
  @Max(100, EFICIENCIA)
  eficienciaCosecha?: number;

  @IsOptional()
  @IsArray({ message: 'La Tabla 1 tiene que ser una lista.' })
  tabla1?: FilaTabla1[] | null;

  @IsOptional()
  @IsObject({ message: 'El consumo no es válido.' })
  consumo?: Partial<Record<GrupoConsumo, ConsumoGrupo>> | null;

  @IsOptional()
  @IsObject({ message: 'Los supuestos no son válidos.' })
  supuestos?: Partial<Supuestos> | null;
}
