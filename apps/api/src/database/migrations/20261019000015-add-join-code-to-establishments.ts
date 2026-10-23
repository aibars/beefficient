import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

/**
 * Adds establishments.join_code (BFC-35): the 6-character code other users
 * enter to join an establishment. Nullable because existing establishments
 * have no code yet; Postgres unique indexes allow many NULLs.
 */
export class AddJoinCodeToEstablishments20261019000015
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'establishments',
      new TableColumn({
        name: 'join_code',
        type: 'varchar',
        length: '6',
        isNullable: true,
      }),
    );
    await queryRunner.createIndex(
      'establishments',
      new TableIndex({
        name: 'uk_establishments_join_code',
        columnNames: ['join_code'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('establishments', 'uk_establishments_join_code');
    await queryRunner.dropColumn('establishments', 'join_code');
  }
}
