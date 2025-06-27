import { Injectable, Logger } from '@nestjs/common';
import { BaseLogger } from '../interfaces/base-logger';

@Injectable()
export class DefaultLogger extends BaseLogger {
  private readonly nestLogger: Logger;

  constructor(readonly context: string) {
    super(context);
    this.nestLogger = new Logger(context);
  }

  log(message: any): void {
    this.nestLogger.log(message);
  }

  error(message: any, trace?: string): void {
    this.nestLogger.error(message, trace);
  }

  warn(message: any): void {
    this.nestLogger.warn(message);
  }

  debug(message: any): void {
    this.nestLogger.debug(message);
  }

  verbose(message: any): void {
    this.nestLogger.verbose(message);
  }
}
