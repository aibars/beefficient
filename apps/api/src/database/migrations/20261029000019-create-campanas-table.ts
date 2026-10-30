import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCampanasTable20261029000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'campanas',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'establishment_id', type: 'uuid', isNullable: false },
          { name: 'anio', type: 'int', isNullable: false },
          { name: 'mes_servicio', type: 'int', default: 1, isNullable: false },
          { name: 'eficiencia_cosecha', type: 'numeric', precision: 5, scale: 2, default: 50, isNullable: false },
          { name: 'tabla1', type: 'jsonb', isNullable: true },
          { name: 'consumo', type: 'jsonb', isNullable: true },
          { name: 'supuestos', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        indices: [
          { name: 'uk_campanas_establishment_anio', columnNames: ['establishment_id', 'anio'], isUnique: true },
        ],
        foreignKeys: [
          { name: 'fk_campanas_establishment_id', columnNames: ['establishment_id'], referencedTableName: 'establishments', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('campanas', true, true, true);
  }
}
