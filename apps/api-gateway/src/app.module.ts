import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RedisModule } from './common/redis.module';
import { HealthModule } from './health/health.module';
import { BookingsContextModule } from './contexts/bookings/bookings-context.module';
import { PaymentsContextModule } from './contexts/payments/payments-context.module';
import { UsersContextModule } from './contexts/users/users-context.module';
import { ListingsContextModule } from './contexts/listings/listings-context.module';
import { PlatformModule } from './platform/platform.module';
import { CorrelationIdInterceptor } from './platform/observability/correlation-id.interceptor';
import { IdempotencyInterceptor } from './platform/idempotency/idempotency.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    RedisModule,
    HealthModule,
    PlatformModule,
    UsersContextModule,
    ListingsContextModule,
    BookingsContextModule,
    PaymentsContextModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule {}
