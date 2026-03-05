import { Module } from '@nestjs/common';
import { BookingsModule } from '../../bookings/bookings.module';
import { BookingsContextService } from './application/bookings-context.service';
import { BOOKINGS_CONTEXT_PORT } from './contracts/bookings-context.port';

@Module({
  imports: [BookingsModule],
  providers: [
    BookingsContextService,
    {
      provide: BOOKINGS_CONTEXT_PORT,
      useExisting: BookingsContextService,
    },
  ],
  exports: [BOOKINGS_CONTEXT_PORT, BookingsContextService],
})
export class BookingsContextModule {}
