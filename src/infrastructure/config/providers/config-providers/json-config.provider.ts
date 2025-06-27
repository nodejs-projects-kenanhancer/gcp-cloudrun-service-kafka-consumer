import { Injectable, Logger } from '@nestjs/common';
import { ConfigProvider, ContentProvider } from '../../interfaces';

@Injectable()
export class JsonConfigProvider<
  T = Record<string, any>,
> extends ConfigProvider<T> {
  private readonly logger = new Logger(JsonConfigProvider.name);

  constructor(private readonly contentProvider: ContentProvider) {
    super();
  }

  async getConfig(): Promise<T> {
    try {
      const content = await this.contentProvider.getContent();
      const result = JSON.parse(content);
      return result as T;
    } catch (error) {
      this.logger.error(`Failed to parse JSON`, error);
      throw error;
    }
  }
}
