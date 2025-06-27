import { Module } from '@nestjs/common';
import { PubSubModule } from '../pubsub';
import { KafkaClientFactory } from './kafka-client.factory';
import { KafkaConsumerService } from './kafka-consumer.service';
import { KafkaCredentialsService } from './kafka-credentials.service';
import { KafkaMessageProcessor } from './kafka-message.processor';
import { KafkaTls } from './value-objects';

@Module({
  imports: [PubSubModule],
  providers: [
    KafkaConsumerService,
    KafkaClientFactory,
    KafkaMessageProcessor,
    KafkaCredentialsService,
    {
      provide: KafkaTls,
      useFactory: async (kafkaCredentialsService: KafkaCredentialsService) => {
        const credentials =
          await kafkaCredentialsService.getKafkaCredentialsFromGcpSecret();
        return credentials;
      },
      inject: [KafkaCredentialsService],
    },
  ],
  exports: [KafkaConsumerService],
})
export class KafkaModule {}
