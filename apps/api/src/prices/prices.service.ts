import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from './price.entity';
import {
  PRICE_CATEGORIES,
  PriceCategory,
  PriceDto,
  PriceHistoryEntryDto,
  categoryOf,
} from './dtos/price.dto';

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(Price)
    private readonly pricesRepository: Repository<Price>,
  ) {}

  /**
   * Latest quote per commodity, grouped by category (ganadería first, then
   * granos) and ordered by commodity within each group.
   */
  async findAll(category?: PriceCategory): Promise<PriceDto[]> {
    const rows = await this.pricesRepository.find({
      order: { commodity: 'ASC', timestamp: 'DESC' },
    });

    const latest = new Map<string, Price>();
    for (const row of rows) {
      const key = row.commodity.toLowerCase();
      if (!latest.has(key)) latest.set(key, row);
    }

    return [...latest.values()]
      .map((price) => this.toDto(price))
      .filter((dto) => !category || dto.category === category)
      .sort(
        (a, b) =>
          PRICE_CATEGORIES.indexOf(a.category) -
            PRICE_CATEGORIES.indexOf(b.category) ||
          a.commodity.localeCompare(b.commodity, 'es'),
      );
  }

  /** Latest quote of one commodity (case-insensitive) with older quotes as `history`. */
  async findByCommodity(commodity: string): Promise<PriceDto> {
    const quotes = await this.pricesRepository
      .createQueryBuilder('price')
      .where('LOWER(price.commodity) = LOWER(:commodity)', {
        commodity: commodity.trim(),
      })
      .orderBy('price.timestamp', 'DESC')
      .getMany();

    if (quotes.length === 0) {
      throw new NotFoundException(`Price for commodity ${commodity} not found`);
    }

    const [current, ...older] = quotes;
    return {
      ...this.toDto(current),
      history: older.map(
        (q): PriceHistoryEntryDto => ({
          id: q.id,
          value: q.value,
          change: q.change,
          timestamp: q.timestamp,
          source: q.source,
        }),
      ),
    };
  }

  private toDto(price: Price): PriceDto {
    return {
      id: price.id,
      commodity: price.commodity,
      value: price.value,
      currency: price.currency,
      change: price.change,
      timestamp: price.timestamp,
      source: price.source,
      category: categoryOf(price.commodity),
    };
  }
}
