import { IdempotencyService } from './idempotency.service';

describe('IdempotencyService', () => {
  const model = {
    findUnique: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  };

  const prismaMock = {
    idempotencyRecord: model,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reserves new key and then stores response', async () => {
    model.findUnique.mockResolvedValue(null);
    model.create.mockResolvedValue({});
    model.updateMany.mockResolvedValue({ count: 1 });

    const service = new IdempotencyService(prismaMock);
    const reserve = await service.reserve({
      actorId: 'u1',
      operation: 'POST:/bookings',
      method: 'POST',
      path: '/bookings',
      key: 'idem-1',
      payloadHash: service.hashPayload({ a: 1 }),
      ttlSeconds: 60,
    });

    expect(reserve).toBe('reserved');

    await service.saveResponse({
      actorId: 'u1',
      method: 'POST',
      path: '/bookings',
      key: 'idem-1',
      responseCode: 201,
      responseBody: { ok: true },
    });

    expect(model.create).toHaveBeenCalled();
    expect(model.updateMany).toHaveBeenCalled();
  });
});
