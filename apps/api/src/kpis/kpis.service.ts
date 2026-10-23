import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kpi, KpiStatus } from './kpi.entity';

/** Drops below this percentage (versus the previous period) count as an alert. */
const ALERT_DELTA_THRESHOLD = -5;

@Injectable()
export class KpisService {
  constructor(
    @InjectRepository(Kpi)
    private readonly kpisRepository: Repository<Kpi>,
  ) {}

  /** All KPIs, in creation order, each with a resolved `status`. */
  async findAll(): Promise<Kpi[]> {
    const kpis = await this.kpisRepository.find({
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    return kpis.map((kpi) => this.withStatus(kpi));
  }

  /** One KPI with a resolved `status`. */
  async findOne(id: string): Promise<Kpi> {
    const kpi = await this.kpisRepository.findOne({ where: { id } });
    if (!kpi) {
      throw new NotFoundException(`KPI ${id} not found`);
    }
    return this.withStatus(kpi);
  }

  /**
   * A stored status always wins: whether a delta is good depends on the KPI
   * (a drop in dry-matter intake can be fine). Only when none is stored is it
   * derived from the delta.
   */
  static resolveStatus(
    status: KpiStatus | null,
    delta: number | null,
  ): KpiStatus | null {
    if (status) return status;
    if (delta === null || delta === undefined) return null;
    if (delta >= 0) return 'good';
    return delta > ALERT_DELTA_THRESHOLD ? 'warning' : 'alert';
  }

  private withStatus(kpi: Kpi): Kpi {
    kpi.status = KpisService.resolveStatus(kpi.status, kpi.delta);
    return kpi;
  }
}
