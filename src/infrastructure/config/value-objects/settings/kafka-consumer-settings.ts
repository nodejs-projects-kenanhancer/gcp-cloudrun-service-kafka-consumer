export class KafkaConsumerSettings {
  constructor(
    readonly monitoringInterval: number, // in milliseconds
    readonly retryDelay: number, // in milliseconds
    readonly batchSize: number,
    readonly fetchMaxBytes: number,
    readonly sessionTimeout: number, // in milliseconds
    readonly heartbeatInterval: number, // in milliseconds
  ) {}
}
