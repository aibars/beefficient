import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * The User entity has always declared `refreshTokenVersion`, but the original
 * users migration never created the column, so any real-DB read of a user failed.
 */
export class AddRefreshTokenVersionToUsers20261015000007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'refresh_token_version',
        type: 'integer',
        isNullable: false,
        default: 1,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'refresh_token_version');
  }
}
