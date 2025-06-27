import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'yaml';
import { ConfigProvider, ContentProvider } from '../../interfaces';

@Injectable()
export class YamlConfigProvider<
  T = Record<string, any>,
> extends ConfigProvider<T> {
  private readonly logger = new Logger(YamlConfigProvider.name);

  constructor(private readonly contentProvider: ContentProvider) {
    super();
  }

  async getConfig(): Promise<T> {
    try {
      const content = await this.contentProvider.getContent();
      const result = parse(content);
      return result as T;
    } catch (error) {
      this.logger.error(`Failed to parse YAML`, error);
      throw error;
    }
  }
}
