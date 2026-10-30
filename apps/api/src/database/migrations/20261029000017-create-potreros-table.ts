import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePotrerosTable20261029000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'potreros',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'establishment_id', type: 'uuid', isNullable: false },
          { name: 'nombre', type: 'varchar', length: '100', isNullable: false },
          { name: 'hectareas', type: 'numeric', precision: 10, scale: 2, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        uniques: [
          { name: 'uk_potreros_establishment_nombre', columnNames: ['establishment_id', 'nombre'] },
        ],
        foreignKeys: [
          { name: 'fk_potreros_establishment_id', columnNames: ['establishment_id'], referencedTableName: 'establishments', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('potreros', true, true, true);
  }
}
