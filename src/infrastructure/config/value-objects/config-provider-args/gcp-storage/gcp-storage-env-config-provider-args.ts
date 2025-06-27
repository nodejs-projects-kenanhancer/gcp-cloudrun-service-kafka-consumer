import { ConfigProviderArgs } from '../../../interfaces';

export class GcpStorageEnvConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'gcp-storage-env';

  constructor(
    readonly bucketName: string,
    readonly fileName: string,
    readonly projectId: string,
  ) {
    super();
  }
}
