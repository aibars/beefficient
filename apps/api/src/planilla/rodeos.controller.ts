import {
  Body,
  Controller,
  Delete,
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
import { CreateRodeoDto, UpdateRodeoDto } from './dtos/rodeo.dto';
import { EstablecimientoActivoService } from './establecimiento-activo.service';
import { RodeosService } from './rodeos.service';

@Controller('campanas/:campanaId/rodeos')
@UseGuards(JwtAuthGuard)
export class RodeosController {
  constructor(
    private readonly service: RodeosService,
    private readonly activo: EstablecimientoActivoService,
  ) {}

  @Get()
  async listar(@CurrentUser() user: User, @Param('campanaId', ParseUUIDPipe) campanaId: string) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.listar(establecimientoId, campanaId) };
  }

  @Post()
  @HttpCode(201)
  async crear(
    @CurrentUser() user: User,
    @Param('campanaId', ParseUUIDPipe) campanaId: string,
    @Body() dto: CreateRodeoDto,
  ) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.crear(establecimientoId, campanaId, dto) };
  }

  @Patch(':id')
  async actualizar(
    @CurrentUser() user: User,
    @Param('campanaId', ParseUUIDPipe) campanaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRodeoDto,
  ) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.actualizar(establecimientoId, campanaId, id, dto) };
  }

  @Delete(':id')
  @HttpCode(204)
  async borrar(
    @CurrentUser() user: User,
    @Param('campanaId', ParseUUIDPipe) campanaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const establecimientoId = await this.activo.resolver(user);
    await this.service.borrar(establecimientoId, campanaId, id);
  }
}
