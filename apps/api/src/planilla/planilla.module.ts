import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from '../farms/farms.module';
import { CampanaEntity } from './entities/campana.entity';
import { LoteEntity } from './entities/lote.entity';
import { PastoreoEntity } from './entities/pastoreo.entity';
import { PotreroEntity } from './entities/potrero.entity';
import { RodeoEntity } from './entities/rodeo.entity';
import { EstablecimientoActivoService } from './establecimiento-activo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PotreroEntity,
      LoteEntity,
      CampanaEntity,
      RodeoEntity,
      PastoreoEntity,
    ]),
    FarmsModule,
  ],
  providers: [EstablecimientoActivoService],
  exports: [EstablecimientoActivoService],
})
export class PlanillaModule {}
