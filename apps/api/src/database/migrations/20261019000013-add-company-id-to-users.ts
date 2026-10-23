import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

/**
 * Nullable for now: existing users have no company yet. Task 4 (farm creation)
 * is what attaches a company to a user. Unique because User↔Company is 1:1
 * (the entity declares @OneToOne).
 *
 * ON DELETE SET NULL (not CASCADE): deleting a company must never delete the
 * user that points at it. Deleting the user already removes the company via
 * fk_companies_owner_id.
 */
export class AddCompanyIdToUsers20261019000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({ name: 'company_id', type: 'uuid', isNullable: true }),
    );
    await queryRunner.createUniqueConstraint(
      'users',
      new TableUnique({
        name: 'uk_users_company_id',
        columnNames: ['company_id'],
      }),
    );
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'fk_users_company_id',
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'fk_users_company_id');
    await queryRunner.dropUniqueConstraint('users', 'uk_users_company_id');
    await queryRunner.dropColumn('users', 'company_id');
  }
}
