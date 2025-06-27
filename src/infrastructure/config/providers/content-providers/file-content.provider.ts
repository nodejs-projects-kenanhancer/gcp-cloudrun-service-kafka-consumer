import { Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { ContentProvider } from '../../interfaces';

export class FileContentProvider implements ContentProvider {
  private readonly logger = new Logger(FileContentProvider.name);

  constructor(private readonly filePath: string) {}

  async getContent(): Promise<string> {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      return content;
    } catch (error) {
      this.logger.error(`Failed to read file ${this.filePath}`, error);
      throw error;
    }
  }
}
