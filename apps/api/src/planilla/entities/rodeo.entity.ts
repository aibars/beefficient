import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { CategoriaRodeo, DuracionServicio } from '@beefficient/domain';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { CampanaEntity } from './campana.entity';

@Entity('rodeos')
export class RodeoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campana_id', type: 'uuid' })
  campanaId: string;

  @ManyToOne(() => CampanaEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campana_id', foreignKeyConstraintName: 'fk_rodeos_campana_id' })
  campana: CampanaEntity;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  categoria: CategoriaRodeo | null;

  @Column({ name: 'peso_vivo', type: 'numeric', precision: 7, scale: 2, nullable: true, transformer: numericTransformer })
  pesoVivo: number | null;

  /** 12 valores, enero a diciembre; null = 0. */
  @Column({ type: 'jsonb', default: '[null, null, null, null, null, null, null, null, null, null, null, null]' })
  ganancia: (number | null)[];

  @Column({ name: 'inicio_servicio', type: 'date', nullable: true })
  inicioServicio: string | null;

  @Column({ name: 'duracion_servicio', type: 'int', default: 90 })
  duracionServicio: DuracionServicio;

  @Column({ type: 'date', nullable: true })
  destete: string | null;

  @Column({ name: 'usa_cocimano', type: 'boolean', default: true })
  usaCocimano: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
