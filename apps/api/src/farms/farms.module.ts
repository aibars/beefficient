import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Establishment } from '../establishments/establishments.entity';
import { EstablishmentsRepository } from '../establishments/establishments.repository';
import { CompaniesModule } from '../companies/companies.module';
import { UserFarm } from './user-farm.entity';
import { FarmJoinCode } from './farm-join-code.entity';
import { UserFarmRepository } from './user-farm.repository';
import { FarmJoinCodeRepository } from './farm-join-code.repository';
import { FarmsService } from './farms.service';
import { JoinCodeService } from './join-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Establishment, UserFarm, FarmJoinCode]),
    CompaniesModule,
  ],
  providers: [
    EstablishmentsRepository,
    UserFarmRepository,
    FarmJoinCodeRepository,
    FarmsService,
    JoinCodeService,
  ],
  exports: [FarmsService, JoinCodeService],
})
export class FarmsModule {}
