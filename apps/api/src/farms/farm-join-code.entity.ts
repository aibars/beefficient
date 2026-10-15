import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Farm } from './farms.entity';

@Entity('farm_join_codes')
export class FarmJoinCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'farm_id', type: 'uuid' })
  farmId: string;

  @Column({ type: 'varchar', length: 12, unique: true })
  code: string;

  @Column({ name: 'used_by_id', type: 'uuid', nullable: true })
  usedById: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'used_by_id' })
  usedBy: User | null;
}
