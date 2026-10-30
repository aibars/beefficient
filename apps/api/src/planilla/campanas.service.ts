import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUniqueViolation } from '../common/database/pg-errors';
import { CreateCampanaDto, UpdateCampanaDto } from './dtos/campana.dto';
import { CampanaEntity } from './entities/campana.entity';
import { LoteEntity } from './entities/lote.entity';
import { PastoreoEntity } from './entities/pastoreo.entity';
import { RodeoEntity } from './entities/rodeo.entity';
import { aPastoreoDto, aRodeoDto } from './planilla.mappers';
import type { CampanaCompletaDto, CampanaResumenDto } from './planilla.types';

const aResumen = (c: CampanaEntity): CampanaResumenDto => ({
  id: c.id,
  anio: c.anio,
  mesServicio: c.mesServicio,
  eficienciaCosecha: c.eficienciaCosecha,
});

@Injectable()
export class CampanasService {
  constructor(
    @InjectRepository(CampanaEntity)
    private readonly repo: Repository<CampanaEntity>,
    @InjectRepository(LoteEntity)
    private readonly lotes: Repository<LoteEntity>,
    @InjectRepository(RodeoEntity)
    private readonly rodeos: Repository<RodeoEntity>,
    @InjectRepository(PastoreoEntity)
    private readonly pastoreos: Repository<PastoreoEntity>,
  ) {}

  async listar(establecimientoId: string): Promise<CampanaResumenDto[]> {
    const filas = await this.repo.find({
      where: { establecimientoId },
      order: { anio: 'DESC' },
    });
    return filas.map(aResumen);
  }

  async crear(establecimientoId: string, dto: CreateCampanaDto): Promise<CampanaResumenDto> {
    try {
      const fila = await this.repo.save(
        this.repo.create({
          establecimientoId,
          anio: dto.anio,
          mesServicio: dto.mesServicio ?? 1,
          eficienciaCosecha: dto.eficienciaCosecha ?? 50,
        }),
      );
      return aResumen(fila);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(`Ya existe la campaña ${dto.anio}.`);
      }
      throw err;
    }
  }

  async actualizar(
    establecimientoId: string,
    id: string,
    dto: UpdateCampanaDto,
  ): Promise<CampanaResumenDto> {
    const fila = await this.buscarDelEstablecimiento(establecimientoId, id);
    if (dto.mesServicio !== undefined) fila.mesServicio = dto.mesServicio;
    if (dto.eficienciaCosecha !== undefined) fila.eficienciaCosecha = dto.eficienciaCosecha;
    if (dto.tabla1 !== undefined) fila.tabla1 = dto.tabla1;
    if (dto.consumo !== undefined) fila.consumo = dto.consumo;
    if (dto.supuestos !== undefined) fila.supuestos = dto.supuestos;
    return aResumen(await this.repo.save(fila));
  }

  async obtener(establecimientoId: string, id: string): Promise<CampanaCompletaDto> {
    const c = await this.buscarDelEstablecimiento(establecimientoId, id);
    const [lotes, rodeos, pastoreos] = await Promise.all([
      this.lotes.find({ where: { establecimientoId }, order: { nombre: 'ASC' } }),
      this.rodeos.find({ where: { campanaId: id }, order: { createdAt: 'ASC' } }),
      this.pastoreos.find({ where: { campanaId: id }, order: { createdAt: 'ASC' } }),
    ]);
    return {
      id: c.id,
      anio: c.anio,
      mesServicio: c.mesServicio,
      eficienciaCosecha: c.eficienciaCosecha,
      lotes: lotes.map((l) => ({ id: l.id, nombre: l.nombre, hectareas: l.hectareas })),
      rodeos: rodeos.map(aRodeoDto),
      pastoreos: pastoreos.map(aPastoreoDto),
      ...(c.tabla1 !== null && { tabla1: c.tabla1 }),
      ...(c.consumo !== null && { consumo: c.consumo }),
      ...(c.supuestos !== null && { supuestos: c.supuestos }),
    };
  }

  async buscarDelEstablecimiento(
    establecimientoId: string,
    campanaId: string,
  ): Promise<CampanaEntity> {
    const fila = await this.repo.findOne({ where: { id: campanaId, establecimientoId } });
    if (!fila) throw new NotFoundException('Campaña no encontrada.');
    return fila;
  }
}
