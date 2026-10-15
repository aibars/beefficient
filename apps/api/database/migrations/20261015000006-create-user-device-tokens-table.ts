import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserDeviceTokensTable20261015000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_device_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          {
            name: 'device_token',
            type: 'varchar',
            length: '1024',
            isNullable: false,
          },
          {
            name: 'platform',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
        ],
        uniques: [
          {
            name: 'uk_user_device_tokens_user_token',
            columnNames: ['user_id', 'device_token'],
          },
        ],
        indices: [
          { name: 'idx_user_device_tokens_user', columnNames: ['user_id'] },
        ],
        foreignKeys: [
          {
            name: 'fk_user_device_tokens_user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        checks: [
          {
            name: 'chk_user_device_tokens_platform',
            expression: "platform IN ('ios', 'android')",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_device_tokens', true, true, true);
  }
}
