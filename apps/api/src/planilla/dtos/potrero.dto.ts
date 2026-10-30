import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

const NOMBRE = { message: 'El nombre del potrero no puede quedar vacío.' };
const NOMBRE_LARGO = { message: 'El nombre del potrero no puede tener más de 100 caracteres.' };
const HA_DECIMALES = { message: 'Las hectáreas tienen que ser un número con hasta 2 decimales.' };
const HA = { message: 'Las hectáreas tienen que estar entre 0,01 y 99.999.999,99.' };

export class CreatePotreroDto {
  @IsString(NOMBRE)
  @IsNotEmpty(NOMBRE)
  @MaxLength(100, NOMBRE_LARGO)
  nombre: string;

  @IsNumber({ maxDecimalPlaces: 2 }, HA_DECIMALES)
  @Min(0.01, HA)
  @Max(99999999.99, HA)
  hectareas: number;
}

export class UpdatePotreroDto {
  @ValidateIf((_, v) => v !== undefined)
  @IsString(NOMBRE)
  @IsNotEmpty(NOMBRE)
  @MaxLength(100, NOMBRE_LARGO)
  nombre?: string;

  @ValidateIf((_, v) => v !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 }, HA_DECIMALES)
  @Min(0.01, HA)
  @Max(99999999.99, HA)
  hectareas?: number;
}
