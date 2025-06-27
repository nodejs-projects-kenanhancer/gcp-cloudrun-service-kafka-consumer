import { LoggerService } from '@nestjs/common';

export abstract class BaseLogger implements LoggerService {
  constructor(readonly context: string) {}

  abstract log(message: any): void;
  abstract error(message: any, trace?: string): void;
  abstract warn(message: any): void;
  abstract debug(message: any): void;
  abstract verbose(message: any): void;
}
