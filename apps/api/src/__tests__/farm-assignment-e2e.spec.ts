import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from 'src/app.module';

describe('Farm Assignment (Full Scenario E2E)', () => {
  jest.setTimeout(30000);

  let app: INestApplication;

  // Unique per run so the suite can be re-run against the same database.
  const runId = randomUUID().slice(0, 8);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scenario 1: Admin creates farm, Tech joins, both manage access', () => {
    let adminToken: string;
    let techToken: string;
    let farmId: string;
    let joinCode: string;

    it('Step 1: admin signs up', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: `admin-${runId}@scenario.com`, password: 'SecurePass123' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: { id: expect.any(String), email: `admin-${runId}@scenario.com` },
      });
      adminToken = response.body.accessToken;
    });

    it('Step 2: admin creates a farm', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/farm/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ farm_name: 'Estancia La Esperanza', provincia: 'La Pampa' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        farm_id: expect.any(String),
        farm_name: 'Estancia La Esperanza',
        provincia: 'La Pampa',
        role: 'admin',
        active: true,
        join_code: expect.stringMatching(/^[A-Za-z0-9]{8,12}$/),
      });
      farmId = response.body.farm_id;
      joinCode = response.body.join_code;
    });

    it('Step 3: technician signs up', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: `tech-${runId}@scenario.com`, password: 'SecurePass123' });

      expect(response.status).toBe(201);
      techToken = response.body.accessToken;
    });

    it('Step 4: technician joins the farm via code', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/farm/join')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ join_code: joinCode });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        farm_id: farmId,
        farm_name: 'Estancia La Esperanza',
        provincia: 'La Pampa',
        role: 'tecnico',
        active: false,
      });
    });

    it('Step 5: both list their farms', async () => {
      const adminList = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminList.status).toBe(200);
      expect(adminList.body.farms).toEqual([
        expect.objectContaining({ farm_id: farmId, role: 'admin', active: true }),
      ]);

      const techList = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${techToken}`);
      expect(techList.status).toBe(200);
      expect(techList.body.farms).toEqual([
        expect.objectContaining({ farm_id: farmId, role: 'tecnico', active: false }),
      ]);
    });

    it('Step 6: technician activates the farm', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/auth/farm/${farmId}/active`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ farm_id: farmId, active: true });

      const list = await request(app.getHttpServer())
        .get('/auth/farms')
        .set('Authorization', `Bearer ${techToken}`);
      expect(list.body.farms).toEqual([
        expect.objectContaining({ farm_id: farmId, active: true }),
      ]);
    });

    it('Step 7: technician registers a device', async () => {
      const response = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${techToken}`)
        .send({ device_token: `tech-device-${runId}`, platform: 'android' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        device_token_id: expect.any(String),
        device_token: `tech-device-${runId}`,
        platform: 'android',
      });
    });

    it('Step 8: admin generates a new join code', async () => {
      const response = await request(app.getHttpServer())
        .post(`/auth/farm/${farmId}/join-code`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      expect(response.body.join_code).toMatch(/^[A-Za-z0-9]{8,12}$/);
      expect(response.body.join_code).not.toBe(joinCode);
    });

    it('Step 9: technician cannot generate a join code (403)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/auth/farm/${farmId}/join-code`)
        .set('Authorization', `Bearer ${techToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Scenario 2: Device registration and management', () => {
    let userToken: string;
    let iosDeviceId: string;

    beforeAll(async () => {
      const signup = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: `devices-${runId}@scenario.com`, password: 'SecurePass123' });
      expect(signup.status).toBe(201);
      userToken = signup.body.accessToken;
    });

    it('registers multiple devices for one user', async () => {
      const ios = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: `ios-${runId}`, platform: 'ios' });
      expect(ios.status).toBe(201);
      iosDeviceId = ios.body.device_token_id;

      const android = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: `android-${runId}`, platform: 'android' });
      expect(android.status).toBe(201);
      expect(android.body.device_token_id).not.toBe(iosDeviceId);
    });

    it('rejects a duplicate device token (409)', async () => {
      const response = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: `ios-${runId}`, platform: 'ios' });

      expect(response.status).toBe(409);
    });

    it('deregisters a device (204)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/device-tokens/${iosDeviceId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(204);
    });

    it('can re-register a token after deregistering it', async () => {
      const response = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: `ios-${runId}`, platform: 'ios' });

      expect(response.status).toBe(201);
    });
  });
});
