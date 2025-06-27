import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { KafkaMessage } from 'kafkajs';
import { AppSettings } from '../config';
import { PubSubService } from '../pubsub';
import { KafkaTls } from './value-objects';

@Injectable()
export class KafkaMessageProcessor {
  private readonly logger = new Logger(KafkaMessageProcessor.name);

  constructor(
    private readonly appSettings: AppSettings,
    private readonly KafkaTls: KafkaTls,
    private readonly pubSubService: PubSubService,
  ) {}

  async processMessage(
    topic: string,
    partition: number,
    message: KafkaMessage,
  ): Promise<void> {
    try {
      const messageId = this.extractMessageId(message.headers) || randomUUID();
      this.logger.debug(
        `Processing message: ${messageId} from topic: ${topic}`,
        {
          messageId,
          topic,
          partition,
        },
      );

      // Parse message headers
      const headers = this.parseHeaders(message.headers);

      // Decode message value
      const value = await this.decodeMessage(message);

      // Create a structured message object
      const messageData = {
        id: messageId,
        topic,
        partition,
        offset: message.offset,
        timestamp: message.timestamp
          ? new Date(parseInt(message.timestamp)).toISOString()
          : new Date().toISOString(),
        key: message.key ? message.key.toString() : undefined,
        value,
        headers,
      };

      // Log message details at debug level (useful for development)
      this.logger.debug(`📨 Received Kafka message details`, {
        messageId: messageData.id,
        topic,
        partition,
        offset: message.offset,
      });

      // Log full message content at debug level (verbose but useful for development)
      this.logger.debug(
        `Full message content: ${JSON.stringify(messageData, null, 2)}`,
      );

      const pubSubTopicName = this.appSettings.pubsubSettings.topicName;

      // Publish the message to Pub/Sub
      const pubSubMessageId = await this.pubSubService.publishMessage(
        pubSubTopicName,
        messageData,
        {
          sourceKafkaTopic: topic,
          messageId: messageData.id,
        },
      );

      // Use info level for operational success logging
      this.logger.log(
        `Message processed: ${messageId} from Kafka topic "${topic}" to Pub/Sub topic "${pubSubTopicName}" (${pubSubMessageId})`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing message from topic ${topic}: ${error.message}`,
        error.stack,
      );
    }
  }

  private extractMessageId(
    headers: KafkaMessage['headers'],
  ): string | undefined {
    if (!headers || !headers.messageId) return undefined;

    const messageIdBuffer = headers.messageId;
    return Buffer.isBuffer(messageIdBuffer)
      ? messageIdBuffer.toString()
      : String(messageIdBuffer);
  }

  private parseHeaders(
    messageHeaders: KafkaMessage['headers'],
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!messageHeaders) {
      this.logger.debug('No headers present in the message');
      return headers;
    }

    for (const [key, value] of Object.entries(messageHeaders)) {
      if (value !== null && value !== undefined) {
        headers[key] = Buffer.isBuffer(value)
          ? value.toString()
          : String(value);
      }
    }

    return headers;
  }

  private async decodeMessage(message: KafkaMessage): Promise<any> {
    if (!message.value) {
      this.logger.debug('Message value is null or empty');
      return null;
    }

    const {
      kafkaSettings: { brokerHost, brokerSchemaRegistryPort },
    } = this.appSettings;
    const { username, password } = this.KafkaTls;
    const broker = `${brokerHost}:${brokerSchemaRegistryPort}`;
    const username_password = `${username}:${password}`;

    this.logger.debug(
      `Attempting to decode message using schema registry at ${brokerHost}`,
    );

    try {
      const registry = new SchemaRegistry({
        host: `https://${username_password}@${broker}`,
      });

      return await registry.decode(message.value);
    } catch (error) {
      this.logger.error(
        `Failed to decode message: ${error.message}`,
        error.stack,
      );
      // Return null or a default value when decoding fails
      return null;
    }
  }
}
