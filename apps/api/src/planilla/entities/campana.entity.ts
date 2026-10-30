import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import type { ConsumoGrupo, FilaTabla1, GrupoConsumo, Supuestos } from '@beefficient/domain';
import { Establishment } from '../../establishments/establishments.entity';
import { numericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('campanas')
export class CampanaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'establishment_id', type: 'uuid' })
  establecimientoId: string;

  @ManyToOne(() => Establishment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'establishment_id', foreignKeyConstraintName: 'fk_campanas_establishment_id' })
  establecimiento: Establishment;

  @Column({ type: 'int' })
  anio: number;

  @Column({ name: 'mes_servicio', type: 'int', default: 1 })
  mesServicio: number;

  @Column({ name: 'eficiencia_cosecha', type: 'numeric', precision: 5, scale: 2, default: 50, transformer: numericTransformer })
  eficienciaCosecha: number;

  @Column({ type: 'jsonb', nullable: true })
  tabla1: FilaTabla1[] | null;

  @Column({ type: 'jsonb', nullable: true })
  consumo: Partial<Record<GrupoConsumo, ConsumoGrupo>> | null;

  @Column({ type: 'jsonb', nullable: true })
  supuestos: Partial<Supuestos> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
