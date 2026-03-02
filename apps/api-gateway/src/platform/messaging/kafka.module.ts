import { Module } from '@nestjs/common';
import { KafkaPublisherService } from './kafka.publisher.service';

@Module({
  providers: [KafkaPublisherService],
  exports: [KafkaPublisherService],
})
export class KafkaModule {}
