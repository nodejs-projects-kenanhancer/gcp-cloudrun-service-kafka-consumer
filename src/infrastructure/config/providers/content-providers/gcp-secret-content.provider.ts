import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Logger } from '@nestjs/common';
import { ContentProvider } from '../../interfaces';

export class GcpSecretContentProvider implements ContentProvider {
  private readonly client: SecretManagerServiceClient;
  private readonly logger = new Logger(GcpSecretContentProvider.name);

  constructor(
    private readonly secretName: string,
    private readonly projectId: string,
    private readonly version: string = 'latest',
  ) {
    this.client = new SecretManagerServiceClient();
  }

  async getContent(): Promise<string> {
    const secretPath = this.client.secretVersionPath(
      this.projectId,
      this.secretName,
      this.version,
    );

    try {
      const [response] = await this.client.accessSecretVersion({
        name: secretPath,
      });

      if (!response.payload || !response.payload.data) {
        this.logger.error(
          `Empty payload received for secret: ${this.secretName}`,
        );
        throw new Error('Secret payload is empty');
      }

      return response.payload.data.toString();
    } catch (error) {
      this.logger.error(
        `Failed to access GCP Secret ${this.secretName}`,
        error,
      );
      throw error;
    }
  }
}
