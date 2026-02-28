import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { SubscriptionStatus } from '../src/common/prisma-enums';

describe('SubscriptionGuard (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let inactiveOrgId: string;
  let inactiveUserId: string;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.setGlobalPrefix('api', { exclude: ['health'] });

    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    const password = await bcrypt.hash('test123456', 10);

    const org = await prisma.organization.create({
      data: {
        name: 'E2E Inactive Subscription Org',
        slug: `e2e-inactive-${Date.now()}`,
      },
    });
    inactiveOrgId = org.id;

    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        plan: 'FREE',
        status: SubscriptionStatus.CANCELED,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: `sub-inactive-${Date.now()}@e2e.test`,
        password,
        name: 'E2E Subscription Test User',
        role: 'HOST',
        organizationId: org.id,
      },
    });
    inactiveUserId = user.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: 'test123456' })
      .expect(201);

    authToken = loginRes.body.token;
  });

  afterEach(async () => {
    if (!prisma || !inactiveUserId || !inactiveOrgId) return;
    try {
      await prisma.user.deleteMany({ where: { id: inactiveUserId } });
      await prisma.subscription.deleteMany({
        where: { organizationId: inactiveOrgId },
      });
      await prisma.organization.deleteMany({ where: { id: inactiveOrgId } });
    } catch {
      // Ignorar errores de limpieza
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería devolver 403 con SUBSCRIPTION_INACTIVE al acceder a ruta protegida con suscripción CANCELED', () => {
    return request(app.getHttpServer())
      .get('/api/dashboard/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403)
      .expect((res) => {
        expect(res.body).toMatchObject({
          success: false,
          errorCode: 'SUBSCRIPTION_INACTIVE',
        });
        expect(res.body.message).toBeDefined();
      });
  });
});
