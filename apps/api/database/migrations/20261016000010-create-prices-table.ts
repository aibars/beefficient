import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePricesTable20261016000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prices',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'commodity',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'numeric',
            precision: 14,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'change',
            type: 'numeric',
            precision: 7,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          { name: 'timestamp', type: 'timestamptz', isNullable: false },
          { name: 'source', type: 'varchar', length: '255', isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'NOW()' },
          { name: 'updated_at', type: 'timestamp', default: 'NOW()' },
        ],
        indices: [
          // Latest quote per commodity.
          {
            name: 'idx_prices_commodity_timestamp',
            columnNames: ['commodity', 'timestamp'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('prices', true, true, true);
  }
}
