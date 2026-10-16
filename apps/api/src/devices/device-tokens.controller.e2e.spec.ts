import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from 'src/app.module';

describe('Device Tokens Controller (E2E)', () => {
  let app: INestApplication;
  let userToken: string;
  let deviceTokenId: string;

  // Unique per run so the suite can be re-run against the same database.
  const runId = randomUUID().slice(0, 8);
  const iosToken = `apns-token-${runId}`;
  const androidToken = `fcm-token-${runId}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: `user-${runId}@device.com`, password: 'SecurePass123' });

    expect(signup.status).toBe(201);
    userToken = signup.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /device-tokens', () => {
    it('should register a device', async () => {
      const response = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: iosToken, platform: 'ios' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        device_token_id: expect.any(String),
        device_token: iosToken,
        platform: 'ios',
      });
      deviceTokenId = response.body.device_token_id;
    });

    it('should reject a duplicate device token with 409', async () => {
      const response = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: iosToken, platform: 'ios' });

      expect(response.status).toBe(409);
    });

    it('should reject an invalid platform with 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: `other-${runId}`, platform: 'windows' });

      expect(response.status).toBe(400);
    });

    it('should register a second (Android) device for the same user', async () => {
      const response = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ device_token: androidToken, platform: 'android' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        device_token: androidToken,
        platform: 'android',
      });
      expect(response.body.device_token_id).not.toBe(deviceTokenId);
    });

    it('should reject unauthenticated requests with 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/device-tokens')
        .send({ device_token: `anon-${runId}`, platform: 'ios' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /device-tokens/:device_token_id', () => {
    it('should deregister a device with 204', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/device-tokens/${deviceTokenId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 when the device does not exist', async () => {
      // The device deleted above no longer exists.
      const response = await request(app.getHttpServer())
        .delete(`/device-tokens/${deviceTokenId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 when the user does not own the device', async () => {
      const otherSignup = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: `other-${runId}@device.com`, password: 'SecurePass123' });
      expect(otherSignup.status).toBe(201);
      const otherToken = otherSignup.body.accessToken;

      const register = await request(app.getHttpServer())
        .post('/device-tokens')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ device_token: `other-device-${runId}`, platform: 'android' });
      expect(register.status).toBe(201);

      const response = await request(app.getHttpServer())
        .delete(`/device-tokens/${register.body.device_token_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
