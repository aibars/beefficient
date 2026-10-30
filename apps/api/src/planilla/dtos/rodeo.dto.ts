import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateBy,
  ValidateIf,
  type ValidationOptions,
} from 'class-validator';
import type { CategoriaRodeo, DuracionServicio } from '@beefficient/domain';
import { SoloFecha } from './fecha';

// Copias literales de CATEGORIAS_RODEO / DURACIONES_SERVICIO del dominio: el código de Node
// no puede importar valores de @beefficient/domain (ESM). rodeo.dto.spec.ts las compara.
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

const NOMBRE = { message: 'El nombre del rodeo no puede quedar vacío.' };
const NOMBRE_LARGO = { message: 'El nombre del rodeo no puede tener más de 100 caracteres.' };
const CATEGORIA = { message: 'La categoría no es válida.' };
const PV_DECIMALES = { message: 'El peso vivo tiene que ser un número con hasta 2 decimales.' };
const PV = { message: 'El peso vivo tiene que estar entre 0,01 y 99.999,99 kg.' };
const GANANCIA = { message: 'La ganancia por mes tiene que tener 12 valores.' };
const INICIO = 'La fecha de inicio del servicio no es válida (aaaa-mm-dd).';
const DESTETE = 'La fecha de destete no es válida (aaaa-mm-dd).';
const DURACION = { message: 'La duración del servicio tiene que ser de 60, 75, 90, 105 o 120 días.' };
const COCIMANO = { message: 'Cocimano tiene que ser sí o no.' };

/** Cada elemento es un número finito o null. */
function GananciaMensual(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'gananciaMensual',
      validator: {
        validate: (v: unknown) =>
          Array.isArray(v) &&
          v.every((x) => x === null || (typeof x === 'number' && Number.isFinite(x))),
        defaultMessage: () => 'La ganancia por mes tiene que tener números o quedar vacía.',
      },
    },
    options,
  );
}

export class CreateRodeoDto {
  @IsString(NOMBRE)
  @IsNotEmpty(NOMBRE)
  @MaxLength(100, NOMBRE_LARGO)
  nombre: string;

  @IsOptional()
  @IsIn(CATEGORIAS_RODEO_API, CATEGORIA)
  categoria?: CategoriaRodeo | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, PV_DECIMALES)
  @Min(0.01, PV)
  @Max(99999.99, PV)
  pesoVivo?: number | null;

  @ValidateIf((_, v) => v !== undefined)
  @IsArray(GANANCIA)
  @ArrayMinSize(12, GANANCIA)
  @ArrayMaxSize(12, GANANCIA)
  @GananciaMensual()
  ganancia?: (number | null)[];

  @IsOptional()
  @SoloFecha(INICIO)
  inicioServicio?: string | null;

  @IsOptional()
  @SoloFecha(DESTETE)
  destete?: string | null;

  @ValidateIf((_, v) => v !== undefined)
  @IsIn(DURACIONES_SERVICIO_API, DURACION)
  duracionServicio?: DuracionServicio;

  @ValidateIf((_, v) => v !== undefined)
  @IsBoolean(COCIMANO)
  usaCocimano?: boolean;
}

export class UpdateRodeoDto {
  @ValidateIf((_, v) => v !== undefined)
  @IsString(NOMBRE)
  @IsNotEmpty(NOMBRE)
  @MaxLength(100, NOMBRE_LARGO)
  nombre?: string;

  @IsOptional()
  @IsIn(CATEGORIAS_RODEO_API, CATEGORIA)
  categoria?: CategoriaRodeo | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, PV_DECIMALES)
  @Min(0.01, PV)
  @Max(99999.99, PV)
  pesoVivo?: number | null;

  @ValidateIf((_, v) => v !== undefined)
  @IsArray(GANANCIA)
  @ArrayMinSize(12, GANANCIA)
  @ArrayMaxSize(12, GANANCIA)
  @GananciaMensual()
  ganancia?: (number | null)[];

  @IsOptional()
  @SoloFecha(INICIO)
  inicioServicio?: string | null;

  @IsOptional()
  @SoloFecha(DESTETE)
  destete?: string | null;

  @ValidateIf((_, v) => v !== undefined)
  @IsIn(DURACIONES_SERVICIO_API, DURACION)
  duracionServicio?: DuracionServicio;

  @ValidateIf((_, v) => v !== undefined)
  @IsBoolean(COCIMANO)
  usaCocimano?: boolean;
}
