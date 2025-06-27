import { Injectable, Logger } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { AppSettings } from '../config';
import { KafkaClientFactory } from './kafka-client.factory';
import { KafkaMessageProcessor } from './kafka-message.processor';

@Injectable()
export class KafkaConsumerService {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafkaClient: Kafka;
  private kafkaConsumer: Consumer;
  private isConnected = false;
  private isConsumerRunning = false;
  private connectionCheckInterval: NodeJS.Timeout;

  constructor(
    private readonly appSettings: AppSettings,
    private readonly kafkaClientFactory: KafkaClientFactory,
    private readonly kafkaMessageProcessor: KafkaMessageProcessor,
  ) {}

  initialize() {
    try {
      // Create the Kafka client
      this.kafkaClient = this.kafkaClientFactory.createClient();

      const {
        kafkaSettings: {
          consumerGroup,
          consumer: { sessionTimeout, heartbeatInterval },
        },
      } = this.appSettings;

      // Create the consumer
      this.kafkaConsumer = this.kafkaClient.consumer({
        groupId: consumerGroup,
        sessionTimeout: sessionTimeout,
        heartbeatInterval: heartbeatInterval,
      });

      this.logger.log('Kafka client and consumer initialized successfully');
    } catch (error) {
      this.logger.error(
        'Failed to initialize Kafka client and consumer',
        error,
      );
      throw error;
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      this.logger.log('Connecting to Kafka...');
      await this.kafkaConsumer.connect();
      this.isConnected = true;
      this.logger.log('Connected to Kafka successfully');
    } catch (error) {
      this.isConnected = false;
      this.logger.error(
        `Failed to connect to Kafka: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.kafkaConsumer && this.isConnected) {
      try {
        this.logger.log('Disconnecting from Kafka...');
        await this.kafkaConsumer.disconnect();
        this.isConnected = false;
        this.isConsumerRunning = false;
        this.logger.log('Disconnected from Kafka successfully');
      } catch (error) {
        this.logger.error(
          `Error disconnecting from Kafka: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  async subscribeToTopics(): Promise<void> {
    const {
      kafkaSettings: { topics, fromBeginning },
    } = this.appSettings;

    const topicsArray = topics.split(',');

    if (topicsArray.length === 0) {
      this.logger.warn('No Kafka topics configured');
      return;
    }

    this.logger.log(
      `Subscribing to topics: ${topics} (fromBeginning: ${fromBeginning})`,
    );

    try {
      for (const topic of topicsArray) {
        await this.kafkaConsumer.subscribe({
          topic,
          fromBeginning,
        });
        this.logger.log(`Subscribed to topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to Kafka topics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async startConsumer(): Promise<void> {
    if (!this.isConnected || this.isConsumerRunning) {
      return;
    }

    this.logger.log('Starting Kafka consumer...');

    try {
      this.isConsumerRunning = true;
      const {
        kafkaSettings: {
          consumer: { batchSize },
        },
      } = this.appSettings;

      await this.kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.kafkaMessageProcessor.processMessage(
            topic,
            partition,
            message,
          );
        },
        eachBatchAutoResolve: true,
        autoCommitInterval: 5000,
        autoCommitThreshold: batchSize,
        partitionsConsumedConcurrently: 1,
      });

      this.logger.log('Kafka consumer running');
    } catch (error) {
      this.isConsumerRunning = false;
      this.logger.error(
        `Error in Kafka consumer: ${error.message}`,
        error.stack,
      );

      // Try to reconnect after a delay
      const {
        kafkaSettings: {
          consumer: { retryDelay },
        },
      } = this.appSettings;
      setTimeout(() => {
        if (!this.isConsumerRunning) {
          this.startConsumer().catch((err) =>
            this.logger.error(
              `Failed to restart consumer: ${err.message}`,
              err.stack,
            ),
          );
        }
      }, retryDelay);
    }
  }

  setupConnectionMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    const {
      kafkaSettings: {
        consumer: { monitoringInterval },
      },
    } = this.appSettings;

    this.connectionCheckInterval = setInterval(async () => {
      try {
        // Use admin client to check connection
        const admin = this.kafkaClient.admin();
        await admin.connect();
        const topics = await admin.listTopics();
        await admin.disconnect();

        if (!this.isConnected) {
          this.logger.log('Connection to Kafka restored');
          this.isConnected = true;

          // Restart consumer if it was running
          if (!this.isConsumerRunning) {
            await this.startConsumer();
          }
        }
      } catch (error) {
        this.logger.error(
          `Kafka connection check failed: ${error.message}`,
          error.stack,
        );
        this.isConnected = false;
      }
    }, monitoringInterval);
  }

  isConnectedToKafka(): boolean {
    return this.isConnected && this.isConsumerRunning;
  }

  getStatus() {
    const {
      kafkaSettings: { consumerGroup, topics },
    } = this.appSettings;

    const topicsArray = topics.split(',');

    return {
      connected: this.isConnected,
      running: this.isConsumerRunning,
      topics: topicsArray,
      consumerGroup,
    };
  }

  stopConnectionMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
  }
}
