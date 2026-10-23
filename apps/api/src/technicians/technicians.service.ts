import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technician } from './technician.entity';
import { Producer } from '../producers/producer.entity';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(Technician)
    private readonly techniciansRepository: Repository<Technician>,
    @InjectRepository(Producer)
    private readonly producersRepository: Repository<Producer>,
  ) {}

  /** All technicians, ordered by name. Each carries `producerIds`. */
  async findAll(): Promise<Technician[]> {
    return this.techniciansRepository.find({ order: { name: 'ASC' } });
  }

  /** One technician with its assigned producers loaded. */
  async findOne(id: string): Promise<Technician> {
    const technician = await this.techniciansRepository.findOne({
      where: { id },
      relations: { producers: true },
      order: { producers: { name: 'ASC' } },
    });
    if (!technician) {
      throw new NotFoundException(`Technician ${id} not found`);
    }
    return technician;
  }

  /** Producers assigned to a technician, ordered by name. */
  async getProducers(id: string): Promise<Producer[]> {
    const exists = await this.techniciansRepository.exist({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Technician ${id} not found`);
    }
    return this.producersRepository.find({
      where: { technicians: { id } },
      order: { name: 'ASC' },
    });
  }
}
