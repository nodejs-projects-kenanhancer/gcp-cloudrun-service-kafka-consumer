export type ConfigSource = 'file' | 'gcp-secret' | 'gcp-storage';

export type ConfigFormat = 'json' | 'yaml' | 'env';

export type ConfigProviderType = `${ConfigSource}-${ConfigFormat}`;

export abstract class ConfigProviderArgs {
  readonly type: ConfigProviderType;
}
