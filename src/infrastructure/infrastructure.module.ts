import { DynamicModule, Module, Type } from '@nestjs/common';
import {
  ConfigModule,
  ConfigModuleAsyncOptions,
  ConfigProviderArgs,
} from './config';
import { KafkaModule } from './kafka';
import { LoggingModule } from './logging';
import { PubSubModule } from './pubsub';

export type ConfigOptions<T> =
  | { useConfig: ConfigProviderArgs; configType: Type<T> }
  | { useAsync: ConfigModuleAsyncOptions<T>; configType: Type<T> };

export interface InfrastructureModuleOptions<T> {
  logging?: {
    context?: string;
    isGlobal?: boolean;
  };
  config: ConfigOptions<T>;
  enableKafka: boolean;
}

@Module({})
export class InfrastructureModule {
  static forRoot<T>(options: InfrastructureModuleOptions<T>): DynamicModule {
    const imports: Array<Type<any> | DynamicModule> = [];
    const exports: Array<any> = [];

    const loggingContext = options.logging?.context || 'InfrastructureModule';
    const loggingModule = LoggingModule.forRoot({
      context: loggingContext,
      isGlobal: options.logging?.isGlobal,
    });
    imports.push(loggingModule);

    // Configure config module based on which option is provided
    let configModule: DynamicModule;
    if ('useConfig' in options.config) {
      configModule = ConfigModule.forRoot<T>(
        options.config.useConfig,
        options.config.configType,
      );
    } else {
      configModule = ConfigModule.forRootAsync<T>(
        options.config.useAsync,
        options.config.configType,
      );
    }
    imports.push(configModule);
    exports.push(configModule); // Export the entire ConfigModule instead of just the type

    if (options.enableKafka) {
      imports.push(KafkaModule);
      imports.push(PubSubModule);
      exports.push(KafkaModule);
      exports.push(PubSubModule);
    }

    return {
      module: InfrastructureModule,
      imports,
      exports,
    };
  }
}
