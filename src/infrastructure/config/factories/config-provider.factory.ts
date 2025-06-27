import { Injectable } from '@nestjs/common';
import { BaseLogger } from '../../logging';
import {
  ConfigProvider,
  ConfigProviderArgs,
  ConfigProviderType,
  EnvConfigProcessor,
} from '../interfaces';
import {
  EnvConfigProvider,
  FileContentProvider,
  GcpSecretContentProvider,
  GcpStorageContentProvider,
  JsonConfigProvider,
  YamlConfigProvider,
} from '../providers';
import {
  EnvConfigProviderArgs,
  GcpSecretEnvConfigProviderArgs,
  GcpSecretJsonConfigProviderArgs,
  GcpSecretYamlConfigProviderArgs,
  GcpStorageEnvConfigProviderArgs,
  GcpStorageJsonConfigProviderArgs,
  GcpStorageYamlConfigProviderArgs,
  JsonConfigProviderArgs,
  YamlConfigProviderArgs,
} from '../value-objects';

export type TConfigProviderFactory<T, A extends ConfigProviderArgs> = (
  args: A,
) => ConfigProvider<T>;

@Injectable()
export class ConfigProviderFactory<T> {
  private readonly registry = new Map<
    ConfigProviderType,
    TConfigProviderFactory<T, ConfigProviderArgs>
  >();
  // private readonly logger = new Logger(ConfigProviderFactory.name);

  constructor(
    private readonly envConfigProcessor: EnvConfigProcessor,
    private readonly logger: BaseLogger,
  ) {
    this.registerDefaultConfigProviders();
  }

  private registerDefaultConfigProviders(): void {
    // File providers
    this.register<JsonConfigProviderArgs>(
      'file-json',
      (args: JsonConfigProviderArgs) => {
        const contentProvider = new FileContentProvider(args.filePath);
        return new JsonConfigProvider<T>(contentProvider);
      },
    );

    this.register<YamlConfigProviderArgs>(
      'file-yaml',
      (args: YamlConfigProviderArgs) => {
        const contentProvider = new FileContentProvider(args.filePath);
        return new YamlConfigProvider<T>(contentProvider);
      },
    );

    this.register<EnvConfigProviderArgs>(
      'file-env',
      (args: EnvConfigProviderArgs) => {
        const contentProvider = new FileContentProvider(args.filePath);
        return new EnvConfigProvider<T>(
          contentProvider,
          this.envConfigProcessor,
        );
      },
    );

    // GCP Secret providers
    this.register<GcpSecretJsonConfigProviderArgs>(
      'gcp-secret-json',
      (args: GcpSecretJsonConfigProviderArgs) => {
        const provider = new GcpSecretContentProvider(
          args.secretName,
          args.projectId,
          args.version,
        );
        return new JsonConfigProvider<T>(provider);
      },
    );

    this.register<GcpSecretYamlConfigProviderArgs>(
      'gcp-secret-yaml',
      (args: GcpSecretYamlConfigProviderArgs) => {
        const provider = new GcpSecretContentProvider(
          args.secretName,
          args.projectId,
          args.version,
        );
        return new YamlConfigProvider<T>(provider);
      },
    );

    this.register<GcpSecretEnvConfigProviderArgs>(
      'gcp-secret-env',
      (args: GcpSecretEnvConfigProviderArgs) => {
        const provider = new GcpSecretContentProvider(
          args.secretName,
          args.projectId,
          args.version,
        );
        return new EnvConfigProvider<T>(provider, this.envConfigProcessor);
      },
    );

    // GCP Storage providers
    this.register<GcpStorageJsonConfigProviderArgs>(
      'gcp-storage-json',
      (args: GcpStorageJsonConfigProviderArgs) => {
        const provider = new GcpStorageContentProvider(
          args.bucketName,
          args.fileName,
        );
        return new JsonConfigProvider<T>(provider);
      },
    );

    this.register<GcpStorageYamlConfigProviderArgs>(
      'gcp-storage-yaml',
      (args: GcpStorageYamlConfigProviderArgs) => {
        const provider = new GcpStorageContentProvider(
          args.bucketName,
          args.fileName,
        );
        return new YamlConfigProvider<T>(provider);
      },
    );

    this.register<GcpStorageEnvConfigProviderArgs>(
      'gcp-storage-env',
      (args: GcpStorageEnvConfigProviderArgs) => {
        const provider = new GcpStorageContentProvider(
          args.bucketName,
          args.fileName,
        );
        return new EnvConfigProvider<T>(provider, this.envConfigProcessor);
      },
    );
  }

  register<A extends ConfigProviderArgs>(
    type: A['type'],
    factory: TConfigProviderFactory<T, A>,
  ): void {
    this.registry.set(type, factory);
    this.logger.verbose(`Registered config provider for type: ${type}`);
  }

  createConfigProvider(args: ConfigProviderArgs): ConfigProvider<T> {
    const factory = this.registry.get(args.type);

    if (!factory) {
      this.logger.error(`No config provider registered for type: ${args.type}`);
      throw new Error(`No config provider registered for type: ${args.type}`);
    }

    this.logger.debug(`Creating config provider for type: ${args.type}`);
    return factory(args);
  }
}
