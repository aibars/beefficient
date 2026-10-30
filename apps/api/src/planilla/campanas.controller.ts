import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/users.entity';
import { CampanasService } from './campanas.service';
import { CreateCampanaDto, UpdateCampanaDto } from './dtos/campana.dto';
import { EstablecimientoActivoService } from './establecimiento-activo.service';

@Controller('campanas')
@UseGuards(JwtAuthGuard)
export class CampanasController {
  constructor(
    private readonly service: CampanasService,
    private readonly activo: EstablecimientoActivoService,
  ) {}

  @Get()
  async listar(@CurrentUser() user: User) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.listar(establecimientoId) };
  }

  @Post()
  @HttpCode(201)
  async crear(@CurrentUser() user: User, @Body() dto: CreateCampanaDto) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.crear(establecimientoId, dto) };
  }

  @Get(':id')
  async obtener(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.obtener(establecimientoId, id) };
  }

  @Patch(':id')
  async actualizar(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampanaDto,
  ) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.actualizar(establecimientoId, id, dto) };
  }
}
