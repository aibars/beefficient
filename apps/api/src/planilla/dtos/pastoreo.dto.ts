import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

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
  cabezas?: number | null;

  @IsOptional()
  @IsDateString({ strict: true })
  entrada?: string | null;

  @IsOptional()
  @IsDateString({ strict: true })
  salida?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  categoriaTabla1Id?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  evManual?: number | null;
}

export class UpdatePastoreoDto extends CreatePastoreoDto {}
