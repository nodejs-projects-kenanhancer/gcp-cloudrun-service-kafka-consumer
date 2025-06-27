import { Controller, Get } from '@nestjs/common';
import { KafkaConsumerService } from '../../../infrastructure';

@Controller('health')
export class HealthController {
  constructor(private readonly kafkaService: KafkaConsumerService) {}

  @Get()
  getHealth() {
    const isConnected = this.kafkaService.isConnectedToKafka();
    const status = this.kafkaService.getStatus();

    return {
      status: isConnected ? 'ok' : 'degraded',
      kafka: status,
      timestamp: new Date().toISOString(),
      version: process.env.VERSION || 'dev',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
