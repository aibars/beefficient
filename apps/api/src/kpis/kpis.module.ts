import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kpi } from './kpi.entity';
import { KpisService } from './kpis.service';
import { KpisController } from './kpis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Kpi])],
  controllers: [KpisController],
  providers: [KpisService],
  exports: [KpisService],
})
export class KpisModule {}
