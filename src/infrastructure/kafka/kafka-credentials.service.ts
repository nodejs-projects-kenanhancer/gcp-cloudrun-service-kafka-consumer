import { Injectable, Logger } from '@nestjs/common';
import { AppSettings, GcpSecretContentProvider } from '../config';

export interface KafkaCredentials {
  ca: string;
  key: string;
  cert: string;
  username: string;
  password: string;
  rejectUnauthorized: boolean;
}

@Injectable()
export class KafkaCredentialsService {
  private readonly logger = new Logger(KafkaCredentialsService.name);

  constructor(private readonly appSettings: AppSettings) {}

  async getKafkaCredentialsFromGcpSecret(): Promise<KafkaCredentials | null> {
    const {
      kafkaSettings: {
        tlsSecrets: {
          caCertSecretName,
          keySecretName,
          certSecretName,
          usernameSecretName,
          passwordSecretName,
          rejectUnauthorized,
        },
      },
      basicSettings: { gcpProjectId },
    } = this.appSettings;

    try {
      if (
        !caCertSecretName ||
        !keySecretName ||
        !certSecretName ||
        !usernameSecretName ||
        !passwordSecretName
      ) {
        this.logger.warn('TLS secret settings are not configured properly');
        return null;
      }

      // Fetch secrets in parallel for better performance
      const [ca, key, cert, username, password] = await Promise.all([
        this.getGcpSecretValue(gcpProjectId, caCertSecretName),
        this.getGcpSecretValue(gcpProjectId, keySecretName),
        this.getGcpSecretValue(gcpProjectId, certSecretName),
        this.getGcpSecretValue(gcpProjectId, usernameSecretName),
        this.getGcpSecretValue(gcpProjectId, passwordSecretName),
      ]);

      return {
        ca,
        key,
        cert,
        username,
        password,
        rejectUnauthorized,
      };
    } catch (error) {
      this.logger.error(
        'Failed to load Kafka credentials from Secret Manager:',
        error,
      );
      return null;
    }
  }

  private async getGcpSecretValue(
    projectId: string,
    secretName: string,
  ): Promise<string> {
    const provider = new GcpSecretContentProvider(secretName, projectId);
    const secret = await provider.getContent();

    return secret;
  }
}
