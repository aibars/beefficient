import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from './farms.entity';
import { UserFarm } from './user-farm.entity';
import { FarmJoinCode } from './farm-join-code.entity';
import { FarmsRepository } from './farms.repository';
import { UserFarmRepository } from './user-farm.repository';
import { FarmJoinCodeRepository } from './farm-join-code.repository';
import { FarmsService } from './farms.service';
import { JoinCodeService } from './join-code.service';

@Module({
  imports: [TypeOrmModule.forFeature([Farm, UserFarm, FarmJoinCode])],
  providers: [
    FarmsRepository,
    UserFarmRepository,
    FarmJoinCodeRepository,
    FarmsService,
    JoinCodeService,
  ],
  exports: [FarmsService, JoinCodeService],
})
export class FarmsModule {}
