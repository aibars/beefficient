import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateBy,
  ValidateIf,
  type ValidationOptions,
} from 'class-validator';
import type { CategoriaRodeo, DuracionServicio } from '@beefficient/domain';

// Copias literales de CATEGORIAS_RODEO / DURACIONES_SERVICIO del dominio: el código de Node
// no puede importar valores de @beefficient/domain (ESM). rodeo.dto.spec.ts las compara.
/** Solo aaaa-mm-dd: Postgres truncaría en silencio un datetime. */
export const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export const CATEGORIAS_RODEO_API: readonly CategoriaRodeo[] = [
  'Vaca',
  'Vaquillona 1er servicio',
  'Vaquillona 2do servicio',
  'Vaquillona de reposición',
  'Toro',
  'Ternero/a recría',
  'Novillito',
  'Novillo',
];
export const DURACIONES_SERVICIO_API: readonly DuracionServicio[] = [60, 75, 90, 105, 120];

/** Cada elemento es un número finito o null. */
function GananciaMensual(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'gananciaMensual',
      validator: {
        validate: (v: unknown) =>
          Array.isArray(v) &&
          v.every((x) => x === null || (typeof x === 'number' && Number.isFinite(x))),
        defaultMessage: () => 'ganancia debe tener números o null.',
      },
    },
    options,
  );
}

export class CreateRodeoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsIn(CATEGORIAS_RODEO_API)
  categoria?: CategoriaRodeo | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999.99)
  pesoVivo?: number | null;

  @ValidateIf((_, v) => v !== undefined)
  @IsArray()
  @ArrayMinSize(12, { message: 'ganancia debe tener 12 valores.' })
  @ArrayMaxSize(12, { message: 'ganancia debe tener 12 valores.' })
  @GananciaMensual()
  ganancia?: (number | null)[];

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(SOLO_FECHA, { message: 'La fecha debe tener formato aaaa-mm-dd.' })
  inicioServicio?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(SOLO_FECHA, { message: 'La fecha debe tener formato aaaa-mm-dd.' })
  destete?: string | null;

  @ValidateIf((_, v) => v !== undefined)
  @IsIn(DURACIONES_SERVICIO_API)
  duracionServicio?: DuracionServicio;

  @ValidateIf((_, v) => v !== undefined)
  @IsBoolean()
  usaCocimano?: boolean;
}

export class UpdateRodeoDto {
  @ValidateIf((_, v) => v !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsIn(CATEGORIAS_RODEO_API)
  categoria?: CategoriaRodeo | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999.99)
  pesoVivo?: number | null;

  @ValidateIf((_, v) => v !== undefined)
  @IsArray()
  @ArrayMinSize(12, { message: 'ganancia debe tener 12 valores.' })
  @ArrayMaxSize(12, { message: 'ganancia debe tener 12 valores.' })
  @GananciaMensual()
  ganancia?: (number | null)[];

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(SOLO_FECHA, { message: 'La fecha debe tener formato aaaa-mm-dd.' })
  inicioServicio?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(SOLO_FECHA, { message: 'La fecha debe tener formato aaaa-mm-dd.' })
  destete?: string | null;

  @ValidateIf((_, v) => v !== undefined)
  @IsIn(DURACIONES_SERVICIO_API)
  duracionServicio?: DuracionServicio;

  @ValidateIf((_, v) => v !== undefined)
  @IsBoolean()
  usaCocimano?: boolean;
}
