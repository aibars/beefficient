import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../common/transformers/numeric.transformer';

@Entity('prices')
export class Price {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  commodity: string;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: numericTransformer,
  })
  value: number;

  /** Currency or unit of the quote, e.g. `ARS` or `ARS/kg`. */
  @Column({ type: 'varchar', length: 20 })
  currency: string;

  /** Percentage change versus the previous quote. */
  @Column({
    type: 'numeric',
    precision: 7,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  change: number;

  /** When the quote was published by its source. */
  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 255 })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
