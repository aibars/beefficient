import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFarmJoinCodesTable20261015000005
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'farm_join_codes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'farm_id', type: 'uuid', isNullable: false },
          {
            name: 'code',
            type: 'varchar',
            length: '12',
            isNullable: false,
          },
          { name: 'used_by_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'used_at', type: 'timestamp', isNullable: true },
        ],
        uniques: [
          { name: 'uk_farm_join_codes_code', columnNames: ['code'] },
        ],
        indices: [
          { name: 'idx_farm_join_codes_farm', columnNames: ['farm_id'] },
          { name: 'idx_farm_join_codes_code', columnNames: ['code'] },
          { name: 'idx_farm_join_codes_used_at', columnNames: ['used_at'] },
        ],
        foreignKeys: [
          {
            name: 'fk_farm_join_codes_farm_id',
            columnNames: ['farm_id'],
            referencedTableName: 'farms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'fk_farm_join_codes_used_by_id',
            columnNames: ['used_by_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
        checks: [
          {
            name: 'chk_farm_join_codes_used_pair',
            expression:
              '(used_by_id IS NULL AND used_at IS NULL) OR (used_by_id IS NOT NULL AND used_at IS NOT NULL)',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('farm_join_codes', true, true, true);
  }
}
