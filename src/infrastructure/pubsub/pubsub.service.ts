import { PubSub } from '@google-cloud/pubsub';
import { PubsubMessage } from '@google-cloud/pubsub/build/src/publisher';
import { Injectable, Logger } from '@nestjs/common';
import { AppSettings } from '../config';

@Injectable()
export class PubSubService {
  private readonly logger = new Logger(PubSubService.name);
  private pubSubClient: PubSub;

  constructor(private readonly appSettings: AppSettings) {
    this.pubSubClient = new PubSub({
      projectId: this.appSettings.basicSettings.gcpProjectId,
    });
  }

  async publishMessage(
    topicName: string,
    data: Record<string, any>,
    attributes?: Record<string, string>,
  ): Promise<string> {
    try {
      const topic = this.pubSubClient.topic(topicName);

      // Convert data to Buffer
      const messageBuffer = Buffer.from(JSON.stringify(data));

      const message: PubsubMessage = {
        data: messageBuffer,
        attributes: attributes || {},
      };

      // Publish the message
      const messageId = await topic.publishMessage(message);

      this.logger.debug(`📤 Message published to ${topicName}: ${messageId}`);

      return messageId;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to publish message to ${topicName}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Failed to publish message to: ${String(error)}`);
      }
      throw error;
    }
  }
}
