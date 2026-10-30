import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Establishment } from '../../establishments/establishments.entity';
import { numericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('potreros')
export class PotreroEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'establishment_id', type: 'uuid' })
  establecimientoId: string;

  @ManyToOne(() => Establishment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'establishment_id', foreignKeyConstraintName: 'fk_potreros_establishment_id' })
  establecimiento: Establishment;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  hectareas: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
