import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { calcularCampana } from '@beefficient/domain';
import { crearAppDePrueba, registrarConCampo } from './helpers/planilla-app';

describe('Planilla: rodeos y pastoreos (e2e)', () => {
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

  async function preparar(etiqueta: string) {
    const { token } = await registrarConCampo(app, etiqueta);
    const camp = await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    const lote = await http().post('/lotes').set(auth(token)).send({ nombre: 'L1', hectareas: 20 });
    return { token, campId: camp.body.data.id as string, loteId: lote.body.data.id as string };
  }

  it('crea un rodeo con solo nombre y aplica los defaults', async () => {
    const { token, campId } = await preparar('rod-def');
    const res = await http()
      .post(`/campanas/${campId}/rodeos`)
      .set(auth(token))
      .send({ nombre: 'Vacas' });
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      id: expect.any(String),
      nombre: 'Vacas',
      categoria: null,
      pesoVivo: null,
      ganancia: Array(12).fill(null),
      inicioServicio: null,
      duracionServicio: 90,
      destete: null,
      usaCocimano: true,
    });
    const lista = await http().get(`/campanas/${campId}/rodeos`).set(auth(token));
    expect(lista.body.data).toEqual([res.body.data]);
  });

  it('400 con ganancia de 11 valores, categoría inválida, duración 80 y nulls no admitidos', async () => {
    const { token, campId } = await preparar('rod-400');
    const post = (b: object) =>
      http().post(`/campanas/${campId}/rodeos`).set(auth(token)).send(b);
    expect((await post({ nombre: 'R', ganancia: Array(11).fill(0.5) })).status).toBe(400);
    expect((await post({ nombre: 'R', categoria: 'Vaca lechera' })).status).toBe(400);
    expect((await post({ nombre: 'R', duracionServicio: 80 })).status).toBe(400);
    expect((await post({ nombre: 'R', inicioServicio: '10/10/2026' })).status).toBe(400);
    expect((await post({ nombre: 'R', usaCocimano: null })).status).toBe(400);
    expect((await post({ nombre: 'R', duracionServicio: null })).status).toBe(400);
    expect((await post({ nombre: 'R', ganancia: null })).status).toBe(400);
    const r = await post({ nombre: 'R' });
    const patch = (b: object) =>
      http().patch(`/campanas/${campId}/rodeos/${r.body.data.id}`).set(auth(token)).send(b);
    expect((await patch({ nombre: null })).status).toBe(400);
    expect((await patch({ usaCocimano: null })).status).toBe(400);
    expect((await patch({ ganancia: null })).status).toBe(400);
    expect((await patch({ duracionServicio: null })).status).toBe(400);
    const lista = await http().get(`/campanas/${campId}/rodeos`).set(auth(token));
    expect(lista.body.data).toHaveLength(1);
  });

  it('PATCH de rodeo cambia campos y permite poner null en los nullable', async () => {
    const { token, campId } = await preparar('rod-patch');
    const r = await http()
      .post(`/campanas/${campId}/rodeos`)
      .set(auth(token))
      .send({ nombre: 'R', categoria: 'Vaca', pesoVivo: 420.5 });
    const res = await http()
      .patch(`/campanas/${campId}/rodeos/${r.body.data.id}`)
      .set(auth(token))
      .send({ categoria: null, pesoVivo: 400, usaCocimano: false, destete: '2026-03-01' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      categoria: null,
      pesoVivo: 400,
      usaCocimano: false,
      destete: '2026-03-01',
    });
  });

  it('crea un pastoreo completo y lo edita (salida y evManual)', async () => {
    const { token, campId, loteId } = await preparar('past-ok');
    const r = await http().post(`/campanas/${campId}/rodeos`).set(auth(token)).send({ nombre: 'R' });
    const rodeoId = r.body.data.id;
    const body = {
      loteId,
      rodeoId,
      cabezas: 50,
      entrada: '2026-03-01',
      salida: '2026-03-31',
      categoriaTabla1Id: 'vaca-seca',
    };
    const res = await http().post(`/campanas/${campId}/pastoreos`).set(auth(token)).send(body);
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ id: expect.any(String), ...body, evManual: null });
    const patch = await http()
      .patch(`/campanas/${campId}/pastoreos/${res.body.data.id}`)
      .set(auth(token))
      .send({ salida: '2026-04-15', evManual: 1.2 });
    expect(patch.status).toBe(200);
    expect(patch.body.data).toEqual({
      ...res.body.data,
      salida: '2026-04-15',
      evManual: 1.2,
    });
    const lista = await http().get(`/campanas/${campId}/pastoreos`).set(auth(token));
    expect(lista.body.data).toEqual([patch.body.data]);
  });

  it('Review Focus 3: pastoreo con solo loteId se guarda y vuelve en GET /campanas/:id', async () => {
    const { token, campId, loteId } = await preparar('past-medio');
    const res = await http().post(`/campanas/${campId}/pastoreos`).set(auth(token)).send({ loteId });
    expect(res.status).toBe(201);
    const get = await http().get(`/campanas/${campId}`).set(auth(token));
    expect(get.body.data.pastoreos).toEqual([
      {
        id: res.body.data.id,
        loteId,
        rodeoId: null,
        cabezas: null,
        entrada: null,
        salida: null,
        categoriaTabla1Id: null,
        evManual: null,
      },
    ]);
    expect(calcularCampana(get.body.data).filas).toHaveLength(1);
  });

  it('acepta un pastoreo con salida anterior a entrada', async () => {
    const { token, campId, loteId } = await preparar('past-inv');
    const res = await http()
      .post(`/campanas/${campId}/pastoreos`)
      .set(auth(token))
      .send({ loteId, entrada: '2026-05-10', salida: '2026-05-01' });
    expect(res.status).toBe(201);
  });

  it('400 en pastoreo con cabezas 0, fecha mal formada y evManual 0', async () => {
    const { token, campId, loteId } = await preparar('past-400');
    const post = (b: object) =>
      http().post(`/campanas/${campId}/pastoreos`).set(auth(token)).send(b);
    expect((await post({ loteId, cabezas: 0 })).status).toBe(400);
    expect((await post({ loteId, entrada: '1/3/2026' })).status).toBe(400);
    expect((await post({ loteId, evManual: 0 })).status).toBe(400);
  });

  it('Review Focus 2: rodeo de otra campaña o lote de otro campo da 400 y no guarda', async () => {
    const { token, campId, loteId } = await preparar('past-ajeno');
    const otra = await http().post('/campanas').set(auth(token)).send({ anio: 2027 });
    const rAjeno = await http()
      .post(`/campanas/${otra.body.data.id}/rodeos`)
      .set(auth(token))
      .send({ nombre: 'Otro' });
    const propio = await http()
      .post(`/campanas/${campId}/pastoreos`)
      .set(auth(token))
      .send({ loteId });

    const a = await http()
      .post(`/campanas/${campId}/pastoreos`)
      .set(auth(token))
      .send({ loteId, rodeoId: rAjeno.body.data.id });
    expect(a.status).toBe(400);
    expect(a.body.message).toBe('El rodeo no existe.');
    const aPatch = await http()
      .patch(`/campanas/${campId}/pastoreos/${propio.body.data.id}`)
      .set(auth(token))
      .send({ rodeoId: rAjeno.body.data.id });
    expect(aPatch.status).toBe(400);
    expect(aPatch.body.message).toBe('El rodeo no existe.');

    const otroCampo = await registrarConCampo(app, 'past-ajeno-b');
    const loteB = await http()
      .post('/lotes')
      .set(auth(otroCampo.token))
      .send({ nombre: 'LB', hectareas: 5 });
    const b = await http()
      .post(`/campanas/${campId}/pastoreos`)
      .set(auth(token))
      .send({ loteId: loteB.body.data.id });
    expect(b.status).toBe(400);
    expect(b.body.message).toBe('El lote no existe.');
    const bPatch = await http()
      .patch(`/campanas/${campId}/pastoreos/${propio.body.data.id}`)
      .set(auth(token))
      .send({ loteId: loteB.body.data.id });
    expect(bPatch.status).toBe(400);
    expect(bPatch.body.message).toBe('El lote no existe.');

    const get = await http().get(`/campanas/${campId}`).set(auth(token));
    expect(get.body.data.pastoreos).toEqual([propio.body.data]);
  });

  it('borrar un rodeo con pastoreos da 409; sin pastoreos da 204', async () => {
    const { token, campId, loteId } = await preparar('rod-del');
    const r = await http().post(`/campanas/${campId}/rodeos`).set(auth(token)).send({ nombre: 'R' });
    const rodeoId = r.body.data.id;
    const p = await http()
      .post(`/campanas/${campId}/pastoreos`)
      .set(auth(token))
      .send({ loteId, rodeoId });
    const bloqueado = await http().delete(`/campanas/${campId}/rodeos/${rodeoId}`).set(auth(token));
    expect(bloqueado.status).toBe(409);
    expect(bloqueado.body.message).toBe('El rodeo tiene pastoreos cargados.');
    const delP = await http()
      .delete(`/campanas/${campId}/pastoreos/${p.body.data.id}`)
      .set(auth(token));
    expect(delP.status).toBe(204);
    const delR = await http().delete(`/campanas/${campId}/rodeos/${rodeoId}`).set(auth(token));
    expect(delR.status).toBe(204);
  });

  it('rutas con el id de otra campaña o inexistente dan 404', async () => {
    const { token, campId, loteId } = await preparar('past-404');
    const otra = await http().post('/campanas').set(auth(token)).send({ anio: 2027 });
    const p = await http().post(`/campanas/${campId}/pastoreos`).set(auth(token)).send({ loteId });
    const r = await http().post(`/campanas/${campId}/rodeos`).set(auth(token)).send({ nombre: 'R' });
    const o = otra.body.data.id;
    for (const res of [
      await http().patch(`/campanas/${o}/pastoreos/${p.body.data.id}`).set(auth(token)).send({}),
      await http().delete(`/campanas/${o}/pastoreos/${p.body.data.id}`).set(auth(token)),
      await http().patch(`/campanas/${o}/rodeos/${r.body.data.id}`).set(auth(token)).send({}),
      await http().delete(`/campanas/${o}/rodeos/${r.body.data.id}`).set(auth(token)),
      await http().delete(`/campanas/${campId}/pastoreos/${randomUUID()}`).set(auth(token)),
    ]) {
      expect(res.status).toBe(404);
    }
    const sinCampana = await http().get(`/campanas/${randomUUID()}/rodeos`).set(auth(token));
    expect(sinCampana.status).toBe(404);
    expect(sinCampana.body.message).toBe('Campaña no encontrada.');
  });

  it('campaña de otro campo del mismo usuario da 404 en rodeos y pastoreos', async () => {
    const { token, campoId: campoA } = await registrarConCampo(app, 'rod-multi');
    await http()
      .post('/auth/farm/create')
      .set(auth(token))
      .send({ farm_name: 'Campo B', provincia: 'La Pampa' });
    const cb = await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    await http().patch(`/auth/farm/${campoA}/active`).set(auth(token));
    const id = cb.body.data.id;
    expect((await http().get(`/campanas/${id}/rodeos`).set(auth(token))).status).toBe(404);
    expect((await http().get(`/campanas/${id}/pastoreos`).set(auth(token))).status).toBe(404);
    expect(
      (await http().post(`/campanas/${id}/rodeos`).set(auth(token)).send({ nombre: 'R' })).status,
    ).toBe(404);
  });

  it('GET /campanas/:id devuelve rodeos y pastoreos con la forma exacta y el motor calcula una fila por pastoreo', async () => {
    const { token, campId, loteId } = await preparar('past-motor');
    const ganancia = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    const r = await http()
      .post(`/campanas/${campId}/rodeos`)
      .set(auth(token))
      .send({
        nombre: 'Vacas',
        categoria: 'Vaca',
        pesoVivo: 420.5,
        ganancia,
        inicioServicio: '2026-11-01',
        duracionServicio: 60,
        destete: '2026-03-15',
        usaCocimano: false,
      });
    const rodeoId = r.body.data.id;
    const p1 = await http()
      .post(`/campanas/${campId}/pastoreos`)
      .set(auth(token))
      .send({
        loteId,
        rodeoId,
        cabezas: 50,
        entrada: '2026-03-01',
        salida: '2026-03-31',
        categoriaTabla1Id: 'vaca-seca',
        evManual: 1.25,
      });
    const p2 = await http().post(`/campanas/${campId}/pastoreos`).set(auth(token)).send({ loteId });

    const get = await http().get(`/campanas/${campId}`).set(auth(token));
    expect(get.status).toBe(200);
    expect(get.body.data.rodeos).toEqual([
      {
        id: rodeoId,
        nombre: 'Vacas',
        categoria: 'Vaca',
        pesoVivo: 420.5,
        ganancia,
        inicioServicio: '2026-11-01',
        duracionServicio: 60,
        destete: '2026-03-15',
        usaCocimano: false,
      },
    ]);
    expect(get.body.data.pastoreos).toEqual([
      {
        id: p1.body.data.id,
        loteId,
        rodeoId,
        cabezas: 50,
        entrada: '2026-03-01',
        salida: '2026-03-31',
        categoriaTabla1Id: 'vaca-seca',
        evManual: 1.25,
      },
      {
        id: p2.body.data.id,
        loteId,
        rodeoId: null,
        cabezas: null,
        entrada: null,
        salida: null,
        categoriaTabla1Id: null,
        evManual: null,
      },
    ]);
    expect(get.body.data.rodeos[0].ganancia).toHaveLength(12);
    const calculo = calcularCampana(get.body.data);
    expect(calculo.filas).toHaveLength(2);
  });

  it('400 (no 500) con números fuera del rango de la columna', async () => {
    const { token, campId, loteId } = await preparar('rango');
    const rod = (b: object) =>
      http().post(`/campanas/${campId}/rodeos`).set(auth(token)).send({ nombre: 'R', ...b });
    const pas = (b: object) =>
      http().post(`/campanas/${campId}/pastoreos`).set(auth(token)).send({ loteId, ...b });
    expect((await rod({ pesoVivo: 1e9 })).status).toBe(400);
    expect((await rod({ pesoVivo: 100000 })).status).toBe(400);
    expect((await pas({ evManual: 1000 })).status).toBe(400);
    expect((await pas({ evManual: 1.2345 })).status).toBe(400);
    expect((await pas({ cabezas: 1e12 })).status).toBe(400);
    expect((await pas({ cabezas: 2147483648 })).status).toBe(400);
    expect((await rod({ pesoVivo: 99999.99 })).status).toBe(201);
    expect((await pas({ evManual: 999.999, cabezas: 2147483647 })).status).toBe(201);
    const l = await http().post('/lotes').set(auth(token)).send({ nombre: 'Grande', hectareas: 1e9 });
    expect(l.status).toBe(400);
    const p = await http().post('/potreros').set(auth(token)).send({ nombre: 'P', hectareas: 1e9 });
    expect(p.status).toBe(400);
    const ok = await http().post('/lotes').set(auth(token)).send({ nombre: 'OK', hectareas: 99999999.99 });
    expect(ok.status).toBe(201);
    expect(
      (await http().patch(`/lotes/${ok.body.data.id}`).set(auth(token)).send({ hectareas: 1e9 })).status,
    ).toBe(400);
  });

  it('400 con fechas que no son aaaa-mm-dd (datetime ISO)', async () => {
    const { token, campId, loteId } = await preparar('fecha');
    const dt = '2026-03-01T10:00:00Z';
    const pas = await http()
      .post(`/campanas/${campId}/pastoreos`)
      .set(auth(token))
      .send({ loteId, entrada: dt });
    expect(pas.status).toBe(400);
    expect(
      (await http().post(`/campanas/${campId}/pastoreos`).set(auth(token)).send({ loteId, salida: dt })).status,
    ).toBe(400);
    expect(
      (await http().post(`/campanas/${campId}/rodeos`).set(auth(token)).send({ nombre: 'R', destete: dt })).status,
    ).toBe(400);
    const r = await http()
      .post(`/campanas/${campId}/rodeos`)
      .set(auth(token))
      .send({ nombre: 'R' });
    expect(
      (await http().patch(`/campanas/${campId}/rodeos/${r.body.data.id}`).set(auth(token)).send({ inicioServicio: dt })).status,
    ).toBe(400);
  });
});
