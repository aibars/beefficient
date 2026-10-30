import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Establishment } from '../../establishments/establishments.entity';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { PotreroEntity } from './potrero.entity';

@Entity('lotes')
export class LoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'establishment_id', type: 'uuid' })
  establecimientoId: string;

  @ManyToOne(() => Establishment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'establishment_id', foreignKeyConstraintName: 'fk_lotes_establishment_id' })
  establecimiento: Establishment;

  @Column({ name: 'potrero_id', type: 'uuid', nullable: true })
  potreroId: string | null;

  @ManyToOne(() => PotreroEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'potrero_id', foreignKeyConstraintName: 'fk_lotes_potrero_id' })
  potrero: PotreroEntity | null;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true, transformer: numericTransformer })
  hectareas: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
