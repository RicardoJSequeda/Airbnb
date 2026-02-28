import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, SubscriptionStatus } from '../prisma-enums';
import { SubscriptionGuard } from './subscription.guard';
import { PrismaService } from '../prisma.service';

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;
  let reflector: Reflector;
  let prisma: PrismaService;

  const createMockContext = (user: object | null = null) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            subscription: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    guard = module.get<SubscriptionGuard>(SubscriptionGuard);
    reflector = module.get<Reflector>(Reflector);
    prisma = module.get<PrismaService>(PrismaService);

    jest.mocked(reflector.getAllAndOverride).mockReturnValue(false);
  });

  it('debería permitir rutas públicas', async () => {
    jest.mocked(reflector.getAllAndOverride).mockReturnValue(true);

    const result = await guard.canActivate(createMockContext(null));

    expect(result).toBe(true);
    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
  });

  it('debería permitir cuando no hay usuario', async () => {
    const result = await guard.canActivate(createMockContext(null));

    expect(result).toBe(true);
    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
  });

  it('debería permitir SUPER_ADMIN', async () => {
    const result = await guard.canActivate(
      createMockContext({
        userId: 'admin-1',
        role: UserRole.SUPER_ADMIN,
        organizationId: null,
      }),
    );

    expect(result).toBe(true);
    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
  });

  it('debería permitir cuando el usuario no tiene organizationId', async () => {
    const result = await guard.canActivate(
      createMockContext({
        userId: 'user-1',
        role: UserRole.GUEST,
        organizationId: null,
      }),
    );

    expect(result).toBe(true);
    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
  });

  it('debería lanzar 403 con SUBSCRIPTION_INACTIVE cuando no existe subscription', async () => {
    jest.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createMockContext({
          userId: 'user-1',
          role: UserRole.GUEST,
          organizationId: 'org-1',
        }),
      ),
    ).rejects.toThrow(ForbiddenException);

    try {
      await guard.canActivate(
        createMockContext({
          userId: 'user-1',
          role: UserRole.GUEST,
          organizationId: 'org-1',
        }),
      );
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
      expect(e.getResponse()).toMatchObject({
        message: 'Organization has no subscription',
        errorCode: 'SUBSCRIPTION_INACTIVE',
      });
    }
  });

  it('debería lanzar 403 con SUBSCRIPTION_INACTIVE cuando status es CANCELED', async () => {
    jest.mocked(prisma.subscription.findFirst).mockResolvedValue({
      id: 'sub-1',
      organizationId: 'org-1',
      status: SubscriptionStatus.CANCELED,
      plan: 'FREE',
      stripeCustomerId: null,
      currentPeriodEnd: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await expect(
      guard.canActivate(
        createMockContext({
          userId: 'user-1',
          role: UserRole.GUEST,
          organizationId: 'org-1',
        }),
      ),
    ).rejects.toThrow(ForbiddenException);

    try {
      await guard.canActivate(
        createMockContext({
          userId: 'user-1',
          role: UserRole.GUEST,
          organizationId: 'org-1',
        }),
      );
    } catch (e) {
      expect(e.getResponse()).toMatchObject({
        message: 'Subscription is not active',
        errorCode: 'SUBSCRIPTION_INACTIVE',
      });
    }
  });

  it('debería lanzar 403 con SUBSCRIPTION_INACTIVE cuando status es PAST_DUE', async () => {
    jest.mocked(prisma.subscription.findFirst).mockResolvedValue({
      id: 'sub-1',
      organizationId: 'org-1',
      status: SubscriptionStatus.PAST_DUE,
      plan: 'PRO',
      stripeCustomerId: null,
      currentPeriodEnd: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await expect(
      guard.canActivate(
        createMockContext({
          userId: 'user-1',
          role: UserRole.HOST,
          organizationId: 'org-1',
        }),
      ),
    ).rejects.toThrow(ForbiddenException);

    try {
      await guard.canActivate(
        createMockContext({
          userId: 'user-1',
          role: UserRole.HOST,
          organizationId: 'org-1',
        }),
      );
    } catch (e) {
      expect(e.getResponse()).toMatchObject({
        errorCode: 'SUBSCRIPTION_INACTIVE',
      });
    }
  });

  it('debería permitir cuando subscription.status es ACTIVE', async () => {
    jest.mocked(prisma.subscription.findFirst).mockResolvedValue({
      id: 'sub-1',
      organizationId: 'org-1',
      status: SubscriptionStatus.ACTIVE,
      plan: 'FREE',
      stripeCustomerId: null,
      currentPeriodEnd: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await guard.canActivate(
      createMockContext({
        userId: 'user-1',
        role: UserRole.GUEST,
        organizationId: 'org-1',
      }),
    );

    expect(result).toBe(true);
    expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      orderBy: { createdAt: 'desc' },
    });
  });
});
