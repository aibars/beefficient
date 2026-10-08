import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable20261008000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '60',
            isNullable: true,
          },
          {
            name: 'google_id',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'idx_users_email',
            columnNames: ['email'],
          },
          {
            name: 'idx_users_google_id',
            columnNames: ['google_id'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
