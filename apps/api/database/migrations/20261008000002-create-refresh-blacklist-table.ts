import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRefreshBlacklistTable20261008000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_token_blacklist',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'token_version',
            type: 'int',
            default: 1,
          },
          {
            name: 'revoked_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'idx_refresh_blacklist_user_version',
            columnNames: ['user_id', 'token_version'],
          },
        ],
      }),
    );

    // Add foreign key constraint for user_id -> users(id) with CASCADE on delete
    await queryRunner.createForeignKey(
      'refresh_token_blacklist',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('refresh_token_blacklist');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('refresh_token_blacklist', foreignKey);
    }
    await queryRunner.dropTable('refresh_token_blacklist');
  }
}
