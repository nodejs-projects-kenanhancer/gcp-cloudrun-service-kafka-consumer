import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'dotenv';
import {
  ConfigProvider,
  ContentProvider,
  EnvConfigProcessor,
} from '../../interfaces';

@Injectable()
export class EnvConfigProvider<
  T = Record<string, any>,
> extends ConfigProvider<T> {
  private readonly logger = new Logger(EnvConfigProvider.name);

  constructor(
    private readonly contentProvider: ContentProvider,
    private readonly processor: EnvConfigProcessor,
  ) {
    super();
  }

  async getConfig(): Promise<T> {
    try {
      const content = await this.contentProvider.getContent();
      const env = parse(content);
      const result = this.processor.process<T>(env);
      return result;
    } catch (error) {
      this.logger.error(`Failed to parse .env file`, error);
      throw error;
    }
  }
}
