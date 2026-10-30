/**
 * Seed de la Planilla de Pastoreo: usuario de desarrollo, su empresa, un
 * establecimiento y una campaña 2026 de ejemplo. Idempotente (ids fijos, upserts).
 */
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../../src/users/users.entity';
import { Company } from '../../src/companies/companies.entity';
import { Establishment } from '../../src/establishments/establishments.entity';
import { UserFarm } from '../../src/farms/user-farm.entity';
import { PotreroEntity } from '../../src/planilla/entities/potrero.entity';
import { LoteEntity } from '../../src/planilla/entities/lote.entity';
import { CampanaEntity } from '../../src/planilla/entities/campana.entity';
import { RodeoEntity } from '../../src/planilla/entities/rodeo.entity';
import { PastoreoEntity } from '../../src/planilla/entities/pastoreo.entity';
import {
  CAMPANA_EJEMPLO,
  CAMPO_EJEMPLO,
  EMPRESA_EJEMPLO_ID,
  ESTABLECIMIENTO_EJEMPLO_ID,
  LOTES_EJEMPLO,
  POTREROS_EJEMPLO,
  USUARIO_EJEMPLO,
} from '../../src/planilla/seed/planilla-ejemplo.data';

export async function seedPlanilla(dataSource: DataSource): Promise<void> {
  const passwordHash = await bcrypt.hash(USUARIO_EJEMPLO.password, 10);
  const establecimientoId = ESTABLECIMIENTO_EJEMPLO_ID;
  const campanaId = CAMPANA_EJEMPLO.id;

  await dataSource.transaction(async (manager) => {
    // user -> company -> users.company_id -> establishment -> users.active_farm_id -> user_farm
    await manager.getRepository(User).upsert(
      { id: USUARIO_EJEMPLO.id, email: USUARIO_EJEMPLO.email, passwordHash },
      ['id'],
    );
    await manager.getRepository(Company).upsert(
      { id: EMPRESA_EJEMPLO_ID, ownerId: USUARIO_EJEMPLO.id },
      ['id'],
    );
    await manager.getRepository(User).update(USUARIO_EJEMPLO.id, { companyId: EMPRESA_EJEMPLO_ID });
    await manager.getRepository(Establishment).upsert(
      {
        id: establecimientoId,
        companyId: EMPRESA_EJEMPLO_ID,
        name: CAMPO_EJEMPLO.nombre,
        provincia: CAMPO_EJEMPLO.provincia,
      },
      ['id'],
    );
    await manager.getRepository(User).update(USUARIO_EJEMPLO.id, { activeFarmId: establecimientoId });
    await manager.getRepository(UserFarm).upsert(
      { userId: USUARIO_EJEMPLO.id, farmId: establecimientoId, role: 'admin', active: true },
      ['userId', 'farmId'],
    );

    await manager.getRepository(PotreroEntity).upsert(
      POTREROS_EJEMPLO.map((p) => ({ ...p, establecimientoId })),
      ['id'],
    );
    await manager.getRepository(LoteEntity).upsert(
      LOTES_EJEMPLO.map((l) => ({ ...l, establecimientoId })),
      ['id'],
    );
    await manager.getRepository(CampanaEntity).upsert(
      {
        id: campanaId,
        establecimientoId,
        anio: CAMPANA_EJEMPLO.anio,
        mesServicio: CAMPANA_EJEMPLO.mesServicio,
        eficienciaCosecha: CAMPANA_EJEMPLO.eficienciaCosecha,
      },
      ['id'],
    );
    await manager.getRepository(RodeoEntity).upsert(
      CAMPANA_EJEMPLO.rodeos.map((r) => ({ ...r, ganancia: [...r.ganancia], campanaId })),
      ['id'],
    );
    await manager.getRepository(PastoreoEntity).upsert(
      CAMPANA_EJEMPLO.pastoreos.map((p) => ({ ...p, campanaId })),
      ['id'],
    );
  });
}
