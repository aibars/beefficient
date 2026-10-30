import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database/pg-errors';
import { CreateLoteDto, UpdateLoteDto } from './dtos/lote.dto';
import { LoteEntity } from './entities/lote.entity';
import { PastoreoEntity } from './entities/pastoreo.entity';
import { PotreroEntity } from './entities/potrero.entity';
import type { LoteDto } from './planilla.types';

const NOMBRE_REPETIDO = 'Ya existe un lote con ese nombre.';

const aDto = (l: LoteEntity): LoteDto => ({
  id: l.id,
  nombre: l.nombre,
  hectareas: l.hectareas,
  potreroId: l.potreroId,
});

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(LoteEntity)
    private readonly repo: Repository<LoteEntity>,
    @InjectRepository(PotreroEntity)
    private readonly potreros: Repository<PotreroEntity>,
    @InjectRepository(PastoreoEntity)
    private readonly pastoreos: Repository<PastoreoEntity>,
  ) {}

  async listar(establecimientoId: string): Promise<LoteDto[]> {
    const filas = await this.repo.find({
      where: { establecimientoId },
      order: { nombre: 'ASC' },
    });
    return filas.map(aDto);
  }

  async crear(establecimientoId: string, dto: CreateLoteDto): Promise<LoteDto> {
    await this.validarPotrero(establecimientoId, dto.potreroId);
    try {
      const fila = await this.repo.save(
        this.repo.create({
          establecimientoId,
          nombre: dto.nombre,
          hectareas: dto.hectareas ?? null,
          potreroId: dto.potreroId ?? null,
        }),
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
    dto: UpdateLoteDto,
  ): Promise<LoteDto> {
    const fila = await this.buscar(establecimientoId, id);
    await this.validarPotrero(establecimientoId, dto.potreroId);
    if (dto.nombre !== undefined) fila.nombre = dto.nombre;
    if (dto.hectareas !== undefined) fila.hectareas = dto.hectareas;
    if (dto.potreroId !== undefined) fila.potreroId = dto.potreroId;
    try {
      return aDto(await this.repo.save(fila));
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException(NOMBRE_REPETIDO);
      throw err;
    }
  }

  async borrar(establecimientoId: string, id: string): Promise<void> {
    const fila = await this.buscar(establecimientoId, id);
    // La FK a pastoreos es DEFERRED: solo falla en el COMMIT, así que se chequea acá.
    const usos = await this.pastoreos.count({ where: { loteId: id } });
    if (usos > 0) throw new ConflictException('El lote tiene pastoreos cargados.');
    await this.repo.remove(fila);
  }

  private async buscar(establecimientoId: string, id: string): Promise<LoteEntity> {
    const fila = await this.repo.findOne({ where: { id, establecimientoId } });
    if (!fila) throw new NotFoundException('Lote no encontrado.');
    return fila;
  }

  private async validarPotrero(
    establecimientoId: string,
    potreroId: string | null | undefined,
  ): Promise<void> {
    if (!potreroId) return;
    const existe = await this.potreros.exists({
      where: { id: potreroId, establecimientoId },
    });
    if (!existe) throw new BadRequestException('El potrero no existe.');
  }
}
