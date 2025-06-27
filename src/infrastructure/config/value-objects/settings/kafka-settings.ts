import { KafkaConsumerSettings } from './kafka-consumer-settings';
import { KafkaTlsSecretSettings } from './kafka-tls-secret-settings';

export class KafkaSettings {
  constructor(
    readonly brokerHost: string,
    readonly brokerPort: string,
    readonly brokerSchemaRegistryPort: string,
    readonly consumerGroup: string,
    readonly topics: string,
    readonly fromBeginning: boolean,
    readonly monitoringIntervalMs: number,
    readonly tlsSecrets: KafkaTlsSecretSettings,
    readonly consumer: KafkaConsumerSettings,
  ) {}
}
