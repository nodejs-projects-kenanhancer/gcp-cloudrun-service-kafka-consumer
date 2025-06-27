import { Module } from '@nestjs/common';
import { KafkaConsumerModule } from './commands/kafka-consumer';

@Module({
  imports: [KafkaConsumerModule],
  exports: [KafkaConsumerModule],
})
export class CliModule {}
