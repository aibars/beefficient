import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database/pg-errors';
import { CreatePotreroDto, UpdatePotreroDto } from './dtos/potrero.dto';
import { PotreroEntity } from './entities/potrero.entity';
import type { PotreroDto } from './planilla.types';

const NOMBRE_REPETIDO = 'Ya existe un potrero con ese nombre.';

const aDto = (p: PotreroEntity): PotreroDto => ({
  id: p.id,
  nombre: p.nombre,
  hectareas: p.hectareas,
});

@Injectable()
export class PotrerosService {
  constructor(
    @InjectRepository(PotreroEntity)
    private readonly repo: Repository<PotreroEntity>,
  ) {}

  async listar(establecimientoId: string): Promise<PotreroDto[]> {
    const filas = await this.repo.find({
      where: { establecimientoId },
      order: { nombre: 'ASC' },
    });
    return filas.map(aDto);
  }

  async crear(establecimientoId: string, dto: CreatePotreroDto): Promise<PotreroDto> {
    try {
      const fila = await this.repo.save(
        this.repo.create({ establecimientoId, nombre: dto.nombre, hectareas: dto.hectareas }),
      );
      return aDto(fila);
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException(NOMBRE_REPETIDO);
      throw err;
    }
  }

  async actualizar(
    establecimientoId: string,
    id: string,
    dto: UpdatePotreroDto,
  ): Promise<PotreroDto> {
    const fila = await this.buscar(establecimientoId, id);
    if (dto.nombre !== undefined) fila.nombre = dto.nombre;
    if (dto.hectareas !== undefined) fila.hectareas = dto.hectareas;
    try {
      return aDto(await this.repo.save(fila));
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException(NOMBRE_REPETIDO);
      throw err;
    }
  }

  async borrar(establecimientoId: string, id: string): Promise<void> {
    const fila = await this.buscar(establecimientoId, id);
    await this.repo.remove(fila);
  }

  private async buscar(establecimientoId: string, id: string): Promise<PotreroEntity> {
    const fila = await this.repo.findOne({ where: { id, establecimientoId } });
    if (!fila) throw new NotFoundException('Potrero no encontrado.');
    return fila;
  }
}
