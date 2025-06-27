import { DynamicModule, Module } from '@nestjs/common';
import { BaseLogger } from './interfaces';
import { DefaultLogger } from './providers';

export interface LoggingModuleOptions {
  context: string;
  isGlobal?: boolean;
}

// @Global()
@Module({})
export class LoggingModule {
  static forRoot(options: LoggingModuleOptions): DynamicModule {
    const { context, isGlobal = true } = options;

    return {
      module: LoggingModule,
      global: isGlobal,
      providers: [
        {
          provide: BaseLogger,
          useFactory: () => {
            return new DefaultLogger(context);
          },
        },
      ],
      exports: [BaseLogger],
    };
  }
}
