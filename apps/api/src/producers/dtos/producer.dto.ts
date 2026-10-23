import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { ProducerStatus } from '../producer.entity';

export const PRODUCER_STATUSES: ProducerStatus[] = ['active', 'inactive'];

export class CreateProducerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  region: string;

  @IsInt()
  @Min(0)
  rodeoCount: number;

  @IsIn(PRODUCER_STATUSES)
  status: ProducerStatus;

  @IsInt()
  @Min(0)
  totalHeads: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalHa: number;

  /** Average daily weight gain, in kg/day. */
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  avgWeightGain: number;

  @IsOptional()
  @IsDateString()
  lastActivity?: string;
}

export class UpdateProducerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  rodeoCount?: number;

  @IsOptional()
  @IsIn(PRODUCER_STATUSES)
  status?: ProducerStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalHeads?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalHa?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  avgWeightGain?: number;

  @IsOptional()
  @IsDateString()
  lastActivity?: string;
}

export class ListProducersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  region?: string;

  @IsOptional()
  @IsIn(PRODUCER_STATUSES)
  status?: ProducerStatus;
}
