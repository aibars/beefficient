import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Producer } from './producer.entity';
import {
  CreateProducerDto,
  ListProducersQueryDto,
  UpdateProducerDto,
} from './dtos/producer.dto';

export interface PaginatedProducers {
  data: Producer[];
  meta: { total: number; page: number; limit: number };
}

@Injectable()
export class ProducersService {
  constructor(
    @InjectRepository(Producer)
    private readonly producersRepository: Repository<Producer>,
  ) {}

  async findAll(query: ListProducersQueryDto): Promise<PaginatedProducers> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: FindOptionsWhere<Producer> = {};
    if (query.region) where.region = query.region;
    if (query.status) where.status = query.status;

    const [data, total] = await this.producersRepository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<Producer> {
    const producer = await this.producersRepository.findOne({
      where: { id },
      relations: { technicians: true },
    });
    if (!producer) {
      throw new NotFoundException(`Producer ${id} not found`);
    }
    return producer;
  }

  async create(dto: CreateProducerDto): Promise<Producer> {
    const producer = this.producersRepository.create({
      ...dto,
      lastActivity: dto.lastActivity ? new Date(dto.lastActivity) : null,
    });
    return this.producersRepository.save(producer);
  }

  async update(id: string, dto: UpdateProducerDto): Promise<Producer> {
    const producer = await this.producersRepository.findOne({ where: { id } });
    if (!producer) {
      throw new NotFoundException(`Producer ${id} not found`);
    }

    const { lastActivity, ...rest } = dto;
    Object.assign(producer, rest);
    if (lastActivity !== undefined) {
      producer.lastActivity = new Date(lastActivity);
    }

    return this.producersRepository.save(producer);
  }
}
