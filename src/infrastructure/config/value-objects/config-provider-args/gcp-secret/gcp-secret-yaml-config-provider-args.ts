import { ConfigProviderArgs } from '../../../interfaces';

export class GcpSecretYamlConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'gcp-secret-yaml';

  constructor(
    readonly secretName: string,
    readonly projectId: string,
    readonly version: string = 'latest',
  ) {
    super();
  }
}
