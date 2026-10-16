import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateKpisTable20261016000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'kpis',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'label', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'value',
            type: 'numeric',
            precision: 14,
            scale: 3,
            isNullable: false,
          },
          { name: 'unit', type: 'varchar', length: '50', isNullable: false },
          {
            name: 'delta',
            type: 'numeric',
            precision: 7,
            scale: 2,
            isNullable: true,
          },
          { name: 'status', type: 'varchar', length: '20', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        checks: [
          {
            name: 'chk_kpis_status',
            expression: "status IS NULL OR status IN ('good', 'warning', 'alert')",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('kpis', true, true, true);
  }
}
