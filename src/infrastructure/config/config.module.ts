import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { ConfigProviderFactory } from './factories';
import { ConfigProviderArgs, EnvConfigProcessor } from './interfaces';
import { DefaultEnvConfigProcessor } from './processors';

export const CONFIG_PROVIDER_ARGS = Symbol('CONFIG_PROVIDER_ARGS');

export interface ConfigModuleAsyncOptions<T> {
  useFactory: (
    ...args: any[]
  ) => Promise<ConfigProviderArgs> | ConfigProviderArgs;
  inject?: any[];
}

@Global()
@Module({})
export class ConfigModule {
  static forRoot<T>(
    configProviderArgs: ConfigProviderArgs,
    configType: Type<T>,
  ): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        ConfigProviderFactory,
        {
          provide: EnvConfigProcessor,
          useClass: DefaultEnvConfigProcessor,
        },
        {
          provide: CONFIG_PROVIDER_ARGS,
          useValue: configProviderArgs,
        },
        {
          provide: configType,
          useFactory: async (
            configProviderFactory: ConfigProviderFactory<T>,
            configProviderArgs: ConfigProviderArgs,
          ) => {
            const configProvider =
              configProviderFactory.createConfigProvider(configProviderArgs);
            return await configProvider.getConfig();
          },
          inject: [ConfigProviderFactory, CONFIG_PROVIDER_ARGS],
        },
      ],
      exports: [configType],
    };
  }

  static forRootAsync<T>(
    options: ConfigModuleAsyncOptions<T>,
    configType: Type<T>,
  ): DynamicModule {
    const asyncProvider: Provider = {
      provide: CONFIG_PROVIDER_ARGS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: ConfigModule,
      providers: [
        ConfigProviderFactory,
        {
          provide: EnvConfigProcessor,
          useClass: DefaultEnvConfigProcessor,
        },
        asyncProvider,
        {
          provide: configType,
          useFactory: async (
            configProviderFactory: ConfigProviderFactory<T>,
            configProviderArgs: ConfigProviderArgs,
          ) => {
            const configProvider =
              configProviderFactory.createConfigProvider(configProviderArgs);
            return await configProvider.getConfig();
          },
          inject: [ConfigProviderFactory, CONFIG_PROVIDER_ARGS],
        },
      ],
      exports: [configType],
    };
  }
}
