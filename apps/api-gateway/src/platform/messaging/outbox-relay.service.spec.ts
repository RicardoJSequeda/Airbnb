import { OutboxRelayService } from './outbox-relay.service';
import type { PrismaOutboxClient } from './infrastructure/prisma-outbox.client';

describe('OutboxRelayService', () => {
  it('publishes and marks processed event', async () => {
    const outboxEvent = {
      findMany: jest.fn().mockResolvedValueOnce([
        {
          id: 'e1',
          aggregateId: 'b1',
          type: 'booking.created',
          version: 'v1',
          payload: { bookingId: 'b1' },
          retryCount: 0,
        },
      ]),
      update: jest.fn().mockResolvedValue({}),
    };

    const prismaMock = {
      outboxEvent,
      outboxDeadLetter: { create: jest.fn() },
      $queryRawUnsafe: jest
        .fn()
        .mockResolvedValueOnce([{ id: 'e1' }])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([{ seconds: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValue([{ total: 0 }]),
    } as unknown as PrismaOutboxClient;

    const kafkaMock = {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as { publish: jest.Mock };

    const metricsMock = {
      inc: jest.fn(),
      setGauge: jest.fn(),
    } as unknown as { inc: jest.Mock; setGauge: jest.Mock };

    const configMock = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          OUTBOX_RELAY_BATCH_SIZE: '1',
          OUTBOX_MAX_ATTEMPTS: '3',
          OUTBOX_RETRY_BASE_MS: '10',
          OUTBOX_RETRY_MAX_MS: '100',
          OUTBOX_RELAY_ENABLED: 'false',
        };
        return values[key];
      }),
    } as unknown as { get: jest.Mock };

    const service = new OutboxRelayService(
      prismaMock,
      kafkaMock as never,
      { dispatch: jest.fn() } as never,
      metricsMock,
      configMock as never,
    );
    await service.flushPendingEvents();

    expect(kafkaMock.publish).toHaveBeenCalled();
    expect(outboxEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'e1' },
      }),
    );
  });
});
