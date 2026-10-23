import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../common/transformers/numeric.transformer';
import type { Technician } from '../technicians/technician.entity';

export type ProducerStatus = 'active' | 'inactive';

@Entity('producers')
export class Producer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ name: 'rodeo_count', type: 'integer', default: 0 })
  rodeoCount: number;

  @Column({ name: 'last_activity', type: 'timestamptz', nullable: true })
  lastActivity: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: ProducerStatus;

  @Column({ name: 'total_heads', type: 'integer', default: 0 })
  totalHeads: number;

  @Column({
    name: 'total_ha',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  totalHa: number;

  /** Average daily weight gain, in kg/day. */
  @Column({
    name: 'avg_weight_gain',
    type: 'numeric',
    precision: 6,
    scale: 3,
    default: 0,
    transformer: numericTransformer,
  })
  avgWeightGain: number;

  @ManyToMany('Technician', (technician: Technician) => technician.producers)
  technicians: Technician[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
