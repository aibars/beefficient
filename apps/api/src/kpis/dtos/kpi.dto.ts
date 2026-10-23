import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { KpiStatus } from '../kpi.entity';

export const KPI_STATUSES: readonly KpiStatus[] = ['good', 'warning', 'alert'];

/** KPI response shape (mirrors the web `Kpi` type). */
export class KpiDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label: string;

  @IsNumber()
  value: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit: string;

  /** Percentage change versus the previous period. */
  @IsOptional()
  @IsNumber()
  delta: number | null;

  @IsOptional()
  @IsIn(KPI_STATUSES)
  status: KpiStatus | null;
}
