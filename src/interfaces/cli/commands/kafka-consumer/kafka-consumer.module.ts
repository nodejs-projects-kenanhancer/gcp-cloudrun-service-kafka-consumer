import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService, KafkaModule } from '../../../../infrastructure';

@Module({
  imports: [KafkaModule],
  providers: [],
  exports: [],
})
export class KafkaConsumerModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerModule.name);

  constructor(private readonly kafkaConsumerService: KafkaConsumerService) {}

  async onModuleInit() {
    try {
      this.kafkaConsumerService.initialize();
      await this.kafkaConsumerService.connect();
      await this.kafkaConsumerService.subscribeToTopics();
      await this.kafkaConsumerService.startConsumer();
      this.kafkaConsumerService.setupConnectionMonitoring();
    } catch (error) {
      this.logger.error('Failed to initialize Kafka module:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      // Stop connection monitoring
      this.kafkaConsumerService.stopConnectionMonitoring();
      // Disconnect from Kafka
      await this.kafkaConsumerService.disconnect();
    } catch (error) {
      this.logger.error('Error during Kafka module cleanup:', error);
    }
  }
}
