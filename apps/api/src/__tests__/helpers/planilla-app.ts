import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from 'src/app.module';

export async function crearAppDePrueba(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app;
}

/** Signup con email único + creación de un campo (queda activo). */
export async function registrarConCampo(
  app: INestApplication,
  etiqueta: string,
): Promise<{ token: string; campoId: string }> {
  const email = `${etiqueta}-${randomUUID().slice(0, 8)}@planilla.test`;
  const signup = await request(app.getHttpServer())
    .post('/auth/signup')
    .send({ email, password: 'SecurePass123' });
  const token: string = signup.body.accessToken;
  const campo = await request(app.getHttpServer())
    .post('/auth/farm/create')
    .set('Authorization', `Bearer ${token}`)
    .send({ farm_name: `Campo ${etiqueta}`, provincia: 'La Pampa' });
  return { token, campoId: campo.body.farm_id };
}
