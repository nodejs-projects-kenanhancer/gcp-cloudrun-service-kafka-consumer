import { Storage } from '@google-cloud/storage';
import { Logger } from '@nestjs/common';
import { ContentProvider } from '../../interfaces';

export class GcpStorageContentProvider implements ContentProvider {
  private readonly storage: Storage;
  private readonly logger = new Logger(GcpStorageContentProvider.name);

  constructor(
    private readonly bucketName: string,
    private readonly fileName: string,
  ) {
    this.storage = new Storage();
  }

  async getContent(): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const file = bucket.file(this.fileName);

      const [content] = await file.download();
      return content.toString();
    } catch (error) {
      this.logger.error(
        `Failed to download file ${this.fileName} from bucket ${this.bucketName}`,
        error,
      );
      throw error;
    }
  }
}
