import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../common/transformers/numeric.transformer';

export type KpiStatus = 'good' | 'warning' | 'alert';

@Entity('kpis')
export class Kpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 3,
    transformer: numericTransformer,
  })
  value: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  /** Percentage change versus the previous period. */
  @Column({
    type: 'numeric',
    precision: 7,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  delta: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: KpiStatus | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
