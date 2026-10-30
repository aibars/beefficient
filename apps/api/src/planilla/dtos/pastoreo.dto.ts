import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SOLO_FECHA } from './rodeo.dto';

export class CreatePastoreoDto {
  @IsOptional()
  @IsUUID()
  loteId?: string | null;

  @IsOptional()
  @IsUUID()
  rodeoId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  cabezas?: number | null;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(SOLO_FECHA, { message: 'La fecha debe tener formato aaaa-mm-dd.' })
  entrada?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(SOLO_FECHA, { message: 'La fecha debe tener formato aaaa-mm-dd.' })
  salida?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  categoriaTabla1Id?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(999.999)
  evManual?: number | null;
}

export class UpdatePastoreoDto extends CreatePastoreoDto {}
