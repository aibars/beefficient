import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

/** Display groups used by the web `/precios` page. */
export type PriceCategory = 'ganaderia' | 'granos';

export const PRICE_CATEGORIES: PriceCategory[] = ['ganaderia', 'granos'];

/**
 * Commodities quoted as livestock. Every other commodity falls into `granos`
 * ("Granos y Forrajes"), matching the grouping on the web `/precios` page.
 * Compared case-insensitively.
 */
export const GANADERIA_COMMODITIES = ['ternero', 'novillos'];

export function categoryOf(commodity: string): PriceCategory {
  return GANADERIA_COMMODITIES.includes(commodity.trim().toLowerCase())
    ? 'ganaderia'
    : 'granos';
}

/** Query for `GET /prices`. */
export class ListPricesQueryDto {
  @IsOptional()
  @IsIn(PRICE_CATEGORIES)
  category?: PriceCategory;
}

/** One past quote of a commodity, newest first. */
export class PriceHistoryEntryDto {
  @IsUUID()
  id: string;

  @IsNumber()
  value: number;

  @IsNumber()
  change: number;

  /** Serialized as an ISO-8601 string in JSON. */
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  source: string;
}

/** Price response shape (mirrors the web `Price` type, plus `category`). */
export class PriceDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  commodity: string;

  @IsNumber()
  value: number;

  /** Currency or unit of the quote, e.g. `ARS` or `ARS/kg`. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  currency: string;

  /** Percentage change versus the previous quote. */
  @IsNumber()
  change: number;

  /** Serialized as an ISO-8601 string in JSON. */
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  source: string;

  @IsIn(PRICE_CATEGORIES)
  category: PriceCategory;

  /** Present only on the single-commodity endpoint; older quotes, newest first. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceHistoryEntryDto)
  history?: PriceHistoryEntryDto[];
}
