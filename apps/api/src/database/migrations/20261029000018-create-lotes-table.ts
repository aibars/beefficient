import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLotesTable20261029000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lotes',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'establishment_id', type: 'uuid', isNullable: false },
          { name: 'potrero_id', type: 'uuid', isNullable: true },
          { name: 'nombre', type: 'varchar', length: '100', isNullable: false },
          { name: 'hectareas', type: 'numeric', precision: 10, scale: 2, isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        indices: [
          { name: 'uk_lotes_establishment_nombre', columnNames: ['establishment_id', 'nombre'], isUnique: true },
          { name: 'idx_lotes_potrero_id', columnNames: ['potrero_id'] },
        ],
        foreignKeys: [
          { name: 'fk_lotes_establishment_id', columnNames: ['establishment_id'], referencedTableName: 'establishments', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
          { name: 'fk_lotes_potrero_id', columnNames: ['potrero_id'], referencedTableName: 'potreros', referencedColumnNames: ['id'], onDelete: 'SET NULL' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lotes', true, true, true);
  }
}
