import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTechniciansTables20261016000009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'technicians',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'specialization',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'contact',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
      }),
      true,
    );

    // Many-to-many: a technician serves several producers and a producer can
    // be served by several technicians.
    await queryRunner.createTable(
      new Table({
        name: 'technician_producers',
        columns: [
          {
            name: 'technician_id',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'producer_id',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
          },
        ],
        // The composite primary key (technician_id, producer_id) already
        // indexes lookups by technician.
        indices: [
          {
            name: 'idx_technician_producers_producer',
            columnNames: ['producer_id'],
          },
        ],
        foreignKeys: [
          {
            name: 'fk_technician_producers_technician_id',
            columnNames: ['technician_id'],
            referencedTableName: 'technicians',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'fk_technician_producers_producer_id',
            columnNames: ['producer_id'],
            referencedTableName: 'producers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('technician_producers', true, true, true);
    await queryRunner.dropTable('technicians', true, true, true);
  }
}
