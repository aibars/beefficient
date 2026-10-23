import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCompaniesTable20261019000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'owner_id', type: 'uuid', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        indices: [
          { name: 'idx_companies_owner_id', columnNames: ['owner_id'] },
        ],
        foreignKeys: [
          {
            name: 'fk_companies_owner_id',
            columnNames: ['owner_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('companies', true, true, true);
  }
}
