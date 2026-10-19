import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../companies/companies.entity';

@Entity('users')
@Index(['email'])
@Index(['googleId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 60, nullable: true })
  passwordHash?: string;

  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  googleId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'refresh_token_version', type: 'integer', default: 1 })
  refreshTokenVersion: number;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId?: string | null;

  // SET NULL, not CASCADE: deleting a company must not delete its user.
  @OneToOne(() => Company, { cascade: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'company_id',
    foreignKeyConstraintName: 'fk_users_company_id',
  })
  company?: Company | null;
}
