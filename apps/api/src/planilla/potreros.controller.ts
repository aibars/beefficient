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
import { CreatePotreroDto, UpdatePotreroDto } from './dtos/potrero.dto';
import { EstablecimientoActivoService } from './establecimiento-activo.service';
import { PotrerosService } from './potreros.service';

@Controller('potreros')
@UseGuards(JwtAuthGuard)
export class PotrerosController {
  constructor(
    private readonly service: PotrerosService,
    private readonly activo: EstablecimientoActivoService,
  ) {}

  @Get()
  async listar(@CurrentUser() user: User) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.listar(establecimientoId) };
  }

  @Post()
  @HttpCode(201)
  async crear(@CurrentUser() user: User, @Body() dto: CreatePotreroDto) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.crear(establecimientoId, dto) };
  }

  @Patch(':id')
  async actualizar(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePotreroDto,
  ) {
    const establecimientoId = await this.activo.resolver(user);
    return { data: await this.service.actualizar(establecimientoId, id, dto) };
  }

  @Delete(':id')
  @HttpCode(204)
  async borrar(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    const establecimientoId = await this.activo.resolver(user);
    await this.service.borrar(establecimientoId, id);
  }
}
