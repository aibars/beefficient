import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePastoreosTable20261029000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pastoreos',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'campana_id', type: 'uuid', isNullable: false },
          { name: 'lote_id', type: 'uuid', isNullable: true },
          { name: 'rodeo_id', type: 'uuid', isNullable: true },
          { name: 'cabezas', type: 'int', isNullable: true },
          { name: 'entrada', type: 'date', isNullable: true },
          { name: 'salida', type: 'date', isNullable: true },
          { name: 'categoria_tabla1_id', type: 'varchar', length: '60', isNullable: true },
          { name: 'ev_manual', type: 'numeric', precision: 6, scale: 3, isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        indices: [{ name: 'idx_pastoreos_campana_id', columnNames: ['campana_id'] }],
        foreignKeys: [
          { name: 'fk_pastoreos_campana_id', columnNames: ['campana_id'], referencedTableName: 'campanas', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
          { name: 'fk_pastoreos_lote_id', columnNames: ['lote_id'], referencedTableName: 'lotes', referencedColumnNames: ['id'], onDelete: 'NO ACTION', deferrable: 'INITIALLY DEFERRED' },
          { name: 'fk_pastoreos_rodeo_id', columnNames: ['rodeo_id'], referencedTableName: 'rodeos', referencedColumnNames: ['id'], onDelete: 'NO ACTION', deferrable: 'INITIALLY DEFERRED' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pastoreos', true, true, true);
  }
}
