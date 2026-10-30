import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { CampanaEntity } from './campana.entity';
import { LoteEntity } from './lote.entity';
import { RodeoEntity } from './rodeo.entity';

@Entity('pastoreos')
export class PastoreoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campana_id', type: 'uuid' })
  campanaId: string;

  @ManyToOne(() => CampanaEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campana_id', foreignKeyConstraintName: 'fk_pastoreos_campana_id' })
  campana: CampanaEntity;

  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  loteId: string | null;

  @ManyToOne(() => LoteEntity, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'lote_id', foreignKeyConstraintName: 'fk_pastoreos_lote_id' })
  lote: LoteEntity | null;

  @Column({ name: 'rodeo_id', type: 'uuid', nullable: true })
  rodeoId: string | null;

  @ManyToOne(() => RodeoEntity, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'rodeo_id', foreignKeyConstraintName: 'fk_pastoreos_rodeo_id' })
  rodeo: RodeoEntity | null;

  @Column({ type: 'int', nullable: true })
  cabezas: number | null;

  @Column({ type: 'date', nullable: true })
  entrada: string | null;

  @Column({ type: 'date', nullable: true })
  salida: string | null;

  @Column({ name: 'categoria_tabla1_id', type: 'varchar', length: 60, nullable: true })
  categoriaTabla1Id: string | null;

  @Column({ name: 'ev_manual', type: 'numeric', precision: 6, scale: 3, nullable: true, transformer: numericTransformer })
  evManual: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
