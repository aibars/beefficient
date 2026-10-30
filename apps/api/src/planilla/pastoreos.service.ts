import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampanasService } from './campanas.service';
import { CreatePastoreoDto, UpdatePastoreoDto } from './dtos/pastoreo.dto';
import { LoteEntity } from './entities/lote.entity';
import { PastoreoEntity } from './entities/pastoreo.entity';
import { RodeoEntity } from './entities/rodeo.entity';
import { aPastoreoDto } from './planilla.mappers';
import type { PastoreoDto } from './planilla.types';

@Injectable()
export class PastoreosService {
  constructor(
    @InjectRepository(PastoreoEntity)
    private readonly repo: Repository<PastoreoEntity>,
    @InjectRepository(LoteEntity)
    private readonly lotes: Repository<LoteEntity>,
    @InjectRepository(RodeoEntity)
    private readonly rodeos: Repository<RodeoEntity>,
    private readonly campanas: CampanasService,
  ) {}

  async listar(establecimientoId: string, campanaId: string): Promise<PastoreoDto[]> {
    await this.campanas.buscarDelEstablecimiento(establecimientoId, campanaId);
    const filas = await this.repo.find({ where: { campanaId }, order: { createdAt: 'ASC', id: 'ASC' } });
    return filas.map(aPastoreoDto);
  }

  async crear(
    establecimientoId: string,
    campanaId: string,
    dto: CreatePastoreoDto,
  ): Promise<PastoreoDto> {
    await this.campanas.buscarDelEstablecimiento(establecimientoId, campanaId);
    await this.validarReferencias(establecimientoId, campanaId, dto);
    const fila = await this.repo.save(
      this.repo.create({
        campanaId,
        loteId: dto.loteId ?? null,
        rodeoId: dto.rodeoId ?? null,
        cabezas: dto.cabezas ?? null,
        entrada: dto.entrada ?? null,
        salida: dto.salida ?? null,
        categoriaTabla1Id: dto.categoriaTabla1Id ?? null,
        evManual: dto.evManual ?? null,
      }),
    );
    return aPastoreoDto(fila);
  }

  async actualizar(
    establecimientoId: string,
    campanaId: string,
    id: string,
    dto: UpdatePastoreoDto,
  ): Promise<PastoreoDto> {
    await this.campanas.buscarDelEstablecimiento(establecimientoId, campanaId);
    const fila = await this.repo.findOne({ where: { id, campanaId } });
    if (!fila) throw new NotFoundException('Pastoreo no encontrado.');
    await this.validarReferencias(establecimientoId, campanaId, dto);
    if (dto.loteId !== undefined) fila.loteId = dto.loteId;
    if (dto.rodeoId !== undefined) fila.rodeoId = dto.rodeoId;
    if (dto.cabezas !== undefined) fila.cabezas = dto.cabezas;
    if (dto.entrada !== undefined) fila.entrada = dto.entrada;
    if (dto.salida !== undefined) fila.salida = dto.salida;
    if (dto.categoriaTabla1Id !== undefined) fila.categoriaTabla1Id = dto.categoriaTabla1Id;
    if (dto.evManual !== undefined) fila.evManual = dto.evManual;
    return aPastoreoDto(await this.repo.save(fila));
  }

  async borrar(establecimientoId: string, campanaId: string, id: string): Promise<void> {
    await this.campanas.buscarDelEstablecimiento(establecimientoId, campanaId);
    const fila = await this.repo.findOne({ where: { id, campanaId } });
    if (!fila) throw new NotFoundException('Pastoreo no encontrado.');
    await this.repo.remove(fila);
  }

  private async validarReferencias(
    establecimientoId: string,
    campanaId: string,
    dto: { loteId?: string | null; rodeoId?: string | null },
  ): Promise<void> {
    if (dto.loteId) {
      const existe = await this.lotes.exists({ where: { id: dto.loteId, establecimientoId } });
      if (!existe) throw new BadRequestException('El lote no existe.');
    }
    if (dto.rodeoId) {
      const existe = await this.rodeos.exists({ where: { id: dto.rodeoId, campanaId } });
      if (!existe) throw new BadRequestException('El rodeo no existe.');
    }
  }
}
