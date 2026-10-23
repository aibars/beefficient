import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFarmsTable20261015000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'farms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'provincia',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          { name: 'owner_id', type: 'uuid', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        indices: [{ name: 'idx_farms_owner_id', columnNames: ['owner_id'] }],
        foreignKeys: [
          {
            name: 'fk_farms_owner_id',
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
    await queryRunner.dropTable('farms', true, true, true);
  }
}
