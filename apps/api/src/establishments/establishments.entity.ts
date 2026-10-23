import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Company } from '../companies/companies.entity';

/**
 * Formerly `Farm` (table `farms`). Belongs to a Company, not directly to a
 * User. The HTTP API still says "farm" (`/auth/farm/*`, `farm_id`) for
 * stability; only the domain model was renamed.
 */
@Entity('establishments')
export class Establishment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_establishments_company_id')
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'company_id',
    foreignKeyConstraintName: 'fk_establishments_company_id',
  })
  company: Company;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  provincia: string;

  /**
   * 6-character code other users enter to join this establishment. Nullable
   * until one is generated. Uniqueness comes from the unique index (not
   * `unique: true` on the column, which would make TypeORM expect a separate
   * UQ_ constraint that migration 20261019000015 does not create).
   */
  @Index('uk_establishments_join_code', { unique: true })
  @Column({ name: 'join_code', type: 'varchar', length: 6, nullable: true })
  joinCode?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
