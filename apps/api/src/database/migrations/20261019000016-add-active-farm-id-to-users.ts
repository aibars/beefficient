import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

/**
 * Adds users.active_farm_id (BFC-35): the establishment the user is working
 * in. Nullable because a user may belong to no establishment yet.
 *
 * ON DELETE SET NULL: deleting an establishment clears it as its members'
 * active farm instead of blocking the delete or deleting the users.
 *
 * Backfills from user_farm.active, which held this state before the column
 * existed, so users keep the farm they had active.
 */
export class AddActiveFarmIdToUsers20261019000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'active_farm_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'fk_users_active_farm_id',
        columnNames: ['active_farm_id'],
        referencedTableName: 'establishments',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    // DISTINCT ON guards against legacy data with several active rows.
    await queryRunner.query(`
      UPDATE users u
      SET active_farm_id = uf.farm_id
      FROM (
        SELECT DISTINCT ON (user_id) user_id, farm_id
        FROM user_farm
        WHERE active = true
        ORDER BY user_id, updated_at DESC
      ) uf
      WHERE u.id = uf.user_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'fk_users_active_farm_id');
    await queryRunner.dropColumn('users', 'active_farm_id');
  }
}
