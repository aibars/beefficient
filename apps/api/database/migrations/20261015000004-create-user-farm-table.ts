import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserFarmTable20261015000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_farm',
        columns: [
          { name: 'user_id', type: 'uuid', isPrimary: true, isNullable: false },
          { name: 'farm_id', type: 'uuid', isPrimary: true, isNullable: false },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'tecnico'",
          },
          {
            name: 'active',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        // The composite primary key (user_id, farm_id) already enforces uniqueness.
        indices: [
          { name: 'idx_user_farm_active', columnNames: ['user_id', 'active'] },
          { name: 'idx_user_farm_farm', columnNames: ['farm_id'] },
        ],
        foreignKeys: [
          {
            name: 'fk_user_farm_user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'fk_user_farm_farm_id',
            columnNames: ['farm_id'],
            referencedTableName: 'farms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        checks: [
          {
            name: 'chk_user_farm_role',
            expression: "role IN ('admin', 'tecnico')",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_farm', true, true, true);
  }
}
