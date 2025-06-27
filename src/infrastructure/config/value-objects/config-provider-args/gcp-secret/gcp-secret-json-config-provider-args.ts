import { ConfigProviderArgs } from '../../../interfaces';

export class GcpSecretJsonConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'gcp-secret-json';

  constructor(
    readonly secretName: string,
    readonly projectId: string,
    readonly version: string = 'latest',
  ) {
    super();
  }
}
