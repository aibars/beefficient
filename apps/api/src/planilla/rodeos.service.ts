import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampanasService } from './campanas.service';
import { CreateRodeoDto, UpdateRodeoDto } from './dtos/rodeo.dto';
import { PastoreoEntity } from './entities/pastoreo.entity';
import { RodeoEntity } from './entities/rodeo.entity';
import { aRodeoDto } from './planilla.mappers';
import type { RodeoDto } from './planilla.types';

const GANANCIA_VACIA = (): null[] => Array.from({ length: 12 }, () => null);

@Injectable()
export class RodeosService {
  constructor(
    @InjectRepository(RodeoEntity)
    private readonly repo: Repository<RodeoEntity>,
    @InjectRepository(PastoreoEntity)
    private readonly pastoreos: Repository<PastoreoEntity>,
    private readonly campanas: CampanasService,
  ) {}

  async listar(establecimientoId: string, campanaId: string): Promise<RodeoDto[]> {
    await this.campanas.buscarDelEstablecimiento(establecimientoId, campanaId);
    const filas = await this.repo.find({ where: { campanaId }, order: { createdAt: 'ASC', id: 'ASC' } });
    return filas.map(aRodeoDto);
  }

  async crear(
    establecimientoId: string,
    campanaId: string,
    dto: CreateRodeoDto,
  ): Promise<RodeoDto> {
    await this.campanas.buscarDelEstablecimiento(establecimientoId, campanaId);
    const fila = await this.repo.save(
      this.repo.create({
        campanaId,
        nombre: dto.nombre,
        categoria: dto.categoria ?? null,
        pesoVivo: dto.pesoVivo ?? null,
        ganancia: dto.ganancia ?? GANANCIA_VACIA(),
        inicioServicio: dto.inicioServicio ?? null,
        duracionServicio: dto.duracionServicio ?? 90,
        destete: dto.destete ?? null,
        usaCocimano: dto.usaCocimano ?? true,
      }),
    );
    return aRodeoDto(fila);
  }

  async actualizar(
    establecimientoId: string,
    campanaId: string,
    id: string,
    dto: UpdateRodeoDto,
  ): Promise<RodeoDto> {
    const fila = await this.buscar(establecimientoId, campanaId, id);
    if (dto.nombre !== undefined) fila.nombre = dto.nombre;
    if (dto.categoria !== undefined) fila.categoria = dto.categoria;
    if (dto.pesoVivo !== undefined) fila.pesoVivo = dto.pesoVivo;
    if (dto.ganancia !== undefined) fila.ganancia = dto.ganancia;
    if (dto.inicioServicio !== undefined) fila.inicioServicio = dto.inicioServicio;
    if (dto.duracionServicio !== undefined) fila.duracionServicio = dto.duracionServicio;
    if (dto.destete !== undefined) fila.destete = dto.destete;
    if (dto.usaCocimano !== undefined) fila.usaCocimano = dto.usaCocimano;
    return aRodeoDto(await this.repo.save(fila));
  }

  async borrar(establecimientoId: string, campanaId: string, id: string): Promise<void> {
    const fila = await this.buscar(establecimientoId, campanaId, id);
    // La FK a pastoreos es DEFERRED: solo falla en el COMMIT, así que se chequea acá.
    const usos = await this.pastoreos.count({ where: { rodeoId: id } });
    if (usos > 0) throw new ConflictException('El rodeo tiene pastoreos cargados.');
    await this.repo.remove(fila);
  }

  private async buscar(
    establecimientoId: string,
    campanaId: string,
    id: string,
  ): Promise<RodeoEntity> {
    await this.campanas.buscarDelEstablecimiento(establecimientoId, campanaId);
    const fila = await this.repo.findOne({ where: { id, campanaId } });
    if (!fila) throw new NotFoundException('Rodeo no encontrado.');
    return fila;
  }
}
