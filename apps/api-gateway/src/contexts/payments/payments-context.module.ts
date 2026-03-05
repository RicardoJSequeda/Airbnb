import { Module } from '@nestjs/common';
import { PaymentsModule } from '../../payments/payments.module';
import { PaymentsContextService } from './application/payments-context.service';
import { PAYMENTS_CONTEXT_PORT } from './contracts/payments-context.port';

@Module({
  imports: [PaymentsModule],
  providers: [
    PaymentsContextService,
    {
      provide: PAYMENTS_CONTEXT_PORT,
      useExisting: PaymentsContextService,
    },
  ],
  exports: [PAYMENTS_CONTEXT_PORT, PaymentsContextService],
})
export class PaymentsContextModule {}
