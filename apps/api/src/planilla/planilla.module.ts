import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from '../farms/farms.module';
import { CampanasController } from './campanas.controller';
import { CampanasService } from './campanas.service';
import { CampanaEntity } from './entities/campana.entity';
import { LoteEntity } from './entities/lote.entity';
import { PastoreoEntity } from './entities/pastoreo.entity';
import { PotreroEntity } from './entities/potrero.entity';
import { RodeoEntity } from './entities/rodeo.entity';
import { LotesController } from './lotes.controller';
import { LotesService } from './lotes.service';
import { PastoreosController } from './pastoreos.controller';
import { PastoreosService } from './pastoreos.service';
import { RodeosController } from './rodeos.controller';
import { RodeosService } from './rodeos.service';
import { PotrerosController } from './potreros.controller';
import { PotrerosService } from './potreros.service';
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
  controllers: [
    PotrerosController,
    LotesController,
    CampanasController,
    RodeosController,
    PastoreosController,
  ],
  providers: [
    EstablecimientoActivoService,
    PotrerosService,
    LotesService,
    CampanasService,
    RodeosService,
    PastoreosService,
  ],
  exports: [EstablecimientoActivoService, CampanasService],
})
export class PlanillaModule {}
