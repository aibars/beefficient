import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProducersTable20261016000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ifNotExist = true: re-running against a database that already has the
    // table is a no-op.
    await queryRunner.createTable(
      new Table({
        name: 'producers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'region', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'rodeo_count',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          { name: 'last_activity', type: 'timestamptz', isNullable: true },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'active'",
          },
          {
            name: 'total_heads',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'total_ha',
            type: 'numeric',
            precision: 12,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'avg_weight_gain',
            type: 'numeric',
            precision: 6,
            scale: 3,
            isNullable: false,
            default: 0,
          },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        indices: [
          { name: 'idx_producers_region', columnNames: ['region'] },
          { name: 'idx_producers_status', columnNames: ['status'] },
        ],
        checks: [
          {
            name: 'chk_producers_status',
            expression: "status IN ('active', 'inactive')",
          },
          {
            name: 'chk_producers_non_negative',
            expression:
              'rodeo_count >= 0 AND total_heads >= 0 AND total_ha >= 0',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('producers', true, true, true);
  }
}
