import { ConfigProviderArgs } from '../../../interfaces';

export class GcpStorageYamlConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'gcp-storage-yaml';

  constructor(
    readonly bucketName: string,
    readonly fileName: string,
    readonly projectId: string,
  ) {
    super();
  }
}
