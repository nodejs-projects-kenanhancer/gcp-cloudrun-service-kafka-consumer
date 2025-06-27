import { ConfigProviderArgs } from '../../interfaces';

export class YamlConfigProviderArgs extends ConfigProviderArgs {
  readonly type = 'file-yaml';

  constructor(readonly filePath: string) {
    super();
  }
}
