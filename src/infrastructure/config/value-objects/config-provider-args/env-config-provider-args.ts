import { ConfigProviderArgs } from '../../interfaces';

export class EnvConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'file-env';

  constructor(readonly filePath: string) {
    super();
  }
}
