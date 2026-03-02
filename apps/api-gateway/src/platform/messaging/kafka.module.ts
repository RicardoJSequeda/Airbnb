import { Module } from '@nestjs/common';
import { KafkaPublisherService } from './kafka.publisher.service';
import { OutboxRelayService } from './outbox-relay.service';

@Module({
  providers: [KafkaPublisherService, OutboxRelayService],
  exports: [KafkaPublisherService, OutboxRelayService],
})
export class KafkaModule {}
