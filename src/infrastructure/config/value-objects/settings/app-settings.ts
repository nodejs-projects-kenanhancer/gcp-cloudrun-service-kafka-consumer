import { BasicSettings } from './basic-settings';
import { KafkaSettings } from './kafka-settings';
import { PubSubSettings } from './pubsub-settings';
import { ServerSettings } from './server-settings';

export class AppSettings {
  constructor(
    readonly basicSettings: BasicSettings,
    readonly serverSettings: ServerSettings,
    readonly kafkaSettings: KafkaSettings,
    readonly pubsubSettings: PubSubSettings,
  ) {}
}
