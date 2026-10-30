import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { CampanaEntity } from 'src/planilla/entities/campana.entity';
import { PastoreoEntity } from 'src/planilla/entities/pastoreo.entity';
import { crearAppDePrueba, registrarConCampo } from './helpers/planilla-app';

describe('Planilla: potreros y lotes (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  const http = () => request(app.getHttpServer());
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  beforeAll(async () => {
    app = await crearAppDePrueba();
  });
  afterAll(async () => {
    await app.close();
  });

  it('crea, lista, edita y borra un potrero; borrarlo deja potreroId null en los lotes', async () => {
    const { token } = await registrarConCampo(app, 'potrero');
    const creado = await http()
      .post('/potreros')
      .set(auth(token))
      .send({ nombre: 'Norte', hectareas: 120.5 });
    expect(creado.status).toBe(201);
    expect(creado.body.data).toEqual({ id: expect.any(String), nombre: 'Norte', hectareas: 120.5 });
    const id = creado.body.data.id;

    await http().post('/potreros').set(auth(token)).send({ nombre: 'Anexo', hectareas: 10 });
    const lista = await http().get('/potreros').set(auth(token));
    expect(lista.status).toBe(200);
    expect(lista.body.data.map((p: { nombre: string }) => p.nombre)).toEqual(['Anexo', 'Norte']);

    const edit = await http().patch(`/potreros/${id}`).set(auth(token)).send({ hectareas: 99 });
    expect(edit.status).toBe(200);
    expect(edit.body.data).toEqual({ id, nombre: 'Norte', hectareas: 99 });

    const lote = await http().post('/lotes').set(auth(token)).send({ nombre: 'L1', potreroId: id });
    expect(lote.body.data.potreroId).toBe(id);

    const del = await http().delete(`/potreros/${id}`).set(auth(token));
    expect(del.status).toBe(204);
    const lotes = await http().get('/lotes').set(auth(token));
    expect(lotes.body.data).toEqual([
      { id: lote.body.data.id, nombre: 'L1', hectareas: null, potreroId: null },
    ]);
  });

  it('crea un lote con potrero y otro sin potrero', async () => {
    const { token } = await registrarConCampo(app, 'lotes');
    const p = await http().post('/potreros').set(auth(token)).send({ nombre: 'P', hectareas: 5 });
    const a = await http()
      .post('/lotes')
      .set(auth(token))
      .send({ nombre: 'A', hectareas: 3, potreroId: p.body.data.id });
    const b = await http().post('/lotes').set(auth(token)).send({ nombre: 'B' });
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    const lista = await http().get('/lotes').set(auth(token));
    expect(lista.body).toEqual({
      data: [
        { id: a.body.data.id, nombre: 'A', hectareas: 3, potreroId: p.body.data.id },
        { id: b.body.data.id, nombre: 'B', hectareas: null, potreroId: null },
      ],
    });
  });

  it('409 por nombre repetido', async () => {
    const { token } = await registrarConCampo(app, 'dup');
    await http().post('/potreros').set(auth(token)).send({ nombre: 'X', hectareas: 1 });
    const p = await http().post('/potreros').set(auth(token)).send({ nombre: 'X', hectareas: 2 });
    expect(p.status).toBe(409);
    expect(p.body.message).toBe('Ya existe un potrero con ese nombre.');
    await http().post('/lotes').set(auth(token)).send({ nombre: 'X' });
    const l = await http().post('/lotes').set(auth(token)).send({ nombre: 'X' });
    expect(l.status).toBe(409);
    expect(l.body.message).toBe('Ya existe un lote con ese nombre.');
  });

  it('valida la forma del body', async () => {
    const { token } = await registrarConCampo(app, 'valida');
    const r = await http().post('/potreros').set(auth(token)).send({ nombre: '', hectareas: 0 });
    expect(r.status).toBe(400);
  });

  it('PATCH /lotes/:id de otro campo del mismo usuario da 404 y no cambia', async () => {
    const { token, campoId: campoA } = await registrarConCampo(app, 'multi');
    const b = await http()
      .post('/auth/farm/create')
      .set(auth(token))
      .send({ farm_name: 'Campo B', provincia: 'La Pampa' });
    expect(b.body.active).toBe(true);
    const loteB = await http().post('/lotes').set(auth(token)).send({ nombre: 'DeB' });
    expect(loteB.status).toBe(201);
    const volver = await http().patch(`/auth/farm/${campoA}/active`).set(auth(token));
    expect(volver.status).toBe(200);

    const r = await http().patch(`/lotes/${loteB.body.data.id}`).set(auth(token)).send({ nombre: 'Robado' });
    expect(r.status).toBe(404);
    const d = await http().delete(`/lotes/${loteB.body.data.id}`).set(auth(token));
    expect(d.status).toBe(404);

    const lista = await http().get('/lotes').set(auth(token));
    expect(lista.body.data).toEqual([]);
    await http().patch(`/auth/farm/${b.body.farm_id}/active`).set(auth(token));
    const listaB = await http().get('/lotes').set(auth(token));
    expect(listaB.body.data).toEqual([
      { id: loteB.body.data.id, nombre: 'DeB', hectareas: null, potreroId: null },
    ]);
  });

  it('sin establecimiento activo: 409', async () => {
    const email = `sin-campo-${randomUUID().slice(0, 8)}@planilla.test`;
    const s = await http().post('/auth/signup').send({ email, password: 'SecurePass123' });
    const r = await http().get('/lotes').set(auth(s.body.accessToken));
    expect(r.status).toBe(409);
    expect(r.body.message).toBe('No tenés un establecimiento activo.');
  });

  it('potreroId de otro campo: 400', async () => {
    const u1 = await registrarConCampo(app, 'ajeno1');
    const u2 = await registrarConCampo(app, 'ajeno2');
    const p = await http().post('/potreros').set(auth(u2.token)).send({ nombre: 'Aj', hectareas: 1 });
    const r = await http()
      .post('/lotes')
      .set(auth(u1.token))
      .send({ nombre: 'L', potreroId: p.body.data.id });
    expect(r.status).toBe(400);
    expect(r.body.message).toBe('El potrero no existe.');
    const mio = await http().post('/lotes').set(auth(u1.token)).send({ nombre: 'M' });
    const r2 = await http()
      .patch(`/lotes/${mio.body.data.id}`)
      .set(auth(u1.token))
      .send({ potreroId: p.body.data.id });
    expect(r2.status).toBe(400);
  });

  it('borrar un lote con pastoreos: 409', async () => {
    const { token, campoId } = await registrarConCampo(app, 'pasto');
    const lote = await http().post('/lotes').set(auth(token)).send({ nombre: 'Con pastoreo' });
    const ds = app.get(DataSource);
    const campana = await ds
      .getRepository(CampanaEntity)
      .save({ establecimientoId: campoId, anio: 2026 });
    await ds
      .getRepository(PastoreoEntity)
      .save({ campanaId: campana.id, loteId: lote.body.data.id });
    const r = await http().delete(`/lotes/${lote.body.data.id}`).set(auth(token));
    expect(r.status).toBe(409);
    expect(r.body.message).toBe('El lote tiene pastoreos cargados.');
  });

  it('borra un lote sin pastoreos: 204', async () => {
    const { token } = await registrarConCampo(app, 'borra');
    const lote = await http().post('/lotes').set(auth(token)).send({ nombre: 'Z' });
    const r = await http().delete(`/lotes/${lote.body.data.id}`).set(auth(token));
    expect(r.status).toBe(204);
  });
});
