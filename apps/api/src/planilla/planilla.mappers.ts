import type { PastoreoEntity } from './entities/pastoreo.entity';
import type { RodeoEntity } from './entities/rodeo.entity';
import type { PastoreoDto, RodeoDto } from './planilla.types';

export const aRodeoDto = (r: RodeoEntity): RodeoDto => ({
  id: r.id,
  nombre: r.nombre,
  categoria: r.categoria,
  pesoVivo: r.pesoVivo,
  ganancia: r.ganancia,
  inicioServicio: r.inicioServicio,
  duracionServicio: r.duracionServicio,
  destete: r.destete,
  usaCocimano: r.usaCocimano,
});

export const aPastoreoDto = (p: PastoreoEntity): PastoreoDto => ({
  id: p.id,
  loteId: p.loteId,
  rodeoId: p.rodeoId,
  cabezas: p.cabezas,
  entrada: p.entrada,
  salida: p.salida,
  categoriaTabla1Id: p.categoriaTabla1Id,
  evManual: p.evManual,
});
