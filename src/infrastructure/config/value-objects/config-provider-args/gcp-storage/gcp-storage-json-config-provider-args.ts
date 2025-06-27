import { ConfigProviderArgs } from '../../../interfaces';

export class GcpStorageJsonConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'gcp-storage-json';

  constructor(
    readonly bucketName: string,
    readonly fileName: string,
    readonly projectId: string,
  ) {
    super();
  }
}
