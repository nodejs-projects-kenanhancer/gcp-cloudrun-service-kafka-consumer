import { Injectable, Logger } from '@nestjs/common';
import { Kafka, KafkaConfig } from 'kafkajs';
import { AppSettings } from '../config';
import { KafkaTls } from './value-objects';

@Injectable()
export class KafkaClientFactory {
  private readonly logger = new Logger(KafkaClientFactory.name);

  constructor(
    private readonly appSettings: AppSettings,
    private readonly KafkaTls: KafkaTls,
  ) {}

  createClient(): Kafka {
    const {
      kafkaSettings: { brokerHost, brokerPort },
    } = this.appSettings;

    const kafkaServiceUri = `${brokerHost}:${brokerPort}`;

    const kafkaConfig: KafkaConfig = {
      clientId: `kafka-consumer-${process.env.NODE_ENV}`,
      brokers: [kafkaServiceUri],
      retry: {
        initialRetryTime: 300, // slightly higher retry time
        retries: 10, // more retries for temporary issues
      },
      connectionTimeout: 30000, // 30 seconds timeout to allow for slower connections
      authenticationTimeout: 30000,
    };

    const credentials = this.KafkaTls;

    // Add SSL configuration if authentication is provided
    if (this.KafkaTls) {
      this.logger.log('Using SSL for Kafka connection');

      const { ca, cert, key, rejectUnauthorized } = credentials;
      kafkaConfig.ssl = {
        ca,
        cert,
        key,
        rejectUnauthorized,
      };
    } else {
      this.logger.log('SSL not configured for Kafka connection');
    }

    return new Kafka(kafkaConfig);
  }
}
