import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRodeosTable20261029000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rodeos',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'campana_id', type: 'uuid', isNullable: false },
          { name: 'nombre', type: 'varchar', length: '100', isNullable: false },
          { name: 'categoria', type: 'varchar', length: '40', isNullable: true },
          { name: 'peso_vivo', type: 'numeric', precision: 7, scale: 2, isNullable: true },
          { name: 'ganancia', type: 'jsonb', default: `'[null,null,null,null,null,null,null,null,null,null,null,null]'`, isNullable: false },
          { name: 'inicio_servicio', type: 'date', isNullable: true },
          { name: 'duracion_servicio', type: 'int', default: 90, isNullable: false },
          { name: 'destete', type: 'date', isNullable: true },
          { name: 'usa_cocimano', type: 'boolean', default: true, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        indices: [{ name: 'idx_rodeos_campana_id', columnNames: ['campana_id'] }],
        foreignKeys: [
          { name: 'fk_rodeos_campana_id', columnNames: ['campana_id'], referencedTableName: 'campanas', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rodeos', true, true, true);
  }
}
