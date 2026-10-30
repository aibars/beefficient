import { join } from 'path';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';
import { isUniqueViolation } from 'src/common/database/pg-errors';
import { Company } from 'src/companies/companies.entity';
import { Establishment } from 'src/establishments/establishments.entity';
import { CampanaEntity } from 'src/planilla/entities/campana.entity';
import { LoteEntity } from 'src/planilla/entities/lote.entity';
import { PastoreoEntity } from 'src/planilla/entities/pastoreo.entity';
import { PotreroEntity } from 'src/planilla/entities/potrero.entity';
import { RodeoEntity } from 'src/planilla/entities/rodeo.entity';
import { User } from 'src/users/users.entity';

describe('Esquema de la planilla', () => {
  jest.setTimeout(30000);

  let dataSource: DataSource;
  let em: EntityManager;
  let user: User;
  let campo: Establishment;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [join(__dirname, '..', '**', '*.entity.ts')],
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.ts')],
      migrationsRun: true,
      synchronize: false,
      logging: false,
    });
    await dataSource.initialize();
    em = dataSource.manager;

    user = await em.save(em.create(User, { email: `planilla-${randomUUID()}@test.com` }));
    const company = await em.save(em.create(Company, { ownerId: user.id }));
    campo = await em.save(
      em.create(Establishment, { companyId: company.id, name: 'Campo planilla', provincia: 'Córdoba' }),
    );
  });

  afterAll(async () => {
    // Cascades to companies, establishments and everything under them.
    if (user) await em.remove(user);
    await dataSource?.destroy();
  });

  const nuevaCampana = (anio: number) =>
    em.save(em.create(CampanaEntity, { establecimientoId: campo.id, anio }));

  it('rechaza dos lotes con el mismo nombre en un establecimiento', async () => {
    await em.save(em.create(LoteEntity, { establecimientoId: campo.id, nombre: 'La Loma', hectareas: 30 }));
    const err = await em
      .save(em.create(LoteEntity, { establecimientoId: campo.id, nombre: 'La Loma', hectareas: 12 }))
      .catch((e: unknown) => e);
    expect(isUniqueViolation(err)).toBe(true);
  });

  it('deja el lote sin potrero al borrar el potrero', async () => {
    const potrero = await em.save(
      em.create(PotreroEntity, { establecimientoId: campo.id, nombre: 'Potrero Norte', hectareas: 100 }),
    );
    const lote = await em.save(
      em.create(LoteEntity, { establecimientoId: campo.id, potreroId: potrero.id, nombre: 'Lote del potrero' }),
    );
    await em.delete(PotreroEntity, potrero.id);
    const recargado = await em.findOneByOrFail(LoteEntity, { id: lote.id });
    expect(recargado.potreroId).toBeNull();
  });

  it('no deja borrar un lote con pastoreos', async () => {
    const lote = await em.save(em.create(LoteEntity, { establecimientoId: campo.id, nombre: 'Lote con pastoreo' }));
    const campana = await nuevaCampana(2031);
    await em.save(em.create(PastoreoEntity, { campanaId: campana.id, loteId: lote.id }));
    const err = await em.delete(LoteEntity, lote.id).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(QueryFailedError);
    expect((err as QueryFailedError & { driverError: { code: string } }).driverError.code).toBe('23503');
  });

  it('rechaza dos campañas del mismo año en un establecimiento', async () => {
    await nuevaCampana(2032);
    const err = await nuevaCampana(2032).catch((e: unknown) => e);
    expect(isUniqueViolation(err)).toBe(true);
  });

  it('guarda un pastoreo con todos los campos opcionales en null', async () => {
    const campana = await nuevaCampana(2033);
    const guardado = await em.save(em.create(PastoreoEntity, { campanaId: campana.id }));
    const p = await em.findOneByOrFail(PastoreoEntity, { id: guardado.id });
    expect(p).toMatchObject({
      loteId: null,
      rodeoId: null,
      cabezas: null,
      entrada: null,
      salida: null,
      categoriaTabla1Id: null,
      evManual: null,
    });
  });

  it('aplica los valores por defecto de campaña y rodeo', async () => {
    const campana = await em.findOneByOrFail(CampanaEntity, { id: (await nuevaCampana(2034)).id });
    expect(campana).toMatchObject({ mesServicio: 1, eficienciaCosecha: 50, tabla1: null, consumo: null, supuestos: null });
    const rodeo = await em.save(em.create(RodeoEntity, { campanaId: campana.id, nombre: 'Vacas' }));
    const r = await em.findOneByOrFail(RodeoEntity, { id: rodeo.id });
    expect(r.ganancia).toEqual(Array(12).fill(null));
    expect(r.duracionServicio).toBe(90);
    expect(r.usaCocimano).toBe(true);
  });

  it('devuelve fechas como aaaa-mm-dd y numeric como number', async () => {
    const campana = await nuevaCampana(2035);
    const rodeo = await em.save(
      em.create(RodeoEntity, { campanaId: campana.id, nombre: 'Terneros', inicioServicio: '2025-11-01', pesoVivo: 420.5 }),
    );
    const lote = await em.save(em.create(LoteEntity, { establecimientoId: campo.id, nombre: 'Lote decimal', hectareas: 30.5 }));
    const r = await em.findOneByOrFail(RodeoEntity, { id: rodeo.id });
    const l = await em.findOneByOrFail(LoteEntity, { id: lote.id });
    expect(r.inicioServicio).toBe('2025-11-01');
    expect(r.pesoVivo).toBe(420.5);
    expect(l.hectareas).toBe(30.5);
  });

  it('no deja borrar un rodeo con pastoreos', async () => {
    const campana = await nuevaCampana(2036);
    const rodeo = await em.save(em.create(RodeoEntity, { campanaId: campana.id, nombre: 'Rodeo con pastoreo' }));
    await em.save(em.create(PastoreoEntity, { campanaId: campana.id, rodeoId: rodeo.id }));
    const err = await em.delete(RodeoEntity, rodeo.id).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(QueryFailedError);
    expect((err as QueryFailedError & { driverError: { code: string } }).driverError.code).toBe('23503');
  });

  it('borrar un establecimiento arrastra potreros, lotes, campañas, rodeos y pastoreos', async () => {
    const company = await em.save(em.create(Company, { ownerId: user.id }));
    const otro = await em.save(
      em.create(Establishment, { companyId: company.id, name: 'Campo a borrar', provincia: 'Córdoba' }),
    );
    const potrero = await em.save(em.create(PotreroEntity, { establecimientoId: otro.id, nombre: 'P', hectareas: 10 }));
    const lote = await em.save(em.create(LoteEntity, { establecimientoId: otro.id, potreroId: potrero.id, nombre: 'L' }));
    const campana = await em.save(em.create(CampanaEntity, { establecimientoId: otro.id, anio: 2040 }));
    const rodeo = await em.save(em.create(RodeoEntity, { campanaId: campana.id, nombre: 'R' }));
    await em.save(em.create(PastoreoEntity, { campanaId: campana.id, loteId: lote.id, rodeoId: rodeo.id }));

    await em.delete(Establishment, otro.id);

    expect(await em.countBy(PotreroEntity, { establecimientoId: otro.id })).toBe(0);
    expect(await em.countBy(LoteEntity, { establecimientoId: otro.id })).toBe(0);
    expect(await em.countBy(CampanaEntity, { establecimientoId: otro.id })).toBe(0);
    expect(await em.countBy(RodeoEntity, { campanaId: campana.id })).toBe(0);
    expect(await em.countBy(PastoreoEntity, { campanaId: campana.id })).toBe(0);
  });
});
