import { IsArray, IsInt, IsNumber, IsObject, IsOptional, Max, Min, ValidateIf } from 'class-validator';
import type { ConsumoGrupo, FilaTabla1, GrupoConsumo, Supuestos } from '@beefficient/domain';

export class CreateCampanaDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  mesServicio?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100)
  eficienciaCosecha?: number;
}

export class UpdateCampanaDto {
  @ValidateIf((_, v) => v !== undefined)
  @IsInt()
  @Min(1)
  @Max(12)
  mesServicio?: number;

  @ValidateIf((_, v) => v !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100)
  eficienciaCosecha?: number;

  @IsOptional()
  @IsArray()
  tabla1?: FilaTabla1[] | null;

  @IsOptional()
  @IsObject()
  consumo?: Partial<Record<GrupoConsumo, ConsumoGrupo>> | null;

  @IsOptional()
  @IsObject()
  supuestos?: Partial<Supuestos> | null;
}
