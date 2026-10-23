import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Producer } from '../producers/producer.entity';

@Entity('technicians')
export class Technician {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  specialization: string;

  /** Contact e-mail (or phone) shown to producers. */
  @Column({ type: 'varchar', length: 255 })
  contact: string;

  @ManyToMany(() => Producer, (producer) => producer.technicians)
  @JoinTable({
    name: 'technician_producers',
    joinColumn: { name: 'technician_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'producer_id', referencedColumnName: 'id' },
  })
  producers: Producer[];

  /** Ids of the producers this technician serves (mirrors the web `producerIds`). */
  @RelationId((technician: Technician) => technician.producers)
  producerIds: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
