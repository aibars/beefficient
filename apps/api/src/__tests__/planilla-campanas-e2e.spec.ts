import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { calcularCampana } from '@beefficient/domain';
import { crearAppDePrueba, registrarConCampo } from './helpers/planilla-app';

describe('Planilla: campañas (e2e)', () => {
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

  it('crea la campaña 2026 sin parámetros con los valores por defecto', async () => {
    const { token } = await registrarConCampo(app, 'camp-def');
    const res = await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      id: expect.any(String),
      anio: 2026,
      mesServicio: 1,
      eficienciaCosecha: 50,
    });
  });

  it('lista las campañas por año descendente', async () => {
    const { token } = await registrarConCampo(app, 'camp-lista');
    await http().post('/campanas').set(auth(token)).send({ anio: 2025 });
    await http().post('/campanas').set(auth(token)).send({ anio: 2027 });
    await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    const res = await http().get('/campanas').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.map((c: { anio: number }) => c.anio)).toEqual([2027, 2026, 2025]);
  });

  it('409 al repetir el año; 400 con mesServicio 13 y eficienciaCosecha 0', async () => {
    const { token } = await registrarConCampo(app, 'camp-val');
    await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    const dup = await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    expect(dup.status).toBe(409);
    expect(dup.body.message).toBe('Ya existe la campaña 2026.');
    const mes = await http().post('/campanas').set(auth(token)).send({ anio: 2030, mesServicio: 13 });
    expect(mes.status).toBe(400);
    const ef = await http().post('/campanas').set(auth(token)).send({ anio: 2030, eficienciaCosecha: 0 });
    expect(ef.status).toBe(400);
  });

  it('PATCH cambia mesServicio y guarda supuestos; GET devuelve la forma del motor', async () => {
    const { token } = await registrarConCampo(app, 'camp-get');
    await http().post('/lotes').set(auth(token)).send({ nombre: 'L1', hectareas: 10 });
    const c = await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    const id = c.body.data.id;
    const patch = await http()
      .patch(`/campanas/${id}`)
      .set(auth(token))
      .send({ mesServicio: 11, supuestos: { gestacion: 280 } });
    expect(patch.status).toBe(200);
    expect(patch.body.data).toEqual({ id, anio: 2026, mesServicio: 11, eficienciaCosecha: 50 });

    const res = await http().get(`/campanas/${id}`).set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      id,
      anio: 2026,
      mesServicio: 11,
      eficienciaCosecha: 50,
      lotes: [{ id: expect.any(String), nombre: 'L1', hectareas: 10 }],
      rodeos: [],
      pastoreos: [],
      supuestos: { gestacion: 280 },
    });
    expect(res.body.data).not.toHaveProperty('tabla1');
    expect(res.body.data).not.toHaveProperty('consumo');

    // contrato con el motor
    const calculo = calcularCampana(res.body.data);
    expect(calculo.filas).toEqual([]);
  });

  it('PATCH con null limpia tabla1/consumo/supuestos', async () => {
    const { token } = await registrarConCampo(app, 'camp-null');
    const c = await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    const id = c.body.data.id;
    await http().patch(`/campanas/${id}`).set(auth(token)).send({ supuestos: { gestacion: 280 } });
    await http().patch(`/campanas/${id}`).set(auth(token)).send({ supuestos: null });
    const res = await http().get(`/campanas/${id}`).set(auth(token));
    expect(res.body.data).not.toHaveProperty('supuestos');
  });

  it('Review Focus 1: la campaña de otro campo del mismo usuario da 404', async () => {
    const { token, campoId: campoA } = await registrarConCampo(app, 'camp-multi');
    await http()
      .post('/auth/farm/create')
      .set(auth(token))
      .send({ farm_name: 'Campo B', provincia: 'La Pampa' });
    const cb = await http().post('/campanas').set(auth(token)).send({ anio: 2026 });
    expect(cb.status).toBe(201);
    const id = cb.body.data.id;
    await http().patch(`/auth/farm/${campoA}/active`).set(auth(token));

    const get = await http().get(`/campanas/${id}`).set(auth(token));
    expect(get.status).toBe(404);
    expect(get.body.message).toBe('Campaña no encontrada.');
    const patch = await http().patch(`/campanas/${id}`).set(auth(token)).send({ mesServicio: 3 });
    expect(patch.status).toBe(404);
    const lista = await http().get('/campanas').set(auth(token));
    expect(lista.body.data).toEqual([]);
  });
});
