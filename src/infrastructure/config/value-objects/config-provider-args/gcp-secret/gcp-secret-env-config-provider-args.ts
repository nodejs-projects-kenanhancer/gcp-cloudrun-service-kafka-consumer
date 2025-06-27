import { ConfigProviderArgs } from '../../../interfaces';

export class GcpSecretEnvConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'gcp-secret-env';

  constructor(
    readonly secretName: string,
    readonly projectId: string,
    readonly version: string = 'latest',
  ) {
    super();
  }
}
