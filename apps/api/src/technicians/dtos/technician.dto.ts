import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { ProducerStatus } from '../../producers/producer.entity';
import { PRODUCER_STATUSES } from '../../producers/dtos/producer.dto';

/** Producer as nested inside a technician response. */
export class TechnicianProducerDto {
  @IsUUID()
  id: string;

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

  @IsNumber()
  @Min(0)
  totalHa: number;

  /** Average daily weight gain, in kg/day. */
  @IsNumber()
  @Min(0)
  avgWeightGain: number;
}

/** Technician response shape (mirrors the web `Technician` type). */
export class TechnicianDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specialization: string;

  /** Contact e-mail (or phone) shown to producers. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contact: string;

  @IsArray()
  @IsUUID('all', { each: true })
  producerIds: string[];

  /** Present only on the single-technician endpoint. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnicianProducerDto)
  producers?: TechnicianProducerDto[];
}
